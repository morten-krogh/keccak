import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { h2b } from "./h2b.js";
import { sha3_256_0_vectors_by_id } from "./test-vectors/sha3-256_0.js";
import { sha3_512_1600_vectors_by_id } from "./test-vectors/sha3-512_1600.js";

const wasm_bytes = await readFile(new URL("./round.wasm", import.meta.url));
const round_wasm_module = await WebAssembly.compile(wasm_bytes);

/**
 * @param {Uint8Array} state_array
 * @param {number} i_round
 * @returns {Promise<Uint8Array>}
 */
async function run_wasm_round(state_array, i_round) {
	const { exports } = await WebAssembly.instantiate(round_wasm_module);
	const round_exports =
		/** @type {{ memory: WebAssembly.Memory, do_round: (i_round: number) => void }} */ (
			exports
		);
	const memory = new Uint8Array(round_exports.memory.buffer, 0, 200);
	memory.fill(0);
	memory.set(state_array);
	round_exports.do_round(i_round);
	return new Uint8Array(memory);
}

/**
 * @param {Uint8Array} state_array
 * @returns {Promise<Uint8Array>}
 */
async function run_wasm_permutation(state_array) {
	const { exports } = await WebAssembly.instantiate(round_wasm_module);
	const round_exports =
		/** @type {{ memory: WebAssembly.Memory, do_round: (i_round: number) => void }} */ (
			exports
		);
	const memory = new Uint8Array(round_exports.memory.buffer, 0, 200);
	memory.fill(0);
	memory.set(state_array);
	for (let round = 0; round < 24; round++) {
		round_exports.do_round(round);
	}
	return new Uint8Array(memory);
}

/**
 * @param {Readonly<Record<string, Readonly<{ kind: string, hex: string }>>>} vectors_by_id
 * @param {string} id
 * @returns {string}
 */
function get_state_vector_hex(vectors_by_id, id) {
	const vector = vectors_by_id[id];
	assert(vector, `Missing vector ${id}`);
	assert.equal(vector.kind, "state");
	return vector.hex;
}

/**
 * @param {string} name
 * @param {Readonly<Record<string, Readonly<{ kind: string, hex: string }>>>} vectors_by_id
 * @param {string} input_id
 * @param {string} expected_id
 * @param {number} i_round
 */
function test_wasm_round_vector(
	name,
	vectors_by_id,
	input_id,
	expected_id,
	i_round,
) {
	test(name, async (_t) => {
		const result = await run_wasm_round(
			h2b(get_state_vector_hex(vectors_by_id, input_id)),
			i_round,
		);
		assert.deepEqual(
			result,
			h2b(get_state_vector_hex(vectors_by_id, expected_id)),
		);
	});
}

for (let round = 0; round < 24; round++) {
	const input_id =
		round === 0 ? "xored-state" : `round-${round - 1}-after-iota`;
	test_wasm_round_vector(
		`WASM round sha3-256_0 round ${round}`,
		sha3_256_0_vectors_by_id,
		input_id,
		`round-${round}-after-iota`,
		round,
	);
}

test("WASM round sha3-256_0 permutation", async (_t) => {
	const result = await run_wasm_permutation(
		h2b(get_state_vector_hex(sha3_256_0_vectors_by_id, "xored-state")),
	);
	assert.deepEqual(
		result,
		h2b(get_state_vector_hex(sha3_256_0_vectors_by_id, "after-permutation")),
	);
});

for (let absorb = 0; absorb < 3; absorb++) {
	for (let round = 0; round < 24; round++) {
		const input_id =
			round === 0
				? `absorb-${absorb}-xored-state`
				: `absorb-${absorb}-round-${round - 1}-after-iota`;
		test_wasm_round_vector(
			`WASM round sha3-512_1600 absorb ${absorb} round ${round}`,
			sha3_512_1600_vectors_by_id,
			input_id,
			`absorb-${absorb}-round-${round}-after-iota`,
			round,
		);
	}

	test(`WASM round sha3-512_1600 absorb ${absorb} permutation`, async (_t) => {
		const result = await run_wasm_permutation(
			h2b(
				get_state_vector_hex(
					sha3_512_1600_vectors_by_id,
					`absorb-${absorb}-xored-state`,
				),
			),
		);
		assert.deepEqual(
			result,
			h2b(
				get_state_vector_hex(
					sha3_512_1600_vectors_by_id,
					`absorb-${absorb}-after-permutation`,
				),
			),
		);
	});
}

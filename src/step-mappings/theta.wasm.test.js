import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { h2b } from "../h2b.js";
import {
	fill_state_array_with_byte,
	make_state_array,
	set_bit_in_state_array,
} from "../state-array.js";
import { sha3_256_0_vectors_by_id } from "../test-vectors/sha3-256_0.js";
import { sha3_512_1600_vectors_by_id } from "../test-vectors/sha3-512_1600.js";

const wasm_bytes = await readFile(new URL("./theta.wasm", import.meta.url));
const theta_wasm_module = await WebAssembly.compile(wasm_bytes);

/**
 * @param {Uint8Array} state_array
 * @returns {Promise<Uint8Array>}
 */
async function run_wasm_theta(state_array) {
	const { exports } = await WebAssembly.instantiate(theta_wasm_module);
	const theta_exports =
		/** @type {{ memory_state: WebAssembly.Memory, reset_state: () => void, do_theta: () => void }} */ (
			exports
		);
	const memory = new Uint8Array(theta_exports.memory_state.buffer, 0, 200);
	theta_exports.reset_state();
	memory.set(state_array);
	theta_exports.do_theta();
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
 */
function test_wasm_theta_vector(name, vectors_by_id, input_id, expected_id) {
	test(name, async (_t) => {
		const result = await run_wasm_theta(
			h2b(get_state_vector_hex(vectors_by_id, input_id)),
		);
		assert.deepEqual(
			result,
			h2b(get_state_vector_hex(vectors_by_id, expected_id)),
		);
	});
}

test("WASM zero", async (_t) => {
	const state_array = make_state_array();
	const result = await run_wasm_theta(state_array);
	assert.deepEqual(result, state_array);
});

test("WASM single one", async (_t) => {
	const state_array = make_state_array();
	const expected = make_state_array();
	set_bit_in_state_array(state_array, 0, 0, 0, true);
	set_bit_in_state_array(expected, 0, 0, 0, true);
	for (let y = 0; y < 5; y++) {
		set_bit_in_state_array(expected, 1, y, 0, true);
		set_bit_in_state_array(expected, 4, y, 1, true);
	}

	const result = await run_wasm_theta(state_array);
	assert.deepEqual(result, expected);
});

test("WASM all one", async (_t) => {
	const state_array = make_state_array();
	fill_state_array_with_byte(state_array, 255);

	const result = await run_wasm_theta(state_array);
	assert.deepEqual(result, state_array);
});

for (let round = 0; round < 24; round++) {
	const input_id =
		round === 0 ? "xored-state" : `round-${round - 1}-after-iota`;
	const expected_id = `round-${round}-after-theta`;
	test_wasm_theta_vector(
		`WASM theta sha3-256_0 round ${round}`,
		sha3_256_0_vectors_by_id,
		input_id,
		expected_id,
	);
}

for (let absorb = 0; absorb < 3; absorb++) {
	for (let round = 0; round < 24; round++) {
		const input_id =
			round === 0
				? `absorb-${absorb}-xored-state`
				: `absorb-${absorb}-round-${round - 1}-after-iota`;
		const expected_id = `absorb-${absorb}-round-${round}-after-theta`;
		test_wasm_theta_vector(
			`WASM theta sha3-512_1600 absorb ${absorb} round ${round}`,
			sha3_512_1600_vectors_by_id,
			input_id,
			expected_id,
		);
	}
}

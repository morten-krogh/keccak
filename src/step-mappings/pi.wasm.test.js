import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { h2b } from "../h2b.js";
import {
	fill_state_array_with_byte,
	get_bit_in_state_array,
	is_zero_state_array,
	make_state_array,
	set_bit_in_state_array,
} from "../state-array.js";
import { sha3_256_0_vectors_by_id } from "../test-vectors/sha3-256_0.js";
import { sha3_512_1600_vectors_by_id } from "../test-vectors/sha3-512_1600.js";

const wasm_bytes = await readFile(new URL("./pi.wasm", import.meta.url));
const pi_wasm_module = await WebAssembly.compile(wasm_bytes);

/**
 * @param {Uint8Array} state_array
 * @returns {Promise<Uint8Array>}
 */
async function run_wasm_pi(state_array) {
	const { exports } = await WebAssembly.instantiate(pi_wasm_module);
	const pi_exports =
		/** @type {{ memory: WebAssembly.Memory, do_pi: () => void }} */ (exports);
	const memory = new Uint8Array(pi_exports.memory.buffer, 0, 200);
	memory.fill(0);
	memory.set(state_array);
	pi_exports.do_pi();
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
function test_wasm_pi_vector(name, vectors_by_id, input_id, expected_id) {
	test(name, async (_t) => {
		const result = await run_wasm_pi(
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
	const result = await run_wasm_pi(state_array);
	assert.deepEqual(result, state_array);
});

test("WASM some ones", async (_t) => {
	const state_array = make_state_array();
	set_bit_in_state_array(state_array, 0, 0, 0, true);
	set_bit_in_state_array(state_array, 1, 0, 5, true);
	set_bit_in_state_array(state_array, 3, 4, 23, true);
	set_bit_in_state_array(state_array, 3, 4, 25, true);

	const result = await run_wasm_pi(state_array);
	assert(!is_zero_state_array(result));
	assert(get_bit_in_state_array(result, 0, 0, 0));
	assert(!get_bit_in_state_array(result, 0, 0, 1));
	assert(!get_bit_in_state_array(result, 1, 0, 5));
	assert(get_bit_in_state_array(result, 0, 2, 5));
	assert(!get_bit_in_state_array(result, 0, 2, 4));
	assert(get_bit_in_state_array(result, 4, 3, 23));
	assert(!get_bit_in_state_array(result, 4, 3, 24));
	assert(get_bit_in_state_array(result, 4, 3, 25));
	assert(!get_bit_in_state_array(result, 3, 4, 23));
	assert(!get_bit_in_state_array(result, 2, 4, 25));
});

test("WASM all one", async (_t) => {
	const state_array = make_state_array();
	fill_state_array_with_byte(state_array, 255);

	const result = await run_wasm_pi(state_array);
	assert.deepEqual(result, state_array);
});

for (let round = 0; round < 24; round++) {
	test_wasm_pi_vector(
		`WASM pi sha3-256_0 round ${round}`,
		sha3_256_0_vectors_by_id,
		`round-${round}-after-rho`,
		`round-${round}-after-pi`,
	);
}

for (let absorb = 0; absorb < 3; absorb++) {
	for (let round = 0; round < 24; round++) {
		test_wasm_pi_vector(
			`WASM pi sha3-512_1600 absorb ${absorb} round ${round}`,
			sha3_512_1600_vectors_by_id,
			`absorb-${absorb}-round-${round}-after-rho`,
			`absorb-${absorb}-round-${round}-after-pi`,
		);
	}
}

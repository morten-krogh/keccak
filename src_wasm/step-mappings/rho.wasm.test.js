import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { h2b } from "../../src/h2b.js";
import {
	fill_state_array_with_byte,
	get_bit_in_state_array,
	is_zero_state_array,
	make_state_array,
	set_bit_in_state_array,
} from "../../src/state-array.js";
import { sha3_256_0_vectors_by_id } from "../test-vectors/sha3-256_0.js";
import { sha3_512_1600_vectors_by_id } from "../test-vectors/sha3-512_1600.js";

const wasm_bytes = await readFile(new URL("./rho.wasm", import.meta.url));
const rho_wasm_module = await WebAssembly.compile(wasm_bytes);

/**
 * @param {Uint8Array} state_array
 * @returns {Promise<Uint8Array>}
 */
async function run_wasm_rho(state_array) {
	const { exports } = await WebAssembly.instantiate(rho_wasm_module);
	const rho_exports =
		/** @type {{ memory: WebAssembly.Memory, do_rho: () => void }} */ (exports);
	const memory = new Uint8Array(rho_exports.memory.buffer, 0, 200);
	memory.fill(0);
	memory.set(state_array);
	rho_exports.do_rho();
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
function test_wasm_rho_vector(name, vectors_by_id, input_id, expected_id) {
	test(name, async (_t) => {
		const result = await run_wasm_rho(
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
	const result = await run_wasm_rho(state_array);
	assert.deepEqual(result, state_array);
});

test("WASM some ones", async (_t) => {
	const state_array = make_state_array();
	set_bit_in_state_array(state_array, 0, 0, 0, true);
	set_bit_in_state_array(state_array, 1, 0, 5, true);
	set_bit_in_state_array(state_array, 3, 4, 23, true);
	set_bit_in_state_array(state_array, 3, 4, 25, true);

	const result = await run_wasm_rho(state_array);
	assert(!is_zero_state_array(result));
	assert(get_bit_in_state_array(result, 0, 0, 0));
	assert(!get_bit_in_state_array(result, 0, 0, 1));
	assert(!get_bit_in_state_array(result, 1, 0, 5));
	assert(get_bit_in_state_array(result, 1, 0, 6));
	assert(!get_bit_in_state_array(result, 1, 0, 7));
	assert(!get_bit_in_state_array(result, 3, 4, 14));
	assert(get_bit_in_state_array(result, 3, 4, 15));
	assert(!get_bit_in_state_array(result, 3, 4, 16));
	assert(get_bit_in_state_array(result, 3, 4, 17));
	assert(!get_bit_in_state_array(result, 3, 4, 18));
	assert(!get_bit_in_state_array(result, 3, 4, 34));
});

test("WASM all one", async (_t) => {
	const state_array = make_state_array();
	fill_state_array_with_byte(state_array, 255);

	const result = await run_wasm_rho(state_array);
	assert.deepEqual(result, state_array);
});

for (let round = 0; round < 24; round++) {
	test_wasm_rho_vector(
		`WASM rho sha3-256_0 round ${round}`,
		sha3_256_0_vectors_by_id,
		`round-${round}-after-theta`,
		`round-${round}-after-rho`,
	);
}

for (let absorb = 0; absorb < 3; absorb++) {
	for (let round = 0; round < 24; round++) {
		test_wasm_rho_vector(
			`WASM rho sha3-512_1600 absorb ${absorb} round ${round}`,
			sha3_512_1600_vectors_by_id,
			`absorb-${absorb}-round-${round}-after-theta`,
			`absorb-${absorb}-round-${round}-after-rho`,
		);
	}
}

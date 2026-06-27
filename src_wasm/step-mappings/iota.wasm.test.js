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

const wasm_bytes = await readFile(new URL("./iota.wasm", import.meta.url));
const iota_wasm_module = await WebAssembly.compile(wasm_bytes);

/**
 * @param {Uint8Array} state_array
 * @param {number} i_round
 * @returns {Promise<Uint8Array>}
 */
async function run_wasm_iota(state_array, i_round) {
	const { exports } = await WebAssembly.instantiate(iota_wasm_module);
	const iota_exports =
		/** @type {{ memory: WebAssembly.Memory, do_iota: (i_round: number) => void }} */ (
			exports
		);
	const memory = new Uint8Array(iota_exports.memory.buffer, 0, 200);
	memory.fill(0);
	memory.set(state_array);
	iota_exports.do_iota(i_round);
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
function test_wasm_iota_vector(
	name,
	vectors_by_id,
	input_id,
	expected_id,
	i_round,
) {
	test(name, async (_t) => {
		const result = await run_wasm_iota(
			h2b(get_state_vector_hex(vectors_by_id, input_id)),
			i_round,
		);
		assert.deepEqual(
			result,
			h2b(get_state_vector_hex(vectors_by_id, expected_id)),
		);
	});
}

test("WASM round zero", async (_t) => {
	const state_array = make_state_array();
	const result = await run_wasm_iota(state_array, 0);
	assert(get_bit_in_state_array(result, 0, 0, 0));
	for (let z = 1; z < 63; z++) {
		assert(!get_bit_in_state_array(result, 0, 0, z));
	}
	assert(!get_bit_in_state_array(result, 1, 0, 0));
	assert(!get_bit_in_state_array(result, 0, 1, 0));
	assert(!get_bit_in_state_array(result, 1, 1, 0));
	assert(!get_bit_in_state_array(result, 2, 3, 0));
	assert(!get_bit_in_state_array(result, 2, 4, 0));
});

test("WASM round zero with one bit set", async (_t) => {
	const state_array = make_state_array();
	set_bit_in_state_array(state_array, 0, 0, 0, true);
	const result = await run_wasm_iota(state_array, 0);
	assert(!get_bit_in_state_array(result, 0, 0, 0));
	assert(is_zero_state_array(result));
});

test("WASM round ten with all ones", async (_t) => {
	const state_array = make_state_array();
	fill_state_array_with_byte(state_array, 255);
	const result = await run_wasm_iota(state_array, 10);
	assert(get_bit_in_state_array(result, 1, 0, 0));
	assert(get_bit_in_state_array(result, 1, 1, 1));
	assert(get_bit_in_state_array(result, 0, 1, 2));
	assert(get_bit_in_state_array(result, 4, 4, 12));
	assert(!get_bit_in_state_array(result, 0, 0, 0));
	assert(get_bit_in_state_array(result, 0, 0, 1));
	assert(!get_bit_in_state_array(result, 0, 0, 3));
	assert(get_bit_in_state_array(result, 0, 0, 7));
	assert(!get_bit_in_state_array(result, 0, 0, 15));
	assert(!get_bit_in_state_array(result, 0, 0, 31));
	assert(get_bit_in_state_array(result, 0, 0, 63));
	assert(get_bit_in_state_array(result, 0, 0, 40));
});

for (let round = 0; round < 24; round++) {
	test_wasm_iota_vector(
		`WASM iota sha3-256_0 round ${round}`,
		sha3_256_0_vectors_by_id,
		`round-${round}-after-chi`,
		`round-${round}-after-iota`,
		round,
	);
}

for (let absorb = 0; absorb < 3; absorb++) {
	for (let round = 0; round < 24; round++) {
		test_wasm_iota_vector(
			`WASM iota sha3-512_1600 absorb ${absorb} round ${round}`,
			sha3_512_1600_vectors_by_id,
			`absorb-${absorb}-round-${round}-after-chi`,
			`absorb-${absorb}-round-${round}-after-iota`,
			round,
		);
	}
}

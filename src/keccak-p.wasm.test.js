import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { h2b } from "./h2b.js";
import { is_zero_state_array, make_state_array } from "./state-array.js";
import { sha3_256_0_vectors_by_id } from "./test-vectors/sha3-256_0.js";
import { sha3_512_1600_vectors_by_id } from "./test-vectors/sha3-512_1600.js";

const wasm_bytes = await readFile(new URL("./keccak-p.wasm", import.meta.url));
const keccak_p_wasm_module = await WebAssembly.compile(wasm_bytes);

/**
 * @param {Uint8Array} state_array
 * @returns {Promise<Uint8Array>}
 */
async function run_wasm_keccak_p(state_array) {
	const { exports } = await WebAssembly.instantiate(keccak_p_wasm_module);
	const keccak_p_exports =
		/** @type {{ memory_state: WebAssembly.Memory, reset_state: () => void, keccak_p: () => void }} */ (
			exports
		);
	const memory = new Uint8Array(keccak_p_exports.memory_state.buffer, 0, 200);
	keccak_p_exports.reset_state();
	memory.set(state_array);
	keccak_p_exports.keccak_p();
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

test("WASM keccak_p from zero state array", async (_t) => {
	const state_array = make_state_array();
	assert(is_zero_state_array(state_array));
	const result = await run_wasm_keccak_p(state_array);
	assert(!is_zero_state_array(result));
});

test("WASM keccak_p sha3-256_0", async (_t) => {
	const result = await run_wasm_keccak_p(
		h2b(get_state_vector_hex(sha3_256_0_vectors_by_id, "xored-state")),
	);
	assert.deepEqual(
		result,
		h2b(get_state_vector_hex(sha3_256_0_vectors_by_id, "after-permutation")),
	);
});

for (let absorb = 0; absorb < 3; absorb++) {
	test(`WASM keccak_p sha3-512_1600 absorb ${absorb}`, async (_t) => {
		const result = await run_wasm_keccak_p(
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

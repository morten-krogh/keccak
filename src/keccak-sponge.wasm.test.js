import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { keccak } from "./keccak.js";
import { pad } from "./pad.js";

const DATA_OFFSET = 200;
const MEMORY_BYTES = 1024 * 1024;

const wasm_bytes = await readFile(
	new URL("./keccak-sponge.wasm", import.meta.url),
);
const keccak_sponge_wasm_module = await WebAssembly.compile(wasm_bytes);

/**
 * @typedef {{
 *   memory: WebAssembly.Memory,
 *   keccak_p: () => void,
 *   absorb: (c: number, m: number) => void,
 *   squeeze: (c: number, d: number) => void,
 * }} KeccakSpongeExports
 */

/**
 * @returns {Promise<KeccakSpongeExports>}
 */
async function instantiate_sponge() {
	const { exports } = await WebAssembly.instantiate(keccak_sponge_wasm_module);
	return /** @type {KeccakSpongeExports} */ (exports);
}

/**
 * @param {number} c_bytes
 * @param {Uint8Array} input
 * @param {number} d_bytes
 * @returns {Promise<Uint8Array>}
 */
async function run_wasm_keccak(c_bytes, input, d_bytes) {
	const exports = await instantiate_sponge();
	const memory = new Uint8Array(exports.memory.buffer);
	memory.fill(0);
	memory.set(input, DATA_OFFSET);
	exports.absorb(c_bytes, input.length);
	exports.squeeze(c_bytes, d_bytes);
	return memory.slice(DATA_OFFSET, DATA_OFFSET + d_bytes);
}

/**
 * @param {number} c_bytes
 * @param {Uint8Array} input
 * @param {number} d_bytes
 * @returns {Promise<Uint8Array>}
 */
function run_wasm_padded_keccak(c_bytes, input, d_bytes) {
	const rate_bits = (200 - c_bytes) * 8;
	const padded_input = pad(input, input.length * 8, rate_bits);
	return run_wasm_keccak(c_bytes, padded_input, d_bytes);
}

/**
 * @param {number} c_bytes
 * @param {Uint8Array} input
 * @param {number} d_bytes
 * @returns {Uint8Array}
 */
function run_js_keccak(c_bytes, input, d_bytes) {
	return keccak(c_bytes * 8, input, input.length * 8, d_bytes * 8);
}

test("WASM keccak sponge memory is at least 1MiB", async (_t) => {
	const exports = await instantiate_sponge();
	assert(exports.memory.buffer.byteLength >= MEMORY_BYTES);
});

test("WASM keccak sponge empty input", async (_t) => {
	const input = new Uint8Array(0);
	assert.deepEqual(
		await run_wasm_padded_keccak(64, input, 32),
		run_js_keccak(64, input, 32),
	);
});

test("WASM keccak sponge partial input", async (_t) => {
	const input = Uint8Array.from([0xaa, 0xbb, 0xcc]);
	assert.deepEqual(
		await run_wasm_padded_keccak(64, input, 64),
		run_js_keccak(64, input, 64),
	);
});

test("WASM keccak sponge last-byte padding", async (_t) => {
	const input = new Uint8Array(135).fill(0x33);
	assert.deepEqual(
		await run_wasm_padded_keccak(64, input, 32),
		run_js_keccak(64, input, 32),
	);
});

test("WASM keccak sponge exact-block padding", async (_t) => {
	const input = new Uint8Array(136).fill(0x44);
	assert.deepEqual(
		await run_wasm_padded_keccak(64, input, 32),
		run_js_keccak(64, input, 32),
	);
});

test("WASM keccak sponge multi-block squeeze", async (_t) => {
	const input = new Uint8Array(5).fill(0x55);
	assert.deepEqual(
		await run_wasm_padded_keccak(64, input, 200),
		run_js_keccak(64, input, 200),
	);
});

test("WASM keccak sponge sha3-256 empty suffixed input", async (_t) => {
	const input = Uint8Array.from([2]);
	assert.deepEqual(
		await run_wasm_padded_keccak(64, input, 32),
		run_js_keccak(64, input, 32),
	);
});

test("WASM keccak sponge sha3-512 1600-bit suffixed input", async (_t) => {
	const message = new Uint8Array(200).fill(0xa3);
	const input = new Uint8Array(message.length + 1);
	input.set(message);
	input[message.length] = 2;
	assert.deepEqual(
		await run_wasm_padded_keccak(128, input, 64),
		run_js_keccak(128, input, 64),
	);
});

test("WASM keccak sponge pre-padded block", async (_t) => {
	const padded_input = new Uint8Array(136);
	padded_input[0] = 2;
	padded_input[1] = 1;
	padded_input[135] = 0x80;
	const suffixed_input = Uint8Array.from([2]);
	assert.deepEqual(
		await run_wasm_keccak(64, padded_input, 32),
		run_js_keccak(64, suffixed_input, 32),
	);
});

test("WASM keccak sponge traps on nonmultiple input", async (_t) => {
	await assert.rejects(
		async () => run_wasm_keccak(64, Uint8Array.from([1]), 32),
		WebAssembly.RuntimeError,
	);
});

test("WASM keccak sponge traps on absorb overflow", async (_t) => {
	const exports = await instantiate_sponge();
	await assert.rejects(
		async () => exports.absorb(64, MEMORY_BYTES - DATA_OFFSET + 1),
		WebAssembly.RuntimeError,
	);
});

test("WASM keccak sponge traps on squeeze overflow", async (_t) => {
	const exports = await instantiate_sponge();
	await assert.rejects(
		async () => exports.squeeze(64, MEMORY_BYTES - DATA_OFFSET + 1),
		WebAssembly.RuntimeError,
	);
});

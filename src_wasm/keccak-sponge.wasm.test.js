import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const DATA_OFFSET = 392;
const STATE_BYTES = 200;
const MEMORY_BYTES = 1024 * 1024;

const wasm_bytes = await readFile(
	new URL("./keccak-sponge.wasm", import.meta.url),
);
const keccak_sponge_wasm_module = await WebAssembly.compile(wasm_bytes);

/**
 * @typedef {{
 *   memory: WebAssembly.Memory,
 *   absorb: (c: number, m: number, useZeroInsteadOfMemoryForInput: number) => void,
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
 * @param {string} hex
 * @returns {Uint8Array}
 */
function bytes_from_hex(hex) {
	assert.equal(hex.length % 2, 0);
	const bytes = new Uint8Array(hex.length / 2);
	for (let index = 0; index < bytes.length; index++) {
		bytes[index] = Number.parseInt(hex.slice(index * 2, index * 2 + 2), 16);
	}
	return bytes;
}

/**
 * @param {Uint8Array} bytes
 * @returns {string}
 */
function hex_from_bytes(bytes) {
	return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
		"",
	);
}

/**
 * @param {number} c_bytes
 * @param {string} padded_input_hex
 * @param {number} d_bytes
 * @returns {Promise<Uint8Array>}
 */
async function run_sponge(c_bytes, padded_input_hex, d_bytes) {
	const exports = await instantiate_sponge();
	const memory = new Uint8Array(exports.memory.buffer);
	const padded_input = bytes_from_hex(padded_input_hex);
	memory.fill(0, 0, STATE_BYTES);
	memory.set(padded_input, DATA_OFFSET);
	exports.absorb(c_bytes, padded_input.length, 0);
	exports.squeeze(c_bytes, d_bytes);
	return memory.slice(DATA_OFFSET, DATA_OFFSET + d_bytes);
}

/** @type {readonly { name: string, cBytes: number, inputHex: string, dBytes: number, expectedHex: string }[]} */
const SPONGE_CASES = Object.freeze([
	{
		name: "sha3-256 empty padded input",
		cBytes: 64,
		inputHex: `06${"00".repeat(134)}80`,
		dBytes: 32,
		expectedHex:
			"a7ffc6f8bf1ed76651c14756a061d662f580ff4de43b49fa82d80a4b80f8434a",
	},
	{
		name: "sha3-256 abc padded input",
		cBytes: 64,
		inputHex: `61626306${"00".repeat(131)}80`,
		dBytes: 32,
		expectedHex:
			"3a985da74fe225b2045c172d6bd390bd855f086e3e9d525b46bfe24511431532",
	},
	{
		name: "sha3-256 rate minus one padding",
		cBytes: 64,
		inputHex: `${"33".repeat(135)}86`,
		dBytes: 32,
		expectedHex:
			"f2975f130c63461ae4a013a39200a51a6ef351f1eb315dfac3a514eca4d71313",
	},
	{
		name: "sha3-256 exact rate padding",
		cBytes: 64,
		inputHex: `${"44".repeat(136)}06${"00".repeat(134)}80`,
		dBytes: 32,
		expectedHex:
			"83d50be7f820c7c739b4af781132703a1bc5f3b52b716cea9a09d555c79dfe18",
	},
	{
		name: "sha3-512 200-byte padded input",
		cBytes: 128,
		inputHex: `${"a3".repeat(200)}06${"00".repeat(14)}80`,
		dBytes: 64,
		expectedHex:
			"e76dfad22084a8b1467fcf2ffa58361bec7628edf5f3fdc0e4805dc48caeeca81b7c13c30adf52a3659584739a2df46be589c51ca1a4a8416df6545a1ce8ba00",
	},
	{
		name: "sha3-256 extended squeeze",
		cBytes: 64,
		inputHex: `555555555506${"00".repeat(129)}80`,
		dBytes: 200,
		expectedHex:
			"810bc5f424d5035bfd25f2877375c5eba6284b9d0cc65fea17d58d089da9f249" +
			"056e7bb4889de1bf135f001d73d94776460bf9b237fad668b32b0ef4d160e452" +
			"993da578f9643f13c743dd12c9ca78646a6e25b08c8b6ef724147031b261df0c" +
			"0245b5352d34ee128029dfe12dbbfc35f7327ec9553bf16e7f40984656aac83d" +
			"531c9238a02ae59ab1f28561d745885f21ab2f10cef2504f3b27ee5a9f149370" +
			"aefd9f0c85a612c0d95acc41f593cf3308f7189051644d020aa6be7c27a370d8" +
			"f23f7561fb4bb7f5",
	},
	{
		name: "shake128 1600-bit padded input",
		cBytes: 32,
		inputHex: `${"a3".repeat(200)}1f${"00".repeat(134)}80`,
		dBytes: 64,
		expectedHex:
			"131ab8d2b594946b9c81333f9bb6e0ce75c3b93104fa3469d3917457385da037" +
			"cf232ef7164a6d1eb448c8908186ad852d3f85a5cf28da1ab6fe343817197846",
	},
	{
		name: "shake256 1600-bit padded input",
		cBytes: 64,
		inputHex: `${"a3".repeat(200)}1f${"00".repeat(70)}80`,
		dBytes: 64,
		expectedHex:
			"cd8a920ed141aa0407a22d59288652e9d9f1a7ee0c1e7c1ca699424da84a904d" +
			"2d700caae7396ece96604440577da4f3aa22aeb8857f961c4cd8e06f0ae6610b",
	},
]);

test("WASM keccak sponge memory is at least 1MiB", async (_t) => {
	const exports = await instantiate_sponge();
	assert(exports.memory.buffer.byteLength >= MEMORY_BYTES);
});

test("WASM keccak sponge only exports sponge functions", async (_t) => {
	const exports = await instantiate_sponge();
	assert.deepEqual(Object.keys(exports).sort(), [
		"absorb",
		"memory",
		"squeeze",
	]);
});

for (const sponge_case of SPONGE_CASES) {
	test(`WASM keccak sponge ${sponge_case.name}`, async (_t) => {
		const output = await run_sponge(
			sponge_case.cBytes,
			sponge_case.inputHex,
			sponge_case.dBytes,
		);
		assert.equal(hex_from_bytes(output), sponge_case.expectedHex);
	});
}

test("WASM keccak sponge traps on nonmultiple input", async (_t) => {
	await assert.rejects(
		async () => run_sponge(64, "01", 32),
		WebAssembly.RuntimeError,
	);
});

test("WASM keccak sponge traps on absorb overflow", async (_t) => {
	const exports = await instantiate_sponge();
	await assert.rejects(
		async () => exports.absorb(64, MEMORY_BYTES - DATA_OFFSET + 1, 0),
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

test("WASM keccak sponge traps on non-8-byte absorb rate", async (_t) => {
	const exports = await instantiate_sponge();
	await assert.rejects(
		async () => exports.absorb(63, 0, 0),
		WebAssembly.RuntimeError,
	);
});

test("WASM keccak sponge traps on non-8-byte squeeze rate", async (_t) => {
	const exports = await instantiate_sponge();
	await assert.rejects(
		async () => exports.squeeze(63, 1),
		WebAssembly.RuntimeError,
	);
});

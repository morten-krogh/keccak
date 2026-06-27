import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { Shake } from "./shake.js";

const text_encoder = new TextEncoder();
const EMPTY = new Uint8Array();
const ABC = text_encoder.encode("abc");
const A3X200 = new Uint8Array(200).fill(0xa3);

const wasm_bytes = await readFile(
	new URL("./keccak-sponge.wasm", import.meta.url),
);
const wasm_url = `data:application/wasm;base64,${Buffer.from(
	wasm_bytes,
).toString("base64")}`;
const shake = await new Shake().initialize(wasm_url);

const SHAKE128_EMPTY_32 =
	"7f9c2ba4e88f827d616045507605853ed73b8093f6efbc88eb1a6eacfa66ef26";
const SHAKE256_EMPTY_64 =
	"46b9dd2b0ba88d13233b3feb743eeb243fcd52ea62b81b82b50c27646ed5762f" +
	"d75dc4ddd8c0f200cb05019d67b592f6fc821c49479ab48640292eacb3b7c4be";
const SHAKE128_ABC_32 =
	"5881092dd818bf5cf8a3ddb793fbcba74097d5c526a6d35f97b83351940f2cc8";
const SHAKE256_ABC_64 =
	"483366601360a8771c6863080cc4114d8db44530f8f1e1ee4f94ea37e78b5739" +
	"d5a15bef186a5386c75744c0527e1faa9f8726e462a12a4feb06bd8801e751e4";
const SHAKE128_A3X200_64 =
	"131ab8d2b594946b9c81333f9bb6e0ce75c3b93104fa3469d3917457385da037" +
	"cf232ef7164a6d1eb448c8908186ad852d3f85a5cf28da1ab6fe343817197846";
const SHAKE256_A3X200_64 =
	"cd8a920ed141aa0407a22d59288652e9d9f1a7ee0c1e7c1ca699424da84a904d" +
	"2d700caae7396ece96604440577da4f3aa22aeb8857f961c4cd8e06f0ae6610b";
const SHAKE128_BYTES_1_2_3_4_32 =
	"acca62acc4f531780e2e015cadbbeaf508e97134653facf3d7a0b633ec2e5b92";

/**
 * @typedef {"shake128" | "shake256"} ShakeAlgorithm
 */

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
 * @param {Shake} shake_instance
 * @param {ShakeAlgorithm} algorithm
 * @param {Uint8Array} message
 * @param {number} output_length
 * @returns {Uint8Array}
 */
function run_shake(shake_instance, algorithm, message, output_length) {
	if (algorithm === "shake128") {
		return shake_instance.shake_128(message, output_length);
	}
	return shake_instance.shake_256(message, output_length);
}

/**
 * @param {ShakeAlgorithm} algorithm
 * @param {Uint8Array} message
 * @param {number} output_length
 * @param {string} expected_hex
 */
function assert_shake_hex(algorithm, message, output_length, expected_hex) {
	assert.equal(
		hex_from_bytes(run_shake(shake, algorithm, message, output_length)),
		expected_hex,
	);
}

test("shake.js has no Node-only imports or Buffer dependency", async (_t) => {
	const source = await readFile(new URL("./shake.js", import.meta.url), "utf8");
	assert(!source.includes("node:"));
	assert(!/\bBuffer\b/.test(source));
	assert(!source.includes("Transform"));
	assert(!source.includes("readFileSync"));
});

test("shake.js only exports Shake", async (_t) => {
	const fresh = await import(`./shake.js?exports=${Date.now()}`);
	assert.deepEqual(Object.keys(fresh), ["Shake"]);
});

test("shake functions throw before initialize has initialized a WASM instance", (_t) => {
	assert.throws(() => new Shake().shake_128(EMPTY, 32), /not been initialized/);
	assert.throws(() => new Shake().shake_256(EMPTY, 64), /not been initialized/);
});

test("Shake initializes from a precompiled WebAssembly.Module", async (_t) => {
	const wasm_module = await WebAssembly.compile(wasm_bytes);
	const shake_from_module = await new Shake().initialize(wasm_module);
	assert.equal(
		hex_from_bytes(shake_from_module.shake_128(ABC, 32)),
		SHAKE128_ABC_32,
	);
});

test("shake_128 matches hard-coded vectors", (_t) => {
	assert_shake_hex("shake128", EMPTY, 32, SHAKE128_EMPTY_32);
	assert_shake_hex("shake128", ABC, 32, SHAKE128_ABC_32);
	assert_shake_hex("shake128", A3X200, 64, SHAKE128_A3X200_64);
});

test("shake_256 matches hard-coded vectors", (_t) => {
	assert_shake_hex("shake256", EMPTY, 64, SHAKE256_EMPTY_64);
	assert_shake_hex("shake256", ABC, 64, SHAKE256_ABC_64);
	assert_shake_hex("shake256", A3X200, 64, SHAKE256_A3X200_64);
});

test("shake functions support zero output length", (_t) => {
	assert.deepEqual(shake.shake_128(ABC, 0), new Uint8Array());
	assert.deepEqual(shake.shake_256(ABC, 0), new Uint8Array());
});

test("shake calls start from a clean state and return fresh bytes", (_t) => {
	const first = shake.shake_128(Buffer.from([1, 2, 3, 4]), 32);
	assert.equal(hex_from_bytes(first), SHAKE128_BYTES_1_2_3_4_32);
	first[0] = (first[0] ?? 0) ^ 0xff;

	assert_shake_hex("shake128", ABC, 32, SHAKE128_ABC_32);
	assert_shake_hex("shake128", EMPTY, 32, SHAKE128_EMPTY_32);
	assert.equal(
		hex_from_bytes(shake.shake_128(Buffer.from([1, 2, 3, 4]), 32)),
		SHAKE128_BYTES_1_2_3_4_32,
	);
});

test("shake functions throw clear errors for invalid inputs", (_t) => {
	assert.throws(
		() => shake.shake_128(/** @type {never} */ ("abc"), 32),
		TypeError,
	);
	assert.throws(
		() =>
			shake.shake_256(
				/** @type {never} */ (new DataView(new ArrayBuffer(1))),
				64,
			),
		TypeError,
	);
	assert.throws(() => shake.shake_128(EMPTY, -1), RangeError);
	assert.throws(() => shake.shake_128(EMPTY, 1.5), RangeError);
	assert.throws(() => shake.shake_128(EMPTY, Number.NaN), RangeError);
	assert.throws(() => shake.shake_256(EMPTY, 1024 * 1024 - 199), RangeError);
});

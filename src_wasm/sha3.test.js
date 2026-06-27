import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { Sha3 } from "./sha3.js";

const text_encoder = new TextEncoder();

const wasm_bytes = await readFile(
	new URL("./keccak-sponge.wasm", import.meta.url),
);
const wasm_url = `data:application/wasm;base64,${Buffer.from(
	wasm_bytes,
).toString("base64")}`;
const sha3 = await new Sha3().initialize(wasm_url);

const ABC_DIGESTS = Object.freeze({
	"sha3-224": "e642824c3f8cf24ad09234ee7d3c766fc9a3a5168d0c94ad73b46fdf",
	"sha3-256":
		"3a985da74fe225b2045c172d6bd390bd855f086e3e9d525b46bfe24511431532",
	"sha3-384":
		"ec01498288516fc926459f58e2c6ad8df9b473cb0fc08c2596da7cf0e49be4b298d88cea927ac7f539f1edf228376d25",
	"sha3-512":
		"b751850b1a57168a5693cd924b6b096e08f621827444f70d884f5d0240d2712e10e116e9192af3c91a7ec57647e3934057340b4cf408d5a56592f8274eec53f0",
});

const SHA3_256_EMPTY =
	"a7ffc6f8bf1ed76651c14756a061d662f580ff4de43b49fa82d80a4b80f8434a";
const SHA3_512_10000_INCREMENTING =
	"4f288c8f5c89abbc1a238d29e094a975dcaf0ccd7f1568a4ba876427160daf72" +
	"d25783299306b2cc095fd1524d6e82bb6a485923ff333b05ad4752fa8f8d5d5e";
const SHA3_256_BYTES_1_2_3_4 =
	"966dbdcbd0e0348faa1ccbce5a62b8e73b0d08955d666db82243b303d9bd9502";
const SHA3_256_AB =
	"5c828b33397f4762922e39a60c35699d2550466a52dd15ed44da37eb0bdc61e6";
const SHA3_256_AC =
	"c308c11c84bc9cdccc9832e3ef15fc2285bcfff0867949aa4bf03a203eee52d7";

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
 * @param {string} algorithm
 * @param {Uint8Array} input
 * @param {string} expected_hex
 */
function assert_digest_hex(algorithm, input, expected_hex) {
	assert.equal(
		hex_from_bytes(sha3.createHash(algorithm).update(input).digest()),
		expected_hex,
	);
}

test("sha3.js has no Node-only imports or Buffer dependency", async (_t) => {
	const source = await readFile(new URL("./sha3.js", import.meta.url), "utf8");
	assert(!source.includes("node:"));
	assert(!/\bBuffer\b/.test(source));
	assert(!source.includes("Transform"));
	assert(!source.includes("readFileSync"));
});

test("sha3.js only exports Sha3", async (_t) => {
	const fresh = await import(`./sha3.js?exports=${Date.now()}`);
	assert.deepEqual(Object.keys(fresh), ["Sha3"]);
});

test("createHash throws before initialize has initialized a WASM instance", (_t) => {
	assert.throws(
		() => new Sha3().createHash("sha3-256"),
		/not been initialized/,
	);
});

test("Sha3 initializes from a precompiled WebAssembly.Module", async (_t) => {
	const wasm_module = await WebAssembly.compile(wasm_bytes);
	const sha3_from_module = await new Sha3().initialize(wasm_module);
	const input = text_encoder.encode("abc");
	assert.equal(
		hex_from_bytes(
			sha3_from_module.createHash("sha3-256").update(input).digest(),
		),
		ABC_DIGESTS["sha3-256"],
	);
});

test("createHash creates Hash instances for supported SHA3 algorithms", (_t) => {
	const input = text_encoder.encode("abc");
	for (const [algorithm, expected_hex] of Object.entries(ABC_DIGESTS)) {
		const hash = sha3.createHash(algorithm);
		assert.equal(hash.constructor.name, "Hash");
		assert.equal(hash.algorithm, algorithm);
		assert.equal(hex_from_bytes(hash.update(input).digest()), expected_hex);
	}
});

test("createHash accepts case-insensitive algorithm names", (_t) => {
	assert_digest_hex(
		"SHA3-256",
		text_encoder.encode("abc"),
		ABC_DIGESTS["sha3-256"],
	);
});

test("Hash matches hard-coded digests for empty and long inputs", (_t) => {
	assert.equal(
		hex_from_bytes(sha3.createHash("sha3-256").digest()),
		SHA3_256_EMPTY,
	);

	const input = new Uint8Array(10_000);
	for (let i = 0; i < input.length; i++) {
		input[i] = i & 0xff;
	}
	assert_digest_hex("sha3-512", input, SHA3_512_10000_INCREMENTING);
});

test("Hash supports chunked Uint8Array updates", (_t) => {
	const a = text_encoder.encode("a");
	const b = text_encoder.encode("b");
	const c = text_encoder.encode("c");
	const hash = sha3.createHash("sha3-256");
	assert.equal(hash.update(a), hash);
	hash.update(b);
	hash.update(c);
	assert.equal(hex_from_bytes(hash.digest()), ABC_DIGESTS["sha3-256"]);
});

test("Hash accepts Buffer as a Uint8Array subclass in Node", (_t) => {
	const input = Buffer.from([1, 2, 3, 4]);
	assert(input instanceof Uint8Array);
	assert_digest_hex("sha3-256", input, SHA3_256_BYTES_1_2_3_4);
});

test("Hash digest returns a fresh Uint8Array", (_t) => {
	const input = text_encoder.encode("abc");
	const digest = sha3.createHash("sha3-256").update(input).digest();
	assert(digest instanceof Uint8Array);
	assert(!(digest instanceof Buffer));
	assert.equal(hex_from_bytes(digest), ABC_DIGESTS["sha3-256"]);
});

test("Hash copy clones the current hash state", (_t) => {
	const a = text_encoder.encode("a");
	const b = text_encoder.encode("b");
	const c = text_encoder.encode("c");
	const hash = sha3.createHash("sha3-256").update(a);
	const copy = hash.copy();
	assert.equal(copy.constructor.name, "Hash");

	hash.update(b);
	copy.update(c);

	assert.equal(hex_from_bytes(hash.digest()), SHA3_256_AB);
	assert.equal(hex_from_bytes(copy.digest()), SHA3_256_AC);
});

test("Hash throws clear errors for unsupported, non-Uint8Array, and finalized usage", (_t) => {
	assert.throws(
		() => sha3.createHash("sha3-999"),
		/Digest method not supported/,
	);
	assert.throws(
		() => sha3.createHash("sha3-256").update(/** @type {never} */ ("abc")),
		TypeError,
	);
	assert.throws(
		() =>
			sha3
				.createHash("sha3-256")
				.update(/** @type {never} */ (new DataView(new ArrayBuffer(1)))),
		TypeError,
	);

	const hash = sha3.createHash("sha3-256");
	hash.update(text_encoder.encode("abc"));
	hash.digest();
	assert.throws(() => hash.digest(), /Digest already called/);
	assert.throws(() => hash.update(new Uint8Array([1])), /digest\(\)/);
	assert.throws(() => hash.copy(), /digest\(\)/);
});

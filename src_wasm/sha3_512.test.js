import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { Sha3_512 } from "./sha3_512.js";

const text_encoder = new TextEncoder();

const wasm_bytes = await readFile(new URL("./sha3_512.wasm", import.meta.url));
const wasm_url = `data:application/wasm;base64,${Buffer.from(
	wasm_bytes,
).toString("base64")}`;
const sha3_512 = await new Sha3_512().initialize(wasm_url);

const SHA3_512_EMPTY =
	"a69f73cca23a9ac5c8b567dc185a756e97c982164fe25859e0d1dcc1475c80" +
	"a615b2123af1f5f94c11e3e9402c3ac558f500199d95b6d3e301758586281dcd26";
const SHA3_512_ABC =
	"b751850b1a57168a5693cd924b6b096e08f621827444f70d884f5d0240d271" +
	"2e10e116e9192af3c91a7ec57647e3934057340b4cf408d5a56592f8274eec53f0";
const SHA3_512_10000_INCREMENTING =
	"4f288c8f5c89abbc1a238d29e094a975dcaf0ccd7f1568a4ba876427160daf72" +
	"d25783299306b2cc095fd1524d6e82bb6a485923ff333b05ad4752fa8f8d5d5e";
const SHA3_512_BYTES_1_2_3_4 =
	"83cfb39e1a9f383d6ceceb51f77b4a3145c9827c9173586b9ea407098f001e18" +
	"ac751a292d00974985f1ba4e6d7b1dbb0d3732d83f2fc6e44f8fea837521bc1d";
const SHA3_512_AB =
	"01c87b5e8f094d8725ed47be35430de40f6ab6bd7c6641a4ecf0d046c55cb468" +
	"453796bb61724306a5fb3d90fbe3726a970e5630ae6a9cf9f30d2aa062a0175e";
const SHA3_512_AC =
	"08c3e7914bc4711b7598c7529642642352a3a34da6d8c4664517568c89665f15" +
	"1ea3d58fb4974eefcdade673d0918ef3449da83f8568f8cb10ee7274f47675a9";

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
 * @param {Uint8Array} input
 * @param {string} expected_hex
 */
function assert_digest_hex(input, expected_hex) {
	assert.equal(
		hex_from_bytes(sha3_512.createHash().update(input).digest()),
		expected_hex,
	);
}

test("sha3_512.js has no Node-only imports or Buffer dependency", async (_t) => {
	const source = await readFile(
		new URL("./sha3_512.js", import.meta.url),
		"utf8",
	);
	assert(!source.includes("node:"));
	assert(!/\bBuffer\b/.test(source));
	assert(!source.includes("Transform"));
	assert(!source.includes("readFileSync"));
});

test("sha3_512.js only exports Sha3_512", async (_t) => {
	const fresh = await import(`./sha3_512.js?exports=${Date.now()}`);
	assert.deepEqual(Object.keys(fresh), ["Sha3_512"]);
});

test("createHash throws before initialize has initialized a WASM instance", (_t) => {
	assert.throws(() => new Sha3_512().createHash(), /not been initialized/);
});

test("Sha3_512 initializes from a precompiled WebAssembly.Module", async (_t) => {
	const wasm_module = await WebAssembly.compile(wasm_bytes);
	const sha3_512_from_module = await new Sha3_512().initialize(wasm_module);
	assert.equal(
		hex_from_bytes(
			sha3_512_from_module
				.createHash()
				.update(text_encoder.encode("abc"))
				.digest(),
		),
		SHA3_512_ABC,
	);
});

test("createHash creates SHA3-512 Hash instances", (_t) => {
	const hash = sha3_512.createHash();
	assert.equal(hash.constructor.name, "Hash");
	assert.equal(hash.algorithm, "sha3-512");
	assert.equal(
		hex_from_bytes(hash.update(text_encoder.encode("abc")).digest()),
		SHA3_512_ABC,
	);
});

test("Hash matches hard-coded digests for empty and long inputs", (_t) => {
	assert.equal(hex_from_bytes(sha3_512.createHash().digest()), SHA3_512_EMPTY);

	const input = new Uint8Array(10_000);
	for (let i = 0; i < input.length; i++) {
		input[i] = i & 0xff;
	}
	assert_digest_hex(input, SHA3_512_10000_INCREMENTING);
});

test("Hash supports chunked Uint8Array updates", (_t) => {
	const a = text_encoder.encode("a");
	const b = text_encoder.encode("b");
	const c = text_encoder.encode("c");
	const hash = sha3_512.createHash();
	assert.equal(hash.update(a), hash);
	hash.update(b);
	hash.update(c);
	assert.equal(hex_from_bytes(hash.digest()), SHA3_512_ABC);
});

test("Hash accepts Buffer as a Uint8Array subclass in Node", (_t) => {
	const input = Buffer.from([1, 2, 3, 4]);
	assert(input instanceof Uint8Array);
	assert_digest_hex(input, SHA3_512_BYTES_1_2_3_4);
});

test("Hash digest returns a fresh Uint8Array", (_t) => {
	const input = text_encoder.encode("abc");
	const digest = sha3_512.createHash().update(input).digest();
	assert(digest instanceof Uint8Array);
	assert(!(digest instanceof Buffer));
	assert.equal(hex_from_bytes(digest), SHA3_512_ABC);
});

test("Hash copy clones the current hash state", (_t) => {
	const a = text_encoder.encode("a");
	const b = text_encoder.encode("b");
	const c = text_encoder.encode("c");
	const hash = sha3_512.createHash().update(a);
	const copy = hash.copy();
	assert.equal(copy.constructor.name, "Hash");

	hash.update(b);
	copy.update(c);

	assert.equal(hex_from_bytes(hash.digest()), SHA3_512_AB);
	assert.equal(hex_from_bytes(copy.digest()), SHA3_512_AC);
});

test("Hash throws clear errors for non-Uint8Array and finalized usage", (_t) => {
	assert.throws(
		() => sha3_512.createHash().update(/** @type {never} */ ("abc")),
		TypeError,
	);
	assert.throws(
		() =>
			sha3_512
				.createHash()
				.update(/** @type {never} */ (new DataView(new ArrayBuffer(1)))),
		TypeError,
	);

	const hash = sha3_512.createHash();
	hash.update(text_encoder.encode("abc"));
	hash.digest();
	assert.throws(() => hash.digest(), /Digest already called/);
	assert.throws(() => hash.update(new Uint8Array([1])), /digest\(\)/);
	assert.throws(() => hash.copy(), /digest\(\)/);
});

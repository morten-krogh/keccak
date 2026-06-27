import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import { createHash as createNodeHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { Sha3 } from "./sha3.js";

const ALGORITHMS = ["sha3-224", "sha3-256", "sha3-384", "sha3-512"];
const text_encoder = new TextEncoder();

const wasm_bytes = await readFile(
	new URL("./keccak-sponge.wasm", import.meta.url),
);
const wasm_url = `data:application/wasm;base64,${Buffer.from(
	wasm_bytes,
).toString("base64")}`;
const sha3 = await new Sha3().initialize(wasm_url);

/**
 * @param {string} algorithm
 * @param {readonly Uint8Array[]} chunks
 * @returns {Uint8Array}
 */
function node_hash_bytes(algorithm, chunks) {
	const hash = createNodeHash(algorithm);
	for (const chunk of chunks) {
		hash.update(chunk);
	}
	return new Uint8Array(hash.digest());
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
	assert.deepEqual(
		sha3_from_module.createHash("sha3-256").update(input).digest(),
		node_hash_bytes("sha3-256", [input]),
	);
});

test("createHash creates Hash instances for supported SHA3 algorithms", (_t) => {
	const input = text_encoder.encode("abc");
	for (const algorithm of ALGORITHMS) {
		const hash = sha3.createHash(algorithm);
		assert.equal(hash.constructor.name, "Hash");
		assert.equal(hash.algorithm, algorithm);
		assert.deepEqual(
			hash.update(input).digest(),
			node_hash_bytes(algorithm, [input]),
		);
	}
});

test("createHash accepts case-insensitive algorithm names", (_t) => {
	const input = text_encoder.encode("abc");
	assert.deepEqual(
		sha3.createHash("SHA3-256").update(input).digest(),
		node_hash_bytes("sha3-256", [input]),
	);
});

test("Hash matches Node crypto for empty and long inputs", (_t) => {
	assert.deepEqual(
		sha3.createHash("sha3-256").digest(),
		node_hash_bytes("sha3-256", []),
	);

	const input = new Uint8Array(10_000);
	for (let i = 0; i < input.length; i++) {
		input[i] = i & 0xff;
	}
	assert.deepEqual(
		sha3.createHash("sha3-512").update(input).digest(),
		node_hash_bytes("sha3-512", [input]),
	);
});

test("Hash supports chunked Uint8Array updates", (_t) => {
	const a = text_encoder.encode("a");
	const b = text_encoder.encode("b");
	const c = text_encoder.encode("c");
	const hash = sha3.createHash("sha3-256");
	assert.equal(hash.update(a), hash);
	hash.update(b);
	hash.update(c);
	assert.deepEqual(hash.digest(), node_hash_bytes("sha3-256", [a, b, c]));
});

test("Hash accepts Buffer as a Uint8Array subclass in Node", (_t) => {
	const input = Buffer.from([1, 2, 3, 4]);
	assert(input instanceof Uint8Array);
	assert.deepEqual(
		sha3.createHash("sha3-256").update(input).digest(),
		node_hash_bytes("sha3-256", [input]),
	);
});

test("Hash digest returns a fresh Uint8Array", (_t) => {
	const input = text_encoder.encode("abc");
	const digest = sha3.createHash("sha3-256").update(input).digest();
	assert(digest instanceof Uint8Array);
	assert(!(digest instanceof Buffer));
	assert.deepEqual(digest, node_hash_bytes("sha3-256", [input]));
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

	assert.deepEqual(hash.digest(), node_hash_bytes("sha3-256", [a, b]));
	assert.deepEqual(copy.digest(), node_hash_bytes("sha3-256", [a, c]));
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

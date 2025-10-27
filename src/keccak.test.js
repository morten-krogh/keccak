import assert from "node:assert/strict";
import test from "node:test";
import { keccak } from "./keccak.js";

test("keccak zero", (_t) => {
	const c = 256;
	const N = new Uint8Array(0);
	const m = 0;
	const d = 0;
	const Z = keccak(c, N, m, d);
	assert.equal(Z.length, 0);
});

test("keccak empty input", (_t) => {
	const c = 256;
	const N = new Uint8Array(0);
	const m = 0;
	const d = 1400;
	const Z = keccak(c, N, m, d);
	assert.equal(Z.length, d / 8);
});

test("keccak input", (_t) => {
	const c = 256;
	const N = new Uint8Array(180);
	N[0] = 255;
	N[1] = 201;
	N[179] = 123;
	N[180] = 255;
	const m = 1441;
	const d = 16;
	const Z = keccak(c, N, m, d);
	assert.equal(Z.length, d / 8);
});

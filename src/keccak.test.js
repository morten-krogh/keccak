import assert from "node:assert/strict";
import test from "node:test";
import { keccak } from "./keccak.js";

test("keccak", (_t) => {
	const r = 1344;
	const N = new Uint8Array(0);
	const m = 0;
	const d = 0;
	const Z = keccak(r, N, m, d);
	assert.equal(Z.length, 0);
});

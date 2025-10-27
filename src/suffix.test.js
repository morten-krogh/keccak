import assert from "node:assert/strict";
import test from "node:test";
import { append_suffix } from "./suffix.js";

test("append suffix", (_t) => {
	const N0 = new Uint8Array(0);
	const M0 = append_suffix(N0, [100]);
	assert.equal(M0.length, 1);
	assert.equal(M0[0], 100);
	const N1 = new Uint8Array([200, 201]);
	const M1 = append_suffix(N1, [50, 60]);
	assert.equal(M1.length, 4);
	assert.equal(M1[0], 200);
	assert.equal(M1[1], 201);
	assert.equal(M1[2], 50);
	assert.equal(M1[3], 60);
});

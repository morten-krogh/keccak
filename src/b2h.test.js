import assert from "node:assert/strict";
import test from "node:test";
import { b2h } from "./b2h.js";

test("b2h enpty", (_t) => {
	const b = new Uint8Array();
	const h = b2h(b);
	assert.equal(h, "");
});

test("b2h single zero", (_t) => {
	const b = new Uint8Array([0]);
	const h = b2h(b);
	assert.equal(h, "00");
});

test("b2h single", (_t) => {
	const b = new Uint8Array([171]);
	const h = b2h(b);
	assert.equal(h, "AB");
});

test("b2h double", (_t) => {
	const b = new Uint8Array([163, 46]);
	const h = b2h(b);
	assert.equal(h, "A32E");
});

import assert from "node:assert/strict";
import test from "node:test";
import { h2b } from "./h2b.js";

test("h2b", (_t) => {
        const h = "";
        const b = h2b(h);
        assert.equal(b.length, 0);
});

test("h2b", (_t) => {
        const h = "A32E";
        const b = h2b(h);
        assert.equal(b.length, 2);
        assert.equal(b[0], 163);
        assert.equal(b[1], 46);
});

test("h2b", (_t) => {
        const h = "ab";
        const b = h2b(h);
        assert.equal(b.length, 1);
        assert.equal(b[0], 171);
});

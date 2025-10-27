import assert from "node:assert/strict";
import test from "node:test";
import { pad } from "./padding.js";

test("padding length < 8", (_t) => {
        const N0 = new Uint8Array([0]);
        const padded_0 = pad(N0, 1, 8);
        assert.equal(padded_0.length, 1);
        assert.equal(padded_0[0], 130);
        const padded_1 = pad(N0, 2, 8);
        assert.equal(padded_1.length, 1);
        assert.equal(padded_1[0], 132);
        const padded_2 = pad(N0, 6, 8);
        assert.equal(padded_2.length, 1);
        assert.equal(padded_2[0], 192);
        const N1 = new Uint8Array([255]);
        const padded_3 = pad(N1, 4, 8);
        assert.equal(padded_3.length, 1);
        assert.equal(padded_3[0], 159);
});

test("padding length = 8", (_t) => {
        const N0 = new Uint8Array(0);
        const padded_0 = pad(N0, 0, 8);
        assert.equal(padded_0.length, 1);
        assert.equal(padded_0[0], 129);
});

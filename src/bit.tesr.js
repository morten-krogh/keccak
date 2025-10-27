import assert from "node:assert/strict";
import test from "node:test";
import { get_bit, set_bit } from "./bit.js";

test("bit test", (_t) => {
        const array = new Uint8Array([0, 0]);
        assert.equal(get_bit(array, 0), false);
        assert.equal(get_bit(array, 10), false);
        assert.equal(get_bit(array, 15), false);
        set_bit(array, 0, true);
        assert.equal(get_bit(array, 0), true);
        assert.equal(get_bit(array, 10), false);
        set_bit(array, 7, true);
        assert.equal(get_bit(array, 0), true);
        assert.equal(get_bit(array, 7), true);
        assert.equal(get_bit(array, 10), false);
        set_bit(array, 10, false);
        assert.equal(get_bit(array, 10), false);
        set_bit(array, 10, true);
        assert.equal(get_bit(array, 10), true);
        set_bit(array, 7, false);
        assert.equal(get_bit(array, 7), false);
        assert.equal(get_bit(array, 10), true);
});

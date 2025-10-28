import assert from "node:assert/strict";
import test from "node:test";
import { hex_get_bit } from "./hex.js";

test("hex get bit", (_t) => {
        const hex = "1ab4";
        assert(!hex_get_bit(hex, 0));
        assert(!hex_get_bit(hex, 1));
        assert(hex_get_bit(hex, 2));
        assert(!hex_get_bit(hex, 3));
        assert(hex_get_bit(hex, 4));
        assert(hex_get_bit(hex, 5));
        assert(!hex_get_bit(hex, 6));
        assert(hex_get_bit(hex, 7));
});

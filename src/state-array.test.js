import assert from "node:assert/strict";
import test from "node:test";
import { remove_whitespace } from "./format.js";
import { h2b } from "./h2b.js";
import { hex_get_bit } from "./hex.js";
import {
	add_bit_in_state_array,
	get_bit_in_state_array,
	is_zero_state_array,
	make_state_array,
	set_bit_in_state_array,
} from "./state-array.js";

test("make state array", (_t) => {
	const state_array = make_state_array();
	assert.equal(state_array.length, 200);
	for (let i = 0; i < 200; i++) {
		const byte = state_array[i];
		assert.equal(byte, 0);
	}
	assert(is_zero_state_array(state_array));
});

test("get bit in state array", (_t) => {
	const state_array = make_state_array();
	for (let x = 0; x < 5; x++) {
		for (let y = 0; y < 5; y++) {
			for (let z = 0; z < 64; z++) {
				assert(!get_bit_in_state_array(state_array, x, y, z));
			}
		}
	}
	state_array[0] = 1;
	assert(get_bit_in_state_array(state_array, 0, 0, 0));
	assert(!get_bit_in_state_array(state_array, 0, 0, 1));
	state_array[0] = 3;
	assert(get_bit_in_state_array(state_array, 0, 0, 0));
	assert(get_bit_in_state_array(state_array, 0, 0, 1));
	state_array[1] = 1;
	assert(get_bit_in_state_array(state_array, 0, 0, 8));
	state_array[8] = 4;
	assert(!get_bit_in_state_array(state_array, 1, 0, 1));
	assert(get_bit_in_state_array(state_array, 1, 0, 2));
	state_array[109] = 128;
	assert(get_bit_in_state_array(state_array, 3, 2, 47));
	state_array[199] = 160;
	assert(get_bit_in_state_array(state_array, 4, 4, 61));
	assert(!get_bit_in_state_array(state_array, 4, 4, 62));
	assert(get_bit_in_state_array(state_array, 4, 4, 63));
	assert(!is_zero_state_array(state_array));
});

test("set_bit in state array", (_t) => {
	const state_array = make_state_array();
	assert.equal(state_array[0], 0);
	set_bit_in_state_array(state_array, 0, 0, 0, true);
	assert(!is_zero_state_array(state_array));
	assert.equal(state_array[0], 1);
	set_bit_in_state_array(state_array, 0, 0, 1, true);
	assert.equal(state_array[0], 3);
	set_bit_in_state_array(state_array, 0, 0, 1, false);
	assert.equal(state_array[0], 1);
	set_bit_in_state_array(state_array, 0, 0, 0, false);
	assert.equal(state_array[0], 0);
	assert.equal(state_array[109], 0);
	assert(is_zero_state_array(state_array));
	set_bit_in_state_array(state_array, 3, 2, 47, true);
	assert.equal(state_array[109], 128);
	assert(!is_zero_state_array(state_array));
	set_bit_in_state_array(state_array, 3, 2, 47, false);
	assert.equal(state_array[109], 0);
	assert(is_zero_state_array(state_array));
});

test("get and set bits in state array", (_t) => {
	const state_array = make_state_array();
	for (let x = 0; x < 5; x++) {
		for (let y = 0; y < 5; y++) {
			for (let z = 0; z < 64; z++) {
				assert(!get_bit_in_state_array(state_array, x, y, z));
				set_bit_in_state_array(state_array, x, y, z, true);
				assert(get_bit_in_state_array(state_array, x, y, z));
				set_bit_in_state_array(state_array, x, y, z, false);
				assert(!get_bit_in_state_array(state_array, x, y, z));
			}
		}
	}
});

test("add get and set bits in state array", (_t) => {
	const state_array = make_state_array();
	for (let x = 0; x < 5; x++) {
		for (let y = 0; y < 5; y++) {
			for (let z = 0; z < 64; z++) {
				assert(!get_bit_in_state_array(state_array, x, y, z));
				add_bit_in_state_array(state_array, x, y, z, true);
				assert(get_bit_in_state_array(state_array, x, y, z));
				add_bit_in_state_array(state_array, x, y, z, true);
				assert(!get_bit_in_state_array(state_array, x, y, z));
				add_bit_in_state_array(state_array, x, y, z, false);
				assert(!get_bit_in_state_array(state_array, x, y, z));
			}
		}
	}
});

test("test vector", (_t) => {
	// From the file sha3-256_0.pdf
	const hex_readable = `
                A7 FF C6 F8 BF 1E D7 66 51 C1 47 56 A0 61 D6 62
                F5 80 FF 4D E4 3B 49 FA 82 D8 0A 4B 80 F8 43 4A
                52 66 BE B7 34 6B F3 E2 66 95 CC CA 21 59 87 FF
                89 BA B3 76 57 7B D9 80 3B 31 6A FC 55 BD DE 28
                CC 8E E4 F1 19 3D AC 03 E9 34 E4 C1 EC 3A 19 78
                79 1E E8 AF 23 A9 87 C2 33 1F 60 01 E3 4A 68 21
                5F E7 09 9E 46 7E 2E 28 B8 B6 82 C2 D2 1E 7D D1
                4E 43 AF AD D2 E0 50 F0 B0 89 A9 6A FB F6 75 53
                1E F1 FA 32 60 B9 C6 C2 B2 A1 55 F0 D3 4D 68 63
                B2 C2 8E 98 8B 39 08 D9 26 D3 0B 3E 90 10 3F 91
                17 98 47 4D 66 34 FC 33 58 DE 8F 07 1A 5C 71 2B
                79 97 36 51 92 7C 0B 14 5E EB BD AA A7 43 73 85
                E5 70 7B FB 0E 6E 13 92
        `;
	const hex = remove_whitespace(hex_readable);
	const state_array = h2b(hex);
	// [0, 0] = 66d71ebff8c6ffa7
	const expected_hex_0_0 = "66d71ebff8c6ffa7";
	for (let i = 0; i < 64; i++) {
		const bit = get_bit_in_state_array(state_array, 0, 0, i);
		const expected_bit = hex_get_bit(expected_hex_0_0, i);
		assert.equal(bit, expected_bit);
	}
	// [4, 1] = 78193aecc1e434e9
	const expected_hex_4_1 = "78193aecc1e434e9";
	for (let i = 0; i < 64; i++) {
		const bit = get_bit_in_state_array(state_array, 4, 1, i);
		const expected_bit = hex_get_bit(expected_hex_4_1, i);
		assert.equal(bit, expected_bit);
	}
});

import assert from "node:assert/strict";
import test from "node:test";
import { b2h } from "../b2h.js";
import { remove_whitespace } from "../format.js";
import { h2b } from "../h2b.js";
import {
	fill_state_array_with_byte,
	get_bit_in_state_array,
	is_zero_state_array,
	make_state_array,
	set_bit_in_state_array,
} from "../state-array.js";
import { do_theta } from "./theta.js";

test("Zero", (_t) => {
	const state_array = make_state_array();
	const scratch_space = make_state_array();
	do_theta(state_array, scratch_space);
	assert(is_zero_state_array(state_array));
});

test("Single one", (_t) => {
	const state_array = make_state_array();
	const scratch_space = make_state_array();
	set_bit_in_state_array(state_array, 0, 0, 0, true);
	do_theta(state_array, scratch_space);
	assert(!is_zero_state_array(state_array));
	assert(get_bit_in_state_array(state_array, 0, 0, 0));
	assert(!get_bit_in_state_array(state_array, 0, 1, 0));
	assert(!get_bit_in_state_array(state_array, 0, 2, 0));
	assert(!get_bit_in_state_array(state_array, 0, 3, 0));
	assert(!get_bit_in_state_array(state_array, 0, 4, 0));
	assert(get_bit_in_state_array(state_array, 1, 0, 0));
	assert(get_bit_in_state_array(state_array, 1, 1, 0));
	assert(get_bit_in_state_array(state_array, 1, 2, 0));
	assert(get_bit_in_state_array(state_array, 1, 3, 0));
	assert(get_bit_in_state_array(state_array, 1, 4, 0));
	assert(!get_bit_in_state_array(state_array, 1, 0, 1));
	assert(!get_bit_in_state_array(state_array, 1, 0, 2));
	assert(!get_bit_in_state_array(state_array, 1, 0, 3));
	assert(!get_bit_in_state_array(state_array, 1, 0, 4));
	assert(!get_bit_in_state_array(state_array, 2, 0, 0));
	assert(!get_bit_in_state_array(state_array, 3, 0, 0));
	assert(!get_bit_in_state_array(state_array, 3, 0, 1));
	assert(!get_bit_in_state_array(state_array, 4, 0, 0));
	assert(!get_bit_in_state_array(state_array, 4, 1, 0));
	assert(get_bit_in_state_array(state_array, 4, 0, 1));
	assert(get_bit_in_state_array(state_array, 4, 1, 1));
	assert(!get_bit_in_state_array(state_array, 4, 2, 2));
});

test("All one", (_t) => {
	const state_array = make_state_array();
	const scratch_space = make_state_array();
	fill_state_array_with_byte(state_array, 255);
	do_theta(state_array, scratch_space);
	for (let x = 0; x < 5; x++) {
		for (let y = 0; y < 5; y++) {
			for (let z = 0; z < 64; z++) {
				assert(get_bit_in_state_array(state_array, x, y, z));
			}
		}
	}
});

test("NIST test 1", (_t) => {
	const hex_before_raw = `
                06 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
                00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
                00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
                00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
                00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
                00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
                00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
                00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
                00 00 00 00 00 00 00 80 00 00 00 00 00 00 00 00
                00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
                00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
                00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
                00 00 00 00 00 00 00 00
        `;
	const hex_after_raw = `
                07 00 00 00 00 00 00 00 06 00 00 00 00 00 00 00
                00 00 00 00 00 00 00 80 00 00 00 00 00 00 00 00
                0C 00 00 00 00 00 00 00 01 00 00 00 00 00 00 00
                06 00 00 00 00 00 00 00 00 00 00 00 00 00 00 80
                00 00 00 00 00 00 00 00 0C 00 00 00 00 00 00 00
                01 00 00 00 00 00 00 00 06 00 00 00 00 00 00 00
                00 00 00 00 00 00 00 80 00 00 00 00 00 00 00 00
                0C 00 00 00 00 00 00 00 01 00 00 00 00 00 00 00
                06 00 00 00 00 00 00 80 00 00 00 00 00 00 00 80
                00 00 00 00 00 00 00 00 0C 00 00 00 00 00 00 00
                01 00 00 00 00 00 00 00 06 00 00 00 00 00 00 00
                00 00 00 00 00 00 00 80 00 00 00 00 00 00 00 00
                0C 00 00 00 00 00 00 00
        `;
	const hex_before = remove_whitespace(hex_before_raw);
	const hex_after = remove_whitespace(hex_after_raw);
	const state_array = h2b(hex_before);
	const scratch_space = make_state_array();
	do_theta(state_array, scratch_space);
	const hex_result = b2h(state_array);
	assert.equal(hex_result.length, 400);
	assert.equal(hex_after.length, 400);
	assert.equal(hex_result, hex_after);
});

test("NIST test 2", (_t) => {
	const hex_before_raw = `
	        FE 98 C7 01 30 96 20 14 14 06 66 09 2B 21 8E A2
                06 5E A1 1B 00 BA 21 17 66 00 44 0C 1B 35 0D 44
                00 DE 25 13 00 08 02 D7 82 CF 08 79 06 90 18 80
                0C 0C 35 C0 07 4C 0E 2D 24 D1 24 12 C2 23 08 80
                23 08 C2 63 84 D1 1C CD 88 1A EF 98 43 2E 02 A8
                44 50 5C 08 08 DE 02 40 F4 01 29 30 B0 04 91 00
                80 C1 E0 B9 36 17 03 58 20 1F 60 80 A0 D8 D6 00
                94 CF C1 51 2E 05 85 18 B0 0D 80 43 60 1B 00 05
                00 23 1B 46 61 E7 79 9E 18 81 90 38 00 01 08 60
                A0 24 1B 3D 40 7B 08 8F 18 8B 11 20 C1 84 69 70
                5D F5 5B 30 B4 53 26 92 0E A4 00 12 09 E0 18 BD
                58 80 53 80 B1 1F 3E 02 C7 35 00 32 24 B4 00 1F
                08 A0 38 80 08 18 18 20`;
	const hex_after_raw = `
                37 A1 26 21 7D F4 34 7B 04 66 62 1B 4B 91 AB BB
                E0 DE 3A 77 43 32 CE 88 9C 0F A6 F0 16 DA F8 86
                A8 27 49 F5 8F DA F4 48 4B F6 E9 59 4B F2 0C EF
                1C 6C 31 D2 67 FC 2B 34 C2 51 BF 7E 81 AB E7 1F
                D9 07 20 9F 89 3E E9 0F 20 E3 83 7E CC FC F4 37
                8D 69 BD 28 45 BC 16 2F E4 61 2D 22 D0 B4 B4 19
                66 41 7B D5 75 9F EC C7 DA 10 82 7C AD 37 23 C2
                3C 36 AD B7 A1 D7 73 87 79 34 61 63 2D 79 14 6A
                10 43 1F 54 01 57 5C 87 FE 01 0B 54 43 89 E7 FF
                5A 2B F9 C1 4D 94 FD 4D B0 72 7D C6 4E 56 9F EF
                94 CC BA 10 F9 31 32 FD 1E C4 04 00 69 50 3D A4
                BE 00 C8 EC F2 97 D1 9D 3D 3A E2 CE 29 5B F5 DD
                A0 59 54 66 87 CA EE BF`;
	const hex_before = remove_whitespace(hex_before_raw);
	const hex_after = remove_whitespace(hex_after_raw);
	const state_array = h2b(hex_before);
	const scratch_space = make_state_array();
	do_theta(state_array, scratch_space);
	const hex_result = b2h(state_array);
	assert.equal(hex_result.length, 400);
	assert.equal(hex_after.length, 400);
	assert.equal(hex_result, hex_after);
});

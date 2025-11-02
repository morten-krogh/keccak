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
import { do_rho } from "./rho.js";

test("Zero", (_t) => {
	const state_array = make_state_array();
	const scratch_space = make_state_array();
	do_rho(state_array, scratch_space);
	assert(is_zero_state_array(state_array));
});

test("Some ones", (_t) => {
	const state_array = make_state_array();
	const scratch_space = make_state_array();
	set_bit_in_state_array(state_array, 0, 0, 0, true);
	set_bit_in_state_array(state_array, 1, 0, 5, true);
	set_bit_in_state_array(state_array, 3, 4, 23, true);
	set_bit_in_state_array(state_array, 3, 4, 25, true);
	do_rho(state_array, scratch_space);
	assert(!is_zero_state_array(state_array));
	assert(get_bit_in_state_array(state_array, 0, 0, 0));
	assert(!get_bit_in_state_array(state_array, 0, 0, 1));
	assert(!get_bit_in_state_array(state_array, 1, 0, 5));
	assert(get_bit_in_state_array(state_array, 1, 0, 6));
	assert(!get_bit_in_state_array(state_array, 1, 0, 7));
	assert(!get_bit_in_state_array(state_array, 3, 4, 14));
	assert(get_bit_in_state_array(state_array, 3, 4, 15));
	assert(!get_bit_in_state_array(state_array, 3, 4, 16));
	assert(get_bit_in_state_array(state_array, 3, 4, 17));
	assert(!get_bit_in_state_array(state_array, 3, 4, 18));
	assert(!get_bit_in_state_array(state_array, 3, 4, 34));
});

test("All one", (_t) => {
	const state_array = make_state_array();
	const scratch_space = make_state_array();
	fill_state_array_with_byte(state_array, 255);
	do_rho(state_array, scratch_space);
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
	const hex_after_raw = `
                07 00 00 00 00 00 00 00 0C 00 00 00 00 00 00 00
                00 00 00 00 00 00 00 20 00 00 00 00 00 00 00 00
                00 00 00 60 00 00 00 00 00 00 00 00 10 00 00 00
                00 00 00 00 00 60 00 00 20 00 00 00 00 00 00 00
                00 00 00 00 00 00 00 00 00 00 C0 00 00 00 00 00
                08 00 00 00 00 00 00 00 00 18 00 00 00 00 00 00
                00 00 00 00 00 04 00 00 00 00 00 00 00 00 00 00
                00 00 00 00 00 06 00 00 00 00 00 00 00 02 00 00
                00 00 00 00 00 D0 00 00 00 40 00 00 00 00 00 00
                00 00 00 00 00 00 00 00 00 0C 00 00 00 00 00 00
                00 00 04 00 00 00 00 00 18 00 00 00 00 00 00 00
                00 00 00 00 00 00 00 10 00 00 00 00 00 00 00 00
                00 00 03 00 00 00 00 00
        `;
	const hex_before = remove_whitespace(hex_before_raw);
	const hex_after = remove_whitespace(hex_after_raw);
	const state_array = h2b(hex_before);
	const scratch_space = make_state_array();
	do_rho(state_array, scratch_space);
	const hex_result = b2h(state_array);
	assert.equal(hex_result, hex_after);
});

test("NIST test 2", (_t) => {
	const hex_before_raw = `
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
	const hex_after_raw = `
                37 A1 26 21 7D F4 34 7B 09 CC C4 36 96 22 57 77
                B8 B7 CE DD 90 8C 33 22 A1 8D 6F C8 F9 60 0A 6F
                D4 A6 47 42 3D 49 AA 7F B5 24 CF F0 BE 64 9F 9E
                23 7D C6 BF 42 C3 C1 16 87 70 D4 AF 5F E0 EA F9
                03 90 CF 44 9F F4 87 EC 4F 7F 03 32 3E E8 C7 CC
                69 4C EB 45 29 E2 B5 78 66 90 87 B5 88 40 D3 D2
                AB AE FB 64 3F 36 0B DA 6F 46 84 B5 21 04 F9 5A
                DB D0 EB B9 43 1E 9B D6 C6 5A F2 28 D4 F2 68 C2
                83 2A E0 8A EB 10 62 E8 F3 7F FF 80 05 AA A1 C4
                B2 BF 49 6B 25 3F B8 89 EF B0 72 7D C6 4E 56 9F
                C8 F4 53 32 EB 42 E4 C7 7A 10 13 00 A4 41 F5 90
                17 00 99 5D FE 32 BA D3 3A E2 CE 29 5B F5 DD 3D
                FB 2F 68 16 95 D9 A1 B2`;

	const hex_before = remove_whitespace(hex_before_raw);
	const hex_after = remove_whitespace(hex_after_raw);
	const state_array = h2b(hex_before);
	const scratch_space = make_state_array();
	do_rho(state_array, scratch_space);
	const hex_result = b2h(state_array);
	assert.equal(hex_result, hex_after);
});

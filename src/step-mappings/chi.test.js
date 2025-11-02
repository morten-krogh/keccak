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
import { do_chi } from "./chi.js";

test("chi all zero", (_t) => {
	const state_array = make_state_array();
	const scratch_space = make_state_array();
	do_chi(state_array, scratch_space);
	assert(is_zero_state_array(state_array));
});

test("chi some ones", (_t) => {
	const state_array = make_state_array();
	const scratch_space = make_state_array();
	set_bit_in_state_array(state_array, 0, 0, 0, true);
	set_bit_in_state_array(state_array, 1, 0, 5, true);
	set_bit_in_state_array(state_array, 2, 0, 5, true);
	set_bit_in_state_array(state_array, 2, 4, 23, true);
	set_bit_in_state_array(state_array, 3, 4, 23, true);
	set_bit_in_state_array(state_array, 4, 4, 23, true);
	do_chi(state_array, scratch_space);
	assert(!is_zero_state_array(state_array));
	assert(get_bit_in_state_array(state_array, 0, 0, 0));
	assert(!get_bit_in_state_array(state_array, 1, 0, 0));
	assert(!get_bit_in_state_array(state_array, 2, 0, 0));
	assert(get_bit_in_state_array(state_array, 3, 0, 0));
	assert(!get_bit_in_state_array(state_array, 4, 0, 0));
	assert(!get_bit_in_state_array(state_array, 0, 0, 5));
	assert(get_bit_in_state_array(state_array, 1, 0, 5));
	assert(get_bit_in_state_array(state_array, 2, 0, 5));
	assert(!get_bit_in_state_array(state_array, 3, 0, 5));
	assert(get_bit_in_state_array(state_array, 4, 0, 5));
	assert(get_bit_in_state_array(state_array, 0, 4, 23));
	assert(!get_bit_in_state_array(state_array, 1, 4, 23));
	assert(get_bit_in_state_array(state_array, 2, 4, 23));
	assert(get_bit_in_state_array(state_array, 3, 4, 23));
	assert(get_bit_in_state_array(state_array, 4, 4, 23));
});

test("chi all one", (_t) => {
	const state_array = make_state_array();
	const scratch_space = make_state_array();
	fill_state_array_with_byte(state_array, 255);
	do_chi(state_array, scratch_space);
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
               07 00 00 00 00 00 00 00 00 00 00 00 00 60 00 00
               00 00 00 00 00 04 00 00 00 00 00 00 00 00 00 00
               00 00 03 00 00 00 00 00 00 00 00 00 00 00 00 00
               00 00 C0 00 00 00 00 00 08 00 00 00 00 00 00 00
               00 00 00 00 00 D0 00 00 00 00 00 00 00 00 00 10
               0C 00 00 00 00 00 00 00 20 00 00 00 00 00 00 00
               00 00 00 00 00 00 00 00 00 0C 00 00 00 00 00 00
               00 00 04 00 00 00 00 00 00 00 00 60 00 00 00 00
               00 00 00 00 10 00 00 00 00 18 00 00 00 00 00 00
               00 40 00 00 00 00 00 00 00 00 00 00 00 00 00 00
               00 00 00 00 00 00 00 20 00 00 00 00 00 00 00 00
               00 00 00 00 00 06 00 00 00 00 00 00 00 02 00 00
               18 00 00 00 00 00 00 00
	`;
	const hex_after_raw = `
                07 00 00 00 00 04 00 00 00 00 00 00 00 60 00 00
                00 00 03 00 00 04 00 00 07 00 00 00 00 00 00 00
                00 00 03 00 00 60 00 00 08 00 00 00 00 00 00 00
                00 00 C0 00 00 D0 00 00 08 00 00 00 00 00 00 10
                00 00 00 00 00 D0 00 00 00 00 C0 00 00 00 00 10
                0C 00 00 00 00 00 00 00 20 0C 00 00 00 00 00 00
                00 00 04 00 00 00 00 00 0C 0C 00 00 00 00 00 00
                20 00 04 00 00 00 00 00 00 18 00 60 00 00 00 00
                00 40 00 00 10 00 00 00 00 18 00 00 00 00 00 00
                00 40 00 60 00 00 00 00 00 00 00 00 10 00 00 00
                00 00 00 00 00 06 00 20 00 00 00 00 00 00 00 00
                18 00 00 00 00 06 00 00 00 00 00 00 00 02 00 20
                18 00 00 00 00 00 00 00
	`;
	const hex_before = remove_whitespace(hex_before_raw);
	const hex_after = remove_whitespace(hex_after_raw);
	const state_array = h2b(hex_before);
	const scratch_space = make_state_array();
	do_chi(state_array, scratch_space);
	const hex_result = b2h(state_array);
	assert.equal(hex_result, hex_after);
});

test("NIST test 2", (_t) => {
	const hex_before_raw = `
                37 A1 26 21 7D F4 34 7B 23 7D C6 BF 42 C3 C1 16
                AB AE FB 64 3F 36 0B DA B2 BF 49 6B 25 3F B8 89
                FB 2F 68 16 95 D9 A1 B2 A1 8D 6F C8 F9 60 0A 6F
                4F 7F 03 32 3E E8 C7 CC 69 4C EB 45 29 E2 B5 78
                83 2A E0 8A EB 10 62 E8 17 00 99 5D FE 32 BA D3
                09 CC C4 36 96 22 57 77 87 70 D4 AF 5F E0 EA F9
                6F 46 84 B5 21 04 F9 5A EF B0 72 7D C6 4E 56 9F
                C8 F4 53 32 EB 42 E4 C7 D4 A6 47 42 3D 49 AA 7F
                B5 24 CF F0 BE 64 9F 9E 66 90 87 B5 88 40 D3 D2
                F3 7F FF 80 05 AA A1 C4 3A E2 CE 29 5B F5 DD 3D
                B8 B7 CE DD 90 8C 33 22 03 90 CF 44 9F F4 87 EC
                DB D0 EB B9 43 1E 9B D6 C6 5A F2 28 D4 F2 68 C2
                7A 10 13 00 A4 41 F5 90
        `;
	const hex_after_raw = `
                BF 23 1F 61 40 C0 3E B3 33 6C C6 B4 42 CA 71 17
                E2 AE DB 70 AF F6 0A E8 B6 3F 4F 4A 4D 1B AC C0
                FB 73 A8 88 97 DA 60 B6 81 8D 87 8D F8 62 3A 5F
                CD 5D 03 B8 FC F8 85 4C 7D 4C F2 10 3D C0 2D 6B
                23 A7 86 0A EA 50 62 C4 59 72 99 6F F8 BA 7F 53
                61 CA C4 26 B6 26 46 75 07 C0 A6 E7 99 AA EC 7C
                6F 02 85 B7 08 04 59 1A EE B8 F6 79 D2 6E 45 AF
                4E C4 43 BB A2 82 4C 4F 96 36 47 47 3D 49 EA 3F
                24 4B B7 F0 BB CE BF 9A 6E 10 87 9C D2 15 8F EB
                37 7B FE C2 21 A2 83 86 1B E2 46 99 D9 D1 C8 BD
                60 F7 EE 64 D0 86 2B 30 07 9A DF 44 0B 14 E7 EC
                E3 D0 EA B9 63 1F 0E C6 46 FD 3E F5 C4 7E 6A E0
                79 10 12 00 AB 31 71 5C
        `;
	const hex_before = remove_whitespace(hex_before_raw);
	const hex_after = remove_whitespace(hex_after_raw);
	const state_array = h2b(hex_before);
	const scratch_space = make_state_array();
	do_chi(state_array, scratch_space);
	const hex_result = b2h(state_array);
	assert.equal(hex_result, hex_after);
});

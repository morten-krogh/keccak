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
import { calculate_rc, do_iota, rc } from "./iota.js";

test("rc", (_t) => {
	const calculated_rc = calculate_rc();
	assert.deepEqual(calculated_rc, rc);
});

test("Round zero", (_t) => {
	const state_array = make_state_array();
	do_iota(state_array, 0);
	assert(get_bit_in_state_array(state_array, 0, 0, 0));
	for (let z = 1; z < 63; z++) {
		assert(!get_bit_in_state_array(state_array, 0, 0, z));
	}
	assert(!get_bit_in_state_array(state_array, 1, 0, 0));
	assert(!get_bit_in_state_array(state_array, 0, 1, 0));
	assert(!get_bit_in_state_array(state_array, 1, 1, 0));
	assert(!get_bit_in_state_array(state_array, 2, 3, 0));
	assert(!get_bit_in_state_array(state_array, 2, 4, 0));
});

test("Round zero with one bit set", (_t) => {
	const state_array = make_state_array();
	set_bit_in_state_array(state_array, 0, 0, 0, true);
	do_iota(state_array, 0);
	assert(!get_bit_in_state_array(state_array, 0, 0, 0));
	assert(is_zero_state_array(state_array));
});

test("Round ten with all ones", (_t) => {
	const state_array = make_state_array();
	fill_state_array_with_byte(state_array, 255);
	const i_round = 10;
	do_iota(state_array, i_round);
	assert(get_bit_in_state_array(state_array, 1, 0, 0));
	assert(get_bit_in_state_array(state_array, 1, 1, 1));
	assert(get_bit_in_state_array(state_array, 0, 1, 2));
	assert(get_bit_in_state_array(state_array, 4, 4, 12));
	assert(!get_bit_in_state_array(state_array, 0, 0, 0));
	assert(get_bit_in_state_array(state_array, 0, 0, 1));
	assert(!get_bit_in_state_array(state_array, 0, 0, 3));
	assert(get_bit_in_state_array(state_array, 0, 0, 7));
	assert(!get_bit_in_state_array(state_array, 0, 0, 15));
	assert(!get_bit_in_state_array(state_array, 0, 0, 31));
	assert(get_bit_in_state_array(state_array, 0, 0, 63));
	assert(get_bit_in_state_array(state_array, 0, 0, 40));
});

test("NIST test round 0", (_t) => {
	const hex_before_raw = `
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
	const hex_after_raw = `
                06 00 00 00 00 04 00 00 00 00 00 00 00 60 00 00
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
	do_iota(state_array, 0);
	const hex_result = b2h(state_array);
	assert.equal(hex_result, hex_after);
});

test("NIST test round 2", (_t) => {
	const hex_before_raw = `
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
	const hex_after_raw = `
                35 A3 1F 61 40 C0 3E 33 33 6C C6 B4 42 CA 71 17
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
	do_iota(state_array, 2);
	const hex_result = b2h(state_array);
	assert.equal(hex_result, hex_after);
});

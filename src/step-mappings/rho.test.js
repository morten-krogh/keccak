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

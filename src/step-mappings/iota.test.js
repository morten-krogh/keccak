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

test("NIST test 1", (_t) => {
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

import assert from "node:assert/strict";
import test from "node:test";
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

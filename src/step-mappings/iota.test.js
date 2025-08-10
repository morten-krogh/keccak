import assert from "node:assert/strict";
import test from "node:test";
import {
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

test("Round zero with a bit set", (_t) => {
	const state_array = make_state_array();
	set_bit_in_state_array(state_array, 0, 0, 0, true);
	do_iota(state_array, 0);
	assert(!get_bit_in_state_array(state_array, 0, 0, 0));
	assert(is_zero_state_array(state_array));
});

// test("Some ones", (_t) => {
// 	const state_array = make_state_array();
// 	const scratch_space = make_state_array();
// 	set_bit_in_state_array(state_array, 0, 0, 0, true);
// 	set_bit_in_state_array(state_array, 1, 0, 5, true);
// 	set_bit_in_state_array(state_array, 3, 4, 23, true);
// 	set_bit_in_state_array(state_array, 3, 4, 25, true);
// 	do_pi(state_array, scratch_space);
// 	assert(!is_zero_state_array(state_array));
// 	assert(get_bit_in_state_array(state_array, 0, 0, 0));
// 	assert(!get_bit_in_state_array(state_array, 0, 0, 1));
// 	assert(!get_bit_in_state_array(state_array, 1, 0, 5));
// 	assert(get_bit_in_state_array(state_array, 0, 2, 5));
// 	assert(!get_bit_in_state_array(state_array, 0, 2, 4));
// 	assert(get_bit_in_state_array(state_array, 4, 3, 23));
// 	assert(!get_bit_in_state_array(state_array, 4, 3, 24));
// 	assert(get_bit_in_state_array(state_array, 4, 3, 25));
// 	assert(!get_bit_in_state_array(state_array, 3, 4, 23));
// 	assert(!get_bit_in_state_array(state_array, 2, 4, 25));
// });

// test("All one", (_t) => {
// 	const state_array = make_state_array();
// 	const scratch_space = make_state_array();
// 	fill_state_array_with_byte(state_array, 255);
// 	do_pi(state_array, scratch_space);
// 	for (let x = 0; x < 5; x++) {
// 		for (let y = 0; y < 5; y++) {
// 			for (let z = 0; z < 64; z++) {
// 				assert(get_bit_in_state_array(state_array, x, y, z));
// 			}
// 		}
// 	}
// });

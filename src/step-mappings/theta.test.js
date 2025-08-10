import assert from "node:assert/strict";
import test from "node:test";
import {
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
	for (let x = 0; x < 5; x++) {
		for (let y = 0; y < 5; y++) {
			for (let z = 0; z < 64; z++) {
				set_bit_in_state_array(state_array, x, y, z, true);
			}
		}
	}
	do_theta(state_array, scratch_space);
	for (let x = 0; x < 5; x++) {
		for (let y = 0; y < 5; y++) {
			for (let z = 0; z < 64; z++) {
				assert(get_bit_in_state_array(state_array, x, y, z));
			}
		}
	}
});

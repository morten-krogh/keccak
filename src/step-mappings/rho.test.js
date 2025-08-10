import assert from "node:assert/strict";
import test from "node:test";
import {
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
	for (let x = 0; x < 5; x++) {
		for (let y = 0; y < 5; y++) {
			for (let z = 0; z < 64; z++) {
				set_bit_in_state_array(state_array, x, y, z, true);
			}
		}
	}
	do_rho(state_array, scratch_space);
	for (let x = 0; x < 5; x++) {
		for (let y = 0; y < 5; y++) {
			for (let z = 0; z < 64; z++) {
				assert(get_bit_in_state_array(state_array, x, y, z));
			}
		}
	}
});

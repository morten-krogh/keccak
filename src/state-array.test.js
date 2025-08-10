import assert from "node:assert/strict";
import test from "node:test";
import {
	add_bit_in_state_array,
	get_bit_in_state_array,
	make_state_array,
	set_bit_in_state_array,
} from "./state-array.js";

test("make state array", (_t) => {
	const state_array = make_state_array();
	assert.equal(state_array.length, 200);
	for (let i = 0; i < 200; i++) {
		const byte = state_array[i];
		assert.equal(byte, 0);
	}
});

test("get bit in state array", (_t) => {
	const state_array = make_state_array();
	for (let x = 0; x < 5; x++) {
		for (let y = 0; y < 5; y++) {
			for (let z = 0; z < 64; z++) {
				assert(!get_bit_in_state_array(state_array, x, y, z));
			}
		}
	}
	state_array[0] = 1;
	assert(get_bit_in_state_array(state_array, 0, 0, 0));
	assert(!get_bit_in_state_array(state_array, 0, 0, 1));
	state_array[0] = 3;
	assert(get_bit_in_state_array(state_array, 0, 0, 0));
	assert(get_bit_in_state_array(state_array, 0, 0, 1));
	state_array[1] = 1;
	assert(get_bit_in_state_array(state_array, 0, 0, 8));
	state_array[8] = 4;
	assert(!get_bit_in_state_array(state_array, 1, 0, 1));
	assert(get_bit_in_state_array(state_array, 1, 0, 2));
	state_array[109] = 128;
	assert(get_bit_in_state_array(state_array, 3, 2, 47));
	state_array[199] = 160;
	assert(get_bit_in_state_array(state_array, 4, 4, 61));
	assert(!get_bit_in_state_array(state_array, 4, 4, 62));
	assert(get_bit_in_state_array(state_array, 4, 4, 63));
});

test("set_bit in state array", (_t) => {
	const state_array = make_state_array();
	assert.equal(state_array[0], 0);
	set_bit_in_state_array(state_array, 0, 0, 0, true);
	assert.equal(state_array[0], 1);
	set_bit_in_state_array(state_array, 0, 0, 1, true);
	assert.equal(state_array[0], 3);
	set_bit_in_state_array(state_array, 0, 0, 1, false);
	assert.equal(state_array[0], 1);
	set_bit_in_state_array(state_array, 0, 0, 0, false);
	assert.equal(state_array[0], 0);
	assert.equal(state_array[109], 0);
	set_bit_in_state_array(state_array, 3, 2, 47, true);
	assert.equal(state_array[109], 128);
	set_bit_in_state_array(state_array, 3, 2, 47, false);
	assert.equal(state_array[109], 0);
});

test("get and set bits in state array", (_t) => {
	const state_array = make_state_array();
	for (let x = 0; x < 5; x++) {
		for (let y = 0; y < 5; y++) {
			for (let z = 0; z < 64; z++) {
				assert(!get_bit_in_state_array(state_array, x, y, z));
				set_bit_in_state_array(state_array, x, y, z, true);
				assert(get_bit_in_state_array(state_array, x, y, z));
				set_bit_in_state_array(state_array, x, y, z, false);
				assert(!get_bit_in_state_array(state_array, x, y, z));
			}
		}
	}
});

test("add get and set bits in state array", (_t) => {
	const state_array = make_state_array();
	for (let x = 0; x < 5; x++) {
		for (let y = 0; y < 5; y++) {
			for (let z = 0; z < 64; z++) {
				assert(!get_bit_in_state_array(state_array, x, y, z));
				add_bit_in_state_array(state_array, x, y, z, true);
				assert(get_bit_in_state_array(state_array, x, y, z));
				add_bit_in_state_array(state_array, x, y, z, true);
				assert(!get_bit_in_state_array(state_array, x, y, z));
				add_bit_in_state_array(state_array, x, y, z, false);
				assert(!get_bit_in_state_array(state_array, x, y, z));
			}
		}
	}
});

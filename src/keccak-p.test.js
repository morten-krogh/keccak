import assert from "node:assert/strict";
import test from "node:test";
import { keccak_p } from "./keccak-p.js";
import { is_zero_state_array, make_state_array } from "./state-array.js";

test("round zero from zero state array", (_t) => {
	const state_array = make_state_array();
	const scratch_space = make_state_array();
	assert(is_zero_state_array(state_array));
	const nr = 24;
	keccak_p(state_array, scratch_space, nr);
	assert(!is_zero_state_array(state_array));
});

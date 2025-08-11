import assert from "node:assert/strict";
import test from "node:test";
import { do_round } from "./round.js";
import { is_zero_state_array, make_state_array } from "./state-array.js";

test("round zero from zero state array", (_t) => {
	const state_array = make_state_array();
	const scratch_space = make_state_array();
	assert(is_zero_state_array(state_array));
	const i_roound = 0;
	do_round(state_array, scratch_space, i_roound);
	assert(!is_zero_state_array(state_array));
});

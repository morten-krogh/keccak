import {
	copy_state_array,
	get_bit_in_state_array,
	set_bit_in_state_array,
} from "../state-array.js";

/**
 * Steps:
 * For all triples (x, y, z) such that 0 ≤ x < 5, 0 ≤ y < 5, and 0 ≤ z < w, let
 * A′[x, y, z]= A[(x + 3y) mod 5, x, z].
 *
 * @param {Uint8Array} A
 * @param {Uint8Array} scratch_space
 */
function do_pi(A, scratch_space) {
	for (let x = 0; x < 5; x++) {
		for (let y = 0; y < 5; y++) {
			const x_prime = (x + 3 * y) % 5;
			const y_prime = x;
			for (let z = 0; z < 64; z++) {
				const bit = get_bit_in_state_array(A, x_prime, y_prime, z);
				set_bit_in_state_array(scratch_space, x, y, z, bit);
			}
		}
	}
	// Update A.
	copy_state_array(scratch_space, A);
}

export { do_pi };

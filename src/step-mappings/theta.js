import {
	add_bit_in_state_array,
	get_bit_in_state_array,
	set_bit_in_state_array,
} from "../state-array.js";

/**
 * Steps:
 * 1. For all pairs (x, z) such that 0 ≤ x < 5 and 0 ≤ z < w, let
 * C[x, z] = A[x, 0, z] ⊕ A[x, 1, z] ⊕ A[x, 2, z] ⊕ A[x, 3, z] ⊕ A[x, 4, z].
 * 2. For all pairs (x, z) such that 0 ≤ x < 5 and 0 ≤ z < w let
 * D[x, z] = C[(x-1) mod 5, z] ⊕ C[(x+1) mod 5, (z – 1) mod w].
 * 3. For all triples (x, y, z) such that 0 ≤ x < 5, 0 ≤ y < 5, and 0 ≤ z < w, let
 * A′[x, y, z] = A[x, y, z] ⊕ D[x, z].
 *
 * @param {Uint8Array} A
 * @param {Uint8Array} scratch_space
 */
function do_theta(A, scratch_space) {
	// Calculate C
	for (let x = 0; x < 5; x++) {
		for (let z = 0; z < 64; z++) {
			let sum = false;
			for (let y = 0; y < 5; y++) {
				const bit = get_bit_in_state_array(A, x, y, z);
				sum = sum ? !bit : bit;
			}
			// C is stored in the scratch_space with y = 0.
			set_bit_in_state_array(scratch_space, x, 0, z, sum);
		}
	}
	// Calculate D
	for (let x = 0; x < 5; x++) {
		for (let z = 0; z < 64; z++) {
			const bit1 = get_bit_in_state_array(scratch_space, (x + 4) % 5, 0, z);
			const bit2 = get_bit_in_state_array(
				scratch_space,
				(x + 1) % 5,
				0,
				(z + 63) % 64,
			);
			const bit = bit1 ? !bit2 : bit2;
			// D is stored in the scratch space with y = 1.
			set_bit_in_state_array(scratch_space, x, 1, z, bit);
		}
	}
	// Update A
	for (let x = 0; x < 5; x++) {
		for (let y = 0; y < 5; y++) {
			for (let z = 0; z < 64; z++) {
				const bit = get_bit_in_state_array(scratch_space, x, 1, z);
				add_bit_in_state_array(A, x, y, z, bit);
			}
		}
	}
}

export { do_theta };

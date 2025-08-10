import {
	copy_state_array,
	get_bit_in_state_array,
	set_bit_in_state_array,
} from "../state-array.js";

/**
 * Steps:
 * 1. For all triples (x, y, z) such that 0 ≤ x < 5, 0 ≤ y < 5, and 0 ≤ z < w, let
 * A′ [x, y, z] = A[x, y, z] ⊕ ((A[(x+1) mod 5, y, z] ⊕ 1) ⋅ A[(x+2) mod 5, y, z]).
 *
 * @param {Uint8Array} A
 * @param {Uint8Array} scratch_space
 */
function do_chi(A, scratch_space) {
	for (let x = 0; x < 5; x++) {
		for (let y = 0; y < 5; y++) {
			const x_plus_one = (x + 1) % 5;
			const x_plus_two = (x + 2) % 5;
			for (let z = 0; z < 64; z++) {
				const bit1 = get_bit_in_state_array(A, x, y, z);
				const bit2 = get_bit_in_state_array(A, x_plus_one, y, z);
				const bit3 = get_bit_in_state_array(A, x_plus_two, y, z);
				const bit_product = !bit2 && bit3;
				const bit = bit1 ? !bit_product : bit_product;
				set_bit_in_state_array(scratch_space, x, y, z, bit);
			}
		}
	}
	// Update A.
	copy_state_array(scratch_space, A);
}

export { do_chi };

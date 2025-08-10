import {
	get_bit_in_state_array,
	set_bit_in_state_array,
} from "../state-array.js";

/**
 * Steps:
 * 1. For all z such that 0 ≤ z < w, let A′ [0, 0, z] = A[0, 0, z].
 * 2. Let (x, y) = (1, 0).
 * 3. For t from 0 to 23:
 *    a. for all z such that 0 ≤ z < w, let A′[x, y, z] = A[x, y, (z – (t + 1)(t + 2)/2) mod w];
 *    b. let (x, y) = (y, (2x + 3y) mod 5).
 *
 * @param {Uint8Array} A
 * @param {Uint8Array} scratch_space
 */
function do_rho(A, scratch_space) {
	let x = 1;
	let y = 0;
	for (let t = 0; t < 24; t++) {
		const offset = ((t + 1) * (t + 2)) / 2;
		// Calculate and store the transformed values in the scratch space.
		for (let z = 0; z < 64; z++) {
			let z_shifted = (z - offset) % 64;
			if (z_shifted < 0) {
				z_shifted += 64;
			}
			console.assert(z_shifted >= 0 && z_shifted < 64);
			const bit = get_bit_in_state_array(A, x, y, z_shifted);
			set_bit_in_state_array(scratch_space, x, y, z, bit);
		}
		// Update A.
		for (let z = 0; z < 64; z++) {
			const bit = get_bit_in_state_array(scratch_space, x, y, z);
			set_bit_in_state_array(A, x, y, z, bit);
		}
		const temp = y;
		y = (2 * x + 3 * y) % 5;
		x = temp;
	}
}

export { do_rho };

import { add_bit_in_state_array } from "../state-array.js";

/**
 * Steps:
 * 1. 3. If t mod 255 = 0, return 1.
 * 2. Let R = 10000000.
 * For i from 1 to t mod 255, let:
 * a. R = 0 || R;
 * b. R[0] = R[0] ⊕ R[8];
 * c. R[4] = R[4] ⊕ R[8];
 * d. R[5] = R[5] ⊕ R[8];
 * e. R[6] = R[6] ⊕ R[8];
 * f. R =Trunc8[R].
 * 4. Return R[0]
 *
 *
 * @returns {boolean[]}
 */
function calculate_rc() {
	const rc = new Array(255).fill(false);
	rc[0] = true;
	const R = [true, false, false, false, false, false, false, false];
	for (let i = 1; i < 255; i++) {
		R.unshift(false);
		const R8 = R.pop();
		if (!R8) {
			continue;
		}
		R[0] = !R[0];
		R[4] = !R[4];
		R[5] = !R[5];
		R[6] = !R[6];
		rc[i] = R[0];
	}
	return rc;
}

const rc = [
	true,
	false,
	false,
	false,
	false,
	false,
	false,
	false,
	true,
	false,
	true,
	true,
	false,
	false,
	false,
	true,
	true,
	true,
	true,
	false,
	true,
	false,
	false,
	false,
	false,
	true,
	true,
	true,
	true,
	true,
	true,
	true,
	true,
	false,
	false,
	true,
	false,
	false,
	false,
	false,
	true,
	false,
	true,
	false,
	false,
	true,
	true,
	true,
	true,
	true,
	false,
	true,
	false,
	true,
	false,
	true,
	false,
	true,
	true,
	true,
	false,
	false,
	false,
	false,
	false,
	true,
	true,
	false,
	false,
	false,
	true,
	false,
	true,
	false,
	true,
	true,
	false,
	false,
	true,
	true,
	false,
	false,
	true,
	false,
	true,
	true,
	true,
	true,
	true,
	true,
	false,
	true,
	true,
	true,
	true,
	false,
	false,
	true,
	true,
	false,
	true,
	true,
	true,
	false,
	true,
	true,
	true,
	false,
	false,
	true,
	false,
	true,
	false,
	true,
	false,
	false,
	true,
	false,
	true,
	false,
	false,
	false,
	true,
	false,
	false,
	true,
	false,
	true,
	true,
	false,
	true,
	false,
	false,
	false,
	true,
	true,
	false,
	false,
	true,
	true,
	true,
	false,
	false,
	true,
	true,
	true,
	true,
	false,
	false,
	false,
	true,
	true,
	false,
	true,
	true,
	false,
	false,
	false,
	false,
	true,
	false,
	false,
	false,
	true,
	false,
	true,
	true,
	true,
	false,
	true,
	false,
	true,
	true,
	true,
	true,
	false,
	true,
	true,
	false,
	true,
	true,
	true,
	true,
	true,
	false,
	false,
	false,
	false,
	true,
	true,
	false,
	true,
	false,
	false,
	true,
	true,
	false,
	true,
	false,
	true,
	true,
	false,
	true,
	true,
	false,
	true,
	false,
	true,
	false,
	false,
	false,
	false,
	false,
	true,
	false,
	false,
	true,
	true,
	true,
	false,
	true,
	true,
	false,
	false,
	true,
	false,
	false,
	true,
	false,
	false,
	true,
	true,
	false,
	false,
	false,
	false,
	false,
	false,
	true,
	true,
	true,
	false,
	true,
	false,
	false,
	true,
	false,
	false,
	false,
	true,
	true,
	true,
	false,
	false,
	false,
];

/**
 * Steps:
 * 1. For all triples (x, y, z) such that 0 ≤ x < 5, 0 ≤ y < 5, and 0 ≤ z < w, let A′[x, y, z] = A[x, y, z].
 * 2. Let RC = 0w
 * 3. For j from 0 to 6, let RC[2^j – 1] = rc(j + 7i_r).
 * 4. For all z such that 0 ≤ z < w, let A′ [0, 0, z] = A′ [0, 0, z] ⊕ RC[z].
 *
 *
 * @param {Uint8Array} A
 * @param {number} i_round
 */
function do_iota(A, i_round) {
	let two_to_the_power_j = 1;
	let k = 7 * i_round;
	for (let j = 0; j < 6; j++) {
		const current_rc = /** @type {boolean} */ (rc[k]);
		const z = two_to_the_power_j - 1;
		add_bit_in_state_array(A, 0, 0, z, current_rc);
		two_to_the_power_j *= 2;
		k++;
	}
}

export { calculate_rc, rc, do_iota };

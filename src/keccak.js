import { keccak_p } from "./keccak-p.js";
import { pad } from "./pad.js";
import { make_state_array } from "./state-array.js";

/**
 * Steps:
 * 1. Let P = N || pad(r, len(N)).
 * 2. Let n = len(P)/r.
 * 3. Let c = b - r.
 * 4. Let P0, … , Pn-1 be the unique sequence of strings of length r such that P = P0 || … || Pn-1.
 * 5. Let S = 0b
 * 6. For i from 0 to n - 1, let S = f (S ⊕ (Pi || 0c)).
 * 7. Let Z be the empty string.
 * 8. Let Z = Z || Trunc r (S).
 * 9. If d ≤ |Z|, then return Trunc d (Z); else continue.
 * 10. Let S = f(S), and continue with Step 8.
 *
 * @param {number} c
 * @param {Uint8Array} N
 * @param {number} m - len(M) in bits
 * @param {number} d - output length in bits
 * @returns {Uint8Array}
 */
function keccak(c, N, m, d) {
	const r = 1600 - c;
	const P = pad(N, m, r);
	const n = (8 * P.length) / r;
	const state_array = make_state_array();
	const scratch_space = make_state_array();
	for (let i = 0; i < n; i++) {
		const byte_count = r / 8;
		const start_byte_index = i * byte_count;
		for (let j = 0; j < byte_count; j++) {
			const byte_index = start_byte_index + j;
			// @ts-ignore
			state_array[j] ^= P[byte_index];
		}
		keccak_p(state_array, scratch_space, 24);
	}
	const Z = new Uint8Array(d / 8);
	let output_index = 0;
	let state_array_index = 0;
	while (output_index < d / 8) {
		// @ts-ignore
		Z[output_index] = state_array[state_array_index];
		output_index++;
		state_array_index++;
		if (state_array_index % (r / 8) === 0) {
			state_array_index = 0;
			keccak_p(state_array, scratch_space, 24);
		}
	}
	return Z;
}

export { keccak };

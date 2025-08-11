import { do_round } from "./round.js";

/**
 * Algorithm 7: KECCAK-p[b, nr](S)
 * Input:
 * string S of length b;
 * number of rounds nr.
 * Output:
 * string S′ of length b.
 * Steps:
 * 1. 3. Convert S into a state array, A, as described in Sec. 3.1.2.
 * 2. For ir from 12 + 2l – nr to 12 + 2l – 1, let A = Rnd(A, ir).
 * Convert A into a string S′ of length b, as described in Sec. 3.1.3.
 *
 * @param {Uint8Array} A
 * @param {Uint8Array} scratch_space
 * @param {number} nr
 */
function keccak_p(A, scratch_space, nr) {
	const i_round_start = 24 - nr;
	const i_round_end = 24;
	for (let i_round = i_round_start; i_round < i_round_end; i_round++) {
		do_round(A, scratch_space, i_round);
	}
}

export { keccak_p };

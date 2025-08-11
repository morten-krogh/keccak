import { do_chi } from "./step-mappings/chi.js";
import { do_iota } from "./step-mappings/iota.js";
import { do_pi } from "./step-mappings/pi.js";
import { do_rho } from "./step-mappings/rho.js";
import { do_theta } from "./step-mappings/theta.js";

/**
 *
 * @param {Uint8Array} A
 * @param {Uint8Array} scratch_space
 * @param {number} i_round
 */
function do_round(A, scratch_space, i_round) {
	do_theta(A, scratch_space);
	do_rho(A, scratch_space);
	do_pi(A, scratch_space);
	do_chi(A, scratch_space);
	do_iota(A, i_round);
}

export { do_round };

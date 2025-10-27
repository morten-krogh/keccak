import { keccak } from "./keccak.js";
import { append_suffix } from "./suffix.js";

/**
 *
 * @param {Uint8Array} M
 * @param {number} d
 * @returns {Uint8Array}
 */
function sha_3(M, d) {
	const c = 2 * d;
	const suffix = [2];
	const N = append_suffix(M, suffix);
	const m = N.length * 8;
	const K = keccak(c, N, m, d);
	return K;
}

/**
 *
 * @param {Uint8Array} M
 * @returns {Uint8Array}
 */
function sha_3_224(M) {
	const d = 224;
	return sha_3(M, d);
}

/**
 *
 * @param {Uint8Array} M
 * @returns {Uint8Array}
 */
function sha_3_256(M) {
	const d = 256;
	return sha_3(M, d);
}

/**
 *
 * @param {Uint8Array} M
 * @returns {Uint8Array}
 */
function sha_3_384(M) {
	const d = 384;
	return sha_3(M, d);
}

/**
 *
 * @param {Uint8Array} M
 * @returns {Uint8Array}
 */
function sha_3_512(M) {
	const d = 512;
	return sha_3(M, d);
}

export { sha_3_224, sha_3_256, sha_3_384, sha_3_512 };

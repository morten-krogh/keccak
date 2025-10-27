import { append_suffix } from "./suffix.js";
import { keccak } from "./keccak.js";

/**
 *
 * @param {Uint8Array} M
 * @returns {Uint8Array}
 */
function sha_3_224(M) {
        const suffix = [2];
        const N = append_suffix(M, suffix);
        const c = 224;
        const m = N.length * 8;
        const d = 224;
        const K = keccak(c, N, m, d);
        return K;
}

// SHA3-224(M) = KECCAK[448] (M || 01, 224);
// SHA3-256(M) = KECCAK[512] (M || 01, 256);
// SHA3-384(M) = KECCAK[768] (M || 01, 384);
// SHA3-512(M) = KECCAK[1024] (M || 01, 512).

export { sha_3_224 };

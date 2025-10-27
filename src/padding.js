import { set_bit } from "./bit.js";

/**
 * Specification of pad10*1
 *
 * Input:
 * positive integer x;
 * non-negative integer m.
 * Output:
 * string P such that m + len(P) is a positive multiple of x.
 * Steps:
 * 1. Let j = (– m – 2) mod x.
 * 2. Return P = 1 || 0j || 1.
 *
 * N is the bit string of length m bits.
 * x is the rate whicb the length of the padded string must
 * be a multiplum of. x is divisible by 8.
 * The function appends padding to N.
 * The return value is padded string
 *
 * @param {Uint8Array} N
 * @param {number} m
 * @param {number} x
 * @returns {Uint8Array}
 */
function pad(N, m, x) {
        let j = (-m - 2) % x;
        if (j < 0) {
                j += x;
        }
        const len_padding = j + 2;
        const len_padded_string = m + len_padding;
        const len_padded_string_bytes = len_padded_string / 8;
        const padded_string = new Uint8Array(len_padded_string_bytes);
        padded_string.set(N.slice(0, Math.ceil(m / 8)), 0);
        set_bit(padded_string, m, true);
        for (let i = m + 1; i < m + j + 1; i++) {
                set_bit(padded_string, i, false);
        }
        set_bit(padded_string, m + j + 1, true);
        return padded_string;
}

export { pad };

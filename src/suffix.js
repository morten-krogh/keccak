/**
 *
 * @param {Uint8Array} M
 * @param {number[]} suffix
 * @returns {Uint8Array}
 */
function append_suffix(M, suffix) {
        const len = M.length + suffix.length;
        const N = new Uint8Array(len);
        N.set(M, 0);
        for (let i = 0; i < suffix.length; i++) {
                const byte = /** @type {number} */ (suffix[i]);
                N[M.length + i] = byte;
        }
        return N;
}

export { append_suffix };

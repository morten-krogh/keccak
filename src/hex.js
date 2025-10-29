/**
 *
 * @param {string} hex
 * @param {number} i
 * @returns {boolean}
 */
function hex_get_bit(hex, i) {
	const index = Math.floor(i / 4);
	const bit_offset = i % 4;
	const char = /** @type {string} */ (hex[hex.length - 1 - index]);
	const decimal = parseInt(char, 16);
	const bit = (decimal >> bit_offset) & 1;
	return bit === 1;
}

export { hex_get_bit };

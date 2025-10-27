/**
 *
 * @param {Uint8Array} array
 * @param {number} bit_index
 * @returns {boolean}
 */
function get_bit(array, bit_index) {
	const byte_index = Math.floor(bit_index / 8);
	const bit_offset = bit_index % 8;
	const byte = /** @type {number} */ (array[byte_index]);
	const bit = (byte >> bit_offset) & 1;
	return bit === 1;
}

/**
 *
 * @param {Uint8Array} array
 * @param {number} bit_index
 * @param {boolean} bit
 */
function set_bit(array, bit_index, bit) {
	const byte_index = Math.floor(bit_index / 8);
	const bit_offset = bit_index % 8;
	if (bit) {
		// @ts-ignore
		array[byte_index] |= 1 << bit_offset;
	} else {
		// @ts-ignore
		array[byte_index] &= ~(1 << bit_offset);
	}
}

export { get_bit, set_bit };

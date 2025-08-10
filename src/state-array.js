/**
 *
 * @returns {Uint8Array}
 */
function make_state_array() {
	return new Uint8Array(200);
}

/**
 *
 * @param {Uint8Array} state_array
 * @param {number} byte
 */
function fill_state_array_with_byte(state_array, byte) {
	for (let i = 0; i < state_array.length; i++) {
		state_array[i] = byte;
	}
}

/**
 *
 * @param {Uint8Array} state_array
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @returns {boolean}
 */
function get_bit_in_state_array(state_array, x, y, z) {
	console.assert(x >= 0 && x < 5);
	console.assert(y >= 0 && y < 5);
	console.assert(z >= 0 && z < 64);
	const bit_index = 64 * (5 * y + x) + z;
	const byte_index = Math.floor(bit_index / 8);
	const bit_offset = bit_index % 8;
	const byte = /** @type {number} */ (state_array[byte_index]);
	const bit = (byte >> bit_offset) & 1;
	// console.log({ bit_index, byte_index, bit_offset, byte, bit });
	return bit !== 0;
}

/**
 *
 * @param {Uint8Array} state_array
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @param {boolean} bit
 */
function set_bit_in_state_array(state_array, x, y, z, bit) {
	const bit_index = 64 * (5 * (y % 5) + (x % 5)) + (z % 64);
	const byte_index = Math.floor(bit_index / 8);
	const bit_offset = bit_index % 8;
	if (bit) {
		// @ts-ignore
		state_array[byte_index] |= 1 << bit_offset;
	} else {
		// @ts-ignore
		state_array[byte_index] &= ~(1 << bit_offset);
	}
}

/**
 *
 * @param {Uint8Array} state_array
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @param {boolean} bit
 */
function add_bit_in_state_array(state_array, x, y, z, bit) {
	if (!bit) {
		return;
	}
	const bit_index = 64 * (5 * (y % 5) + (x % 5)) + (z % 64);
	const byte_index = Math.floor(bit_index / 8);
	const bit_offset = bit_index % 8;
	// @ts-ignore
	state_array[byte_index] ^= 1 << bit_offset;
}

/**
 *
 * @param {Uint8Array} src_state_array
 * @param {Uint8Array} dest_state_array
 */
function copy_state_array(src_state_array, dest_state_array) {
	console.assert(src_state_array.length === dest_state_array.length);
	for (let i = 0; i < src_state_array.length; i++) {
		// @ts-ignore
		dest_state_array[i] = src_state_array[i];
	}
}

/**
 *
 * @param {Uint8Array} state_array
 * @returns {boolean}
 */
function is_zero_state_array(state_array) {
	for (const entry of state_array) {
		if (entry !== 0) {
			return false;
		}
	}
	return true;
}

export {
	make_state_array,
	fill_state_array_with_byte,
	get_bit_in_state_array,
	set_bit_in_state_array,
	add_bit_in_state_array,
	copy_state_array,
	is_zero_state_array,
};

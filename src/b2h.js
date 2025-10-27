/**
 *
 * @param {Uint8Array} b
 * @returns {string}
 */
function b2h(b) {
	let h = "";
	for (const byte of b) {
		const doublet = byte.toString(16);
		h += doublet;
	}
	return h.toUpperCase();
}

export { b2h };

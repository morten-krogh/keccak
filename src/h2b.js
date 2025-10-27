/**
 *
 * @param {string} h
 * @returns {Uint8Array}
 */
function h2b(h) {
	console.assert(h.length % 2 === 0);
	const m = h.length / 2;
	const b = new Uint8Array(m);
	for (let i = 0; i < m; i++) {
		const digits = h.slice(2 * i, 2 * i + 2);
		const byte = parseInt(digits, 16);
		b[i] = byte;
	}
	return b;
}

export { h2b };

/**
 *
 * @param {string} s
 * @returns {string}
 */
function remove_whitespace(s) {
	return s.replaceAll(/\s/g, "");
}

export { remove_whitespace };

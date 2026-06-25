const DATA_OFFSET = 200;
const STATE_BYTES = 200;
const SHA3_SUFFIX = 0x06;
const HEX_ALPHABET = "0123456789abcdef";

/**
 * @typedef {"hex" | "bytes"} DigestFormat
 */

/**
 * @typedef {{
 *   name: string,
 *   capacityBytes: number,
 *   digestBytes: number,
 *   rateBytes: number,
 * }} AlgorithmConfig
 */

/**
 * @typedef {{
 *   memory: WebAssembly.Memory,
 *   keccak_p: () => void,
 *   absorb: (c: number, m: number) => void,
 *   squeeze: (c: number, d: number) => void,
 * }} SpongeExports
 */

/** @type {ReadonlyMap<string, AlgorithmConfig>} */
const ALGORITHMS = new Map([
	[
		"sha3-224",
		{ name: "sha3-224", capacityBytes: 56, digestBytes: 28, rateBytes: 144 },
	],
	[
		"sha3-256",
		{ name: "sha3-256", capacityBytes: 64, digestBytes: 32, rateBytes: 136 },
	],
	[
		"sha3-384",
		{ name: "sha3-384", capacityBytes: 96, digestBytes: 48, rateBytes: 104 },
	],
	[
		"sha3-512",
		{ name: "sha3-512", capacityBytes: 128, digestBytes: 64, rateBytes: 72 },
	],
]);

/** @type {WebAssembly.Module | null} */
let wasm_module = null;

/**
 * @param {string | URL | Request} wasmUrl
 * @returns {Promise<void>}
 */
async function initHash(
	wasmUrl = new URL("./keccak-sponge.wasm", import.meta.url),
) {
	const response = await fetch(wasmUrl);
	if (!response.ok) {
		throw new Error(`Failed to fetch WASM module: ${response.status}`);
	}
	const wasm_bytes = await response.arrayBuffer();
	wasm_module = await WebAssembly.compile(wasm_bytes);
}

/**
 * @param {string} algorithm
 * @returns {AlgorithmConfig}
 */
function get_algorithm_config(algorithm) {
	if (typeof algorithm !== "string") {
		throw new TypeError('The "algorithm" argument must be a string');
	}
	const normalized = algorithm.toLowerCase();
	const config = ALGORITHMS.get(normalized);
	if (!config) {
		throw new Error(`Digest method not supported: ${algorithm}`);
	}
	return config;
}

/**
 * @returns {SpongeExports}
 */
function instantiate_sponge() {
	if (!wasm_module) {
		throw new Error("Hash WASM module has not been initialized");
	}
	const { exports } = new WebAssembly.Instance(wasm_module);
	return /** @type {SpongeExports} */ (exports);
}

class Hash {
	/** @type {string} */
	algorithm;

	/** @type {AlgorithmConfig} */
	#config;

	/** @type {SpongeExports} */
	#sponge;

	/** @type {Uint8Array} */
	#memory;

	/** @type {Uint8Array} */
	#state;

	/** @type {Uint8Array} */
	#pending;

	/** @type {number} */
	#pendingLength = 0;

	/** @type {Uint8Array | null} */
	#finalDigest = null;

	/**
	 * @param {string} algorithm
	 */
	constructor(algorithm) {
		this.#config = get_algorithm_config(algorithm);
		this.algorithm = this.#config.name;
		this.#sponge = instantiate_sponge();
		this.#memory = new Uint8Array(this.#sponge.memory.buffer);
		this.#state = new Uint8Array(STATE_BYTES);
		this.#pending = new Uint8Array(this.#config.rateBytes);
	}

	/**
	 * @param {Uint8Array} data
	 * @returns {this}
	 */
	update(data) {
		if (this.#finalDigest) {
			throw new Error(
				"Hash update failed because digest() has already been called",
			);
		}
		if (!(data instanceof Uint8Array)) {
			throw new TypeError('The "data" argument must be a Uint8Array');
		}
		this.#update_bytes(data);
		return this;
	}

	/**
	 * @returns {Uint8Array}
	 */
	digest() {
		if (this.#finalDigest) {
			throw new Error("Digest already called");
		}
		const digest = this.#finalize();
		this.#finalDigest = digest;
		return new Uint8Array(digest);
	}

	/**
	 * @returns {Hash}
	 */
	copy() {
		if (this.#finalDigest) {
			throw new Error(
				"Hash copy failed because digest() has already been called",
			);
		}
		const hash = new Hash(this.#config.name);
		hash.#state.set(this.#state);
		hash.#pending.set(this.#pending.subarray(0, this.#pendingLength));
		hash.#pendingLength = this.#pendingLength;
		return hash;
	}

	/**
	 * @param {Uint8Array} bytes
	 */
	#update_bytes(bytes) {
		if (bytes.length === 0) {
			return;
		}

		let offset = 0;
		const rateBytes = this.#config.rateBytes;
		if (this.#pendingLength !== 0) {
			const take = Math.min(rateBytes - this.#pendingLength, bytes.length);
			this.#pending.set(bytes.subarray(0, take), this.#pendingLength);
			this.#pendingLength += take;
			offset += take;
			if (this.#pendingLength === rateBytes) {
				this.#absorb_blocks(this.#pending);
				this.#pendingLength = 0;
			}
		}

		const fullBlockLength =
			bytes.length - offset - ((bytes.length - offset) % rateBytes);
		if (fullBlockLength !== 0) {
			this.#absorb_blocks(bytes.subarray(offset, offset + fullBlockLength));
			offset += fullBlockLength;
		}

		const remaining = bytes.length - offset;
		if (remaining !== 0) {
			this.#pending.set(bytes.subarray(offset), 0);
			this.#pendingLength = remaining;
		}
	}

	/**
	 * @param {Uint8Array} bytes
	 */
	#absorb_blocks(bytes) {
		const rateBytes = this.#config.rateBytes;
		const maxBytes =
			Math.floor((this.#memory.length - DATA_OFFSET) / rateBytes) * rateBytes;
		for (let offset = 0; offset < bytes.length; offset += maxBytes) {
			const chunk = bytes.subarray(offset, offset + maxBytes);
			this.#memory.set(this.#state, 0);
			this.#memory.set(chunk, DATA_OFFSET);
			this.#sponge.absorb(this.#config.capacityBytes, chunk.length);
			this.#state.set(this.#memory.subarray(0, STATE_BYTES));
		}
	}

	/**
	 * @returns {Uint8Array}
	 */
	#finalize() {
		const finalBlock = new Uint8Array(this.#config.rateBytes);
		finalBlock.set(this.#pending.subarray(0, this.#pendingLength));
		const suffixIndex = this.#pendingLength;
		finalBlock[suffixIndex] = (finalBlock[suffixIndex] ?? 0) | SHA3_SUFFIX;
		const finalIndex = this.#config.rateBytes - 1;
		finalBlock[finalIndex] = (finalBlock[finalIndex] ?? 0) | 0x80;
		this.#absorb_blocks(finalBlock);
		this.#pendingLength = 0;

		this.#memory.set(this.#state, 0);
		this.#sponge.squeeze(this.#config.capacityBytes, this.#config.digestBytes);
		return new Uint8Array(
			this.#memory.subarray(
				DATA_OFFSET,
				DATA_OFFSET + this.#config.digestBytes,
			),
		);
	}
}

/**
 * @param {string} algorithm
 * @returns {Hash}
 */
function createHash(algorithm) {
	return new Hash(algorithm);
}

/**
 * @param {string | Uint8Array} message
 * @returns {Uint8Array}
 */
function message_to_bytes(message) {
	if (typeof message === "string") {
		return new TextEncoder().encode(message);
	}
	if (message instanceof Uint8Array) {
		return message;
	}
	throw new TypeError('The "message" argument must be a string or Uint8Array');
}

/**
 * @param {Uint8Array} bytes
 * @returns {string}
 */
function bytes_to_hex(bytes) {
	let hex = "";
	for (const byte of bytes) {
		hex += HEX_ALPHABET[byte >> 4] ?? "";
		hex += HEX_ALPHABET[byte & 0x0f] ?? "";
	}
	return hex;
}

/**
 * @param {Uint8Array} digest
 * @param {DigestFormat} digest_format
 * @returns {string | Uint8Array}
 */
function format_digest(digest, digest_format) {
	if (digest_format === "hex") {
		return bytes_to_hex(digest);
	}
	if (digest_format === "bytes") {
		return digest;
	}
	throw new TypeError('The "digest_format" argument must be "hex" or "bytes"');
}

/**
 * @param {string} algorithm
 * @param {string | Uint8Array} message
 * @param {DigestFormat} [digest_format]
 * @returns {string | Uint8Array}
 */
function sha3_digest(algorithm, message, digest_format = "hex") {
	const bytes = message_to_bytes(message);
	const digest = createHash(algorithm).update(bytes).digest();
	return format_digest(digest, digest_format);
}

/**
 * @param {string | Uint8Array} message
 * @param {DigestFormat} [digest_format]
 * @returns {string | Uint8Array}
 */
function sha3_224(message, digest_format = "hex") {
	return sha3_digest("sha3-224", message, digest_format);
}

/**
 * @param {string | Uint8Array} message
 * @param {DigestFormat} [digest_format]
 * @returns {string | Uint8Array}
 */
function sha3_256(message, digest_format = "hex") {
	return sha3_digest("sha3-256", message, digest_format);
}

/**
 * @param {string | Uint8Array} message
 * @param {DigestFormat} [digest_format]
 * @returns {string | Uint8Array}
 */
function sha3_384(message, digest_format = "hex") {
	return sha3_digest("sha3-384", message, digest_format);
}

/**
 * @param {string | Uint8Array} message
 * @param {DigestFormat} [digest_format]
 * @returns {string | Uint8Array}
 */
function sha3_512(message, digest_format = "hex") {
	return sha3_digest("sha3-512", message, digest_format);
}

export { Hash, createHash, initHash, sha3_224, sha3_256, sha3_384, sha3_512 };

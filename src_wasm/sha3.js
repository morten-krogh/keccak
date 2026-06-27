const DATA_OFFSET = 392;
const STATE_BYTES = 200;
const SHA3_SUFFIX = 0x06;

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
 *   absorb: (c: number, m: number, useZeroInsteadOfMemoryForInput: number) => void,
 *   squeeze: (c: number, d: number) => void,
 * }} SpongeExports
 */

/**
 * @typedef {string | URL | Request | WebAssembly.Module} WasmSource
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

class Hash {
	/** @type {string} */
	algorithm;

	/** @type {WebAssembly.Instance} */
	#wasmInstance;

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
	 * @param {WebAssembly.Instance} wasm_instance
	 * @param {AlgorithmConfig} config
	 */
	constructor(wasm_instance, config) {
		this.#wasmInstance = wasm_instance;
		this.#config = config;
		this.algorithm = this.#config.name;
		this.#sponge = /** @type {SpongeExports} */ (wasm_instance.exports);
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
		const hash = new Hash(this.#wasmInstance, this.#config);
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
			this.#sponge.absorb(this.#config.capacityBytes, chunk.length, 0);
			this.#state.set(this.#memory.subarray(0, STATE_BYTES));
		}
	}

	/**
	 * @returns {Uint8Array}
	 */
	#finalize() {
		const suffixIndex = this.#pendingLength;
		this.#pending.fill(0, suffixIndex);
		this.#pending[suffixIndex] =
			(this.#pending[suffixIndex] ?? 0) | SHA3_SUFFIX;
		const finalIndex = this.#config.rateBytes - 1;
		this.#pending[finalIndex] = (this.#pending[finalIndex] ?? 0) | 0x80;
		this.#absorb_blocks(this.#pending);
		this.#pendingLength = 0;

		return new Uint8Array(this.#state.subarray(0, this.#config.digestBytes));
	}
}

class Sha3 {
	/** @type {WebAssembly.Instance | null} */
	#wasm_instance = null;

	/**
	 * @param {WasmSource} wasm_source
	 * @returns {Promise<this>}
	 */
	async initialize(wasm_source) {
		if (wasm_source instanceof WebAssembly.Module) {
			this.#wasm_instance = await WebAssembly.instantiate(wasm_source);
			return this;
		}
		const result = await WebAssembly.instantiateStreaming(fetch(wasm_source));
		this.#wasm_instance = result.instance;
		return this;
	}

	/**
	 * @param {string} algorithm
	 * @returns {Hash}
	 */
	createHash(algorithm) {
		if (!this.#wasm_instance) {
			throw new Error("Sha3 WASM instance has not been initialized");
		}
		const config = get_algorithm_config(algorithm);
		return new Hash(this.#wasm_instance, config);
	}
}

export { Sha3 };

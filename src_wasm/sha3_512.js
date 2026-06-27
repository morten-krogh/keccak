const DATA_OFFSET = 392;
const STATE_BYTES = 200;
const RATE_BYTES = 72;
const DIGEST_BYTES = 64;
const SHA3_SUFFIX = 0x06;

/**
 * @typedef {{
 *   memory: WebAssembly.Memory,
 *   absorb: (m: number) => void,
 * }} Sha3_512Exports
 */

/**
 * @typedef {string | URL | Request | WebAssembly.Module} WasmSource
 */

class Hash {
	/** @type {string} */
	algorithm = "sha3-512";

	/** @type {WebAssembly.Instance} */
	#wasmInstance;

	/** @type {Sha3_512Exports} */
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
	 */
	constructor(wasm_instance) {
		this.#wasmInstance = wasm_instance;
		this.#sponge = /** @type {Sha3_512Exports} */ (wasm_instance.exports);
		this.#memory = new Uint8Array(this.#sponge.memory.buffer);
		this.#state = new Uint8Array(STATE_BYTES);
		this.#pending = new Uint8Array(RATE_BYTES);
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
		const hash = new Hash(this.#wasmInstance);
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
		if (this.#pendingLength !== 0) {
			const take = Math.min(RATE_BYTES - this.#pendingLength, bytes.length);
			this.#pending.set(bytes.subarray(0, take), this.#pendingLength);
			this.#pendingLength += take;
			offset += take;
			if (this.#pendingLength === RATE_BYTES) {
				this.#absorb_blocks(this.#pending);
				this.#pendingLength = 0;
			}
		}

		const fullBlockLength =
			bytes.length - offset - ((bytes.length - offset) % RATE_BYTES);
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
		const maxBytes =
			Math.floor((this.#memory.length - DATA_OFFSET) / RATE_BYTES) * RATE_BYTES;
		for (let offset = 0; offset < bytes.length; offset += maxBytes) {
			const chunk = bytes.subarray(offset, offset + maxBytes);
			this.#memory.set(this.#state, 0);
			this.#memory.set(chunk, DATA_OFFSET);
			this.#sponge.absorb(chunk.length);
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
		const finalIndex = RATE_BYTES - 1;
		this.#pending[finalIndex] = (this.#pending[finalIndex] ?? 0) | 0x80;
		this.#absorb_blocks(this.#pending);
		this.#pendingLength = 0;

		return new Uint8Array(this.#state.subarray(0, DIGEST_BYTES));
	}
}

class Sha3_512 {
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
	 * @returns {Hash}
	 */
	createHash() {
		if (!this.#wasm_instance) {
			throw new Error("Sha3_512 WASM instance has not been initialized");
		}
		return new Hash(this.#wasm_instance);
	}
}

export { Sha3_512 };

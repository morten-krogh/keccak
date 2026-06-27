const DATA_OFFSET = 200;
const STATE_BYTES = 200;
const SHAKE_SUFFIX = 0x1f;

/**
 * @typedef {{
 *   capacityBytes: number,
 *   rateBytes: number,
 * }} ShakeConfig
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

/** @type {ShakeConfig} */
const SHAKE128 = { capacityBytes: 32, rateBytes: 168 };

/** @type {ShakeConfig} */
const SHAKE256 = { capacityBytes: 64, rateBytes: 136 };

/**
 * @param {number} output_length
 * @param {number} max_output_length
 */
function assert_valid_output_length(output_length, max_output_length) {
	if (!Number.isSafeInteger(output_length) || output_length < 0) {
		throw new RangeError('The "d" argument must be a nonnegative safe integer');
	}
	if (output_length > max_output_length) {
		throw new RangeError(
			'The "d" argument exceeds the WASM memory output area',
		);
	}
}

class Shake {
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
	 * @param {Uint8Array} message
	 * @param {number} d
	 * @returns {Uint8Array}
	 */
	shake_128(message, d) {
		return this.#shake(SHAKE128, message, d);
	}

	/**
	 * @param {Uint8Array} message
	 * @param {number} d
	 * @returns {Uint8Array}
	 */
	shake_256(message, d) {
		return this.#shake(SHAKE256, message, d);
	}

	/**
	 * @param {ShakeConfig} config
	 * @param {Uint8Array} message
	 * @param {number} output_length
	 * @returns {Uint8Array}
	 */
	#shake(config, message, output_length) {
		if (!this.#wasm_instance) {
			throw new Error("Shake WASM instance has not been initialized");
		}
		if (!(message instanceof Uint8Array)) {
			throw new TypeError('The "message" argument must be a Uint8Array');
		}

		const sponge = /** @type {SpongeExports} */ (this.#wasm_instance.exports);
		const memory = new Uint8Array(sponge.memory.buffer);
		assert_valid_output_length(output_length, memory.length - DATA_OFFSET);

		const state = new Uint8Array(STATE_BYTES);
		this.#absorb_message(sponge, memory, state, config, message);
		memory.set(state, 0);
		sponge.squeeze(config.capacityBytes, output_length);
		return new Uint8Array(
			memory.subarray(DATA_OFFSET, DATA_OFFSET + output_length),
		);
	}

	/**
	 * @param {SpongeExports} sponge
	 * @param {Uint8Array} memory
	 * @param {Uint8Array} state
	 * @param {ShakeConfig} config
	 * @param {Uint8Array} message
	 */
	#absorb_message(sponge, memory, state, config, message) {
		const full_block_length =
			message.length - (message.length % config.rateBytes);
		if (full_block_length !== 0) {
			this.#absorb_blocks(
				sponge,
				memory,
				state,
				config,
				message.subarray(0, full_block_length),
			);
		}

		const final_block = new Uint8Array(config.rateBytes);
		const remaining = message.subarray(full_block_length);
		final_block.set(remaining);
		final_block[remaining.length] =
			(final_block[remaining.length] ?? 0) | SHAKE_SUFFIX;
		final_block[config.rateBytes - 1] =
			(final_block[config.rateBytes - 1] ?? 0) | 0x80;
		this.#absorb_blocks(sponge, memory, state, config, final_block);
	}

	/**
	 * @param {SpongeExports} sponge
	 * @param {Uint8Array} memory
	 * @param {Uint8Array} state
	 * @param {ShakeConfig} config
	 * @param {Uint8Array} bytes
	 */
	#absorb_blocks(sponge, memory, state, config, bytes) {
		const max_bytes =
			Math.floor((memory.length - DATA_OFFSET) / config.rateBytes) *
			config.rateBytes;
		if (max_bytes < config.rateBytes) {
			throw new RangeError("The WASM memory is too small for the SHAKE rate");
		}
		for (let offset = 0; offset < bytes.length; offset += max_bytes) {
			const chunk = bytes.subarray(offset, offset + max_bytes);
			memory.set(state, 0);
			memory.set(chunk, DATA_OFFSET);
			sponge.absorb(config.capacityBytes, chunk.length, 0);
			state.set(memory.subarray(0, STATE_BYTES));
		}
	}
}

export { Shake };

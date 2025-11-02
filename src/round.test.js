import assert from "node:assert/strict";
import test from "node:test";
import { b2h } from "./b2h.js";
import { remove_whitespace } from "./format.js";
import { h2b } from "./h2b.js";
import { do_round } from "./round.js";
import { is_zero_state_array, make_state_array } from "./state-array.js";

test("round zero from zero state array", (_t) => {
	const state_array = make_state_array();
	const scratch_space = make_state_array();
	assert(is_zero_state_array(state_array));
	const i_roound = 0;
	do_round(state_array, scratch_space, i_roound);
	assert(!is_zero_state_array(state_array));
});

test("NIST test 1", (_t) => {
	const hex_before_raw = `
                06 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
                00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
                00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
                00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
                00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
                00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
                00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
                00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
                00 00 00 00 00 00 00 80 00 00 00 00 00 00 00 00
                00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
                00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
                00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
                00 00 00 00 00 00 00 00
        `;
	const hex_after_rounds_raw = [
		`
                06 00 00 00 00 04 00 00 00 00 00 00 00 60 00 00
                00 00 03 00 00 04 00 00 07 00 00 00 00 00 00 00
                00 00 03 00 00 60 00 00 08 00 00 00 00 00 00 00
                00 00 C0 00 00 D0 00 00 08 00 00 00 00 00 00 10
                00 00 00 00 00 D0 00 00 00 00 C0 00 00 00 00 10
                0C 00 00 00 00 00 00 00 20 0C 00 00 00 00 00 00
                00 00 04 00 00 00 00 00 0C 0C 00 00 00 00 00 00
                20 00 04 00 00 00 00 00 00 18 00 60 00 00 00 00
                00 40 00 00 10 00 00 00 00 18 00 00 00 00 00 00
                00 40 00 60 00 00 00 00 00 00 00 00 10 00 00 00
                00 00 00 00 00 06 00 20 00 00 00 00 00 00 00 00
                18 00 00 00 00 06 00 00 00 00 00 00 00 02 00 20
                18 00 00 00 00 00 00 00
	`,
		`
                FE 98 C7 01 30 96 20 14 14 06 66 09 2B 21 8E A2
                06 5E A1 1B 00 BA 21 17 66 00 44 0C 1B 35 0D 44
                00 DE 25 13 00 08 02 D7 82 CF 08 79 06 90 18 80
                0C 0C 35 C0 07 4C 0E 2D 24 D1 24 12 C2 23 08 80
                23 08 C2 63 84 D1 1C CD 88 1A EF 98 43 2E 02 A8
                44 50 5C 08 08 DE 02 40 F4 01 29 30 B0 04 91 00
                80 C1 E0 B9 36 17 03 58 20 1F 60 80 A0 D8 D6 00
                94 CF C1 51 2E 05 85 18 B0 0D 80 43 60 1B 00 05
                00 23 1B 46 61 E7 79 9E 18 81 90 38 00 01 08 60
                A0 24 1B 3D 40 7B 08 8F 18 8B 11 20 C1 84 69 70
                5D F5 5B 30 B4 53 26 92 0E A4 00 12 09 E0 18 BD
                58 80 53 80 B1 1F 3E 02 C7 35 00 32 24 B4 00 1F
                08 A0 38 80 08 18 18 20
        `,
		`
                35 A3 1F 61 40 C0 3E 33 33 6C C6 B4 42 CA 71 17
                E2 AE DB 70 AF F6 0A E8 B6 3F 4F 4A 4D 1B AC C0
                FB 73 A8 88 97 DA 60 B6 81 8D 87 8D F8 62 3A 5F
                CD 5D 03 B8 FC F8 85 4C 7D 4C F2 10 3D C0 2D 6B
                23 A7 86 0A EA 50 62 C4 59 72 99 6F F8 BA 7F 53
                61 CA C4 26 B6 26 46 75 07 C0 A6 E7 99 AA EC 7C
                6F 02 85 B7 08 04 59 1A EE B8 F6 79 D2 6E 45 AF
                4E C4 43 BB A2 82 4C 4F 96 36 47 47 3D 49 EA 3F
                24 4B B7 F0 BB CE BF 9A 6E 10 87 9C D2 15 8F EB
                37 7B FE C2 21 A2 83 86 1B E2 46 99 D9 D1 C8 BD
                60 F7 EE 64 D0 86 2B 30 07 9A DF 44 0B 14 E7 EC
                E3 D0 EA B9 63 1F 0E C6 46 FD 3E F5 C4 7E 6A E0
                79 10 12 00 AB 31 71 5C
        `,
	];
	const hex_before = remove_whitespace(hex_before_raw);
	const state_array = h2b(hex_before);
	const scratch_space = make_state_array();
	for (let i_round = 0; i_round < hex_after_rounds_raw.length; i_round++) {
		do_round(state_array, scratch_space, i_round);
		const hex_result = b2h(state_array);
		const hex_after_round_raw = /** @type {string} */ (
			hex_after_rounds_raw[i_round]
		);
		const hex_after_round = remove_whitespace(hex_after_round_raw);
		assert.equal(hex_result, hex_after_round);
	}
});

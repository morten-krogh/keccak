(module
	(memory $memory 1)
	(func $do_iota (param $i_round i32)
		(local $lane_0_0 i64)
		(local $lane_1_0 i64)
		(local $lane_2_0 i64)
		(local $lane_3_0 i64)
		(local $lane_4_0 i64)
		(local $lane_0_1 i64)
		(local $lane_1_1 i64)
		(local $lane_2_1 i64)
		(local $lane_3_1 i64)
		(local $lane_4_1 i64)
		(local $lane_0_2 i64)
		(local $lane_1_2 i64)
		(local $lane_2_2 i64)
		(local $lane_3_2 i64)
		(local $lane_4_2 i64)
		(local $lane_0_3 i64)
		(local $lane_1_3 i64)
		(local $lane_2_3 i64)
		(local $lane_3_3 i64)
		(local $lane_4_3 i64)
		(local $lane_0_4 i64)
		(local $lane_1_4 i64)
		(local $lane_2_4 i64)
		(local $lane_3_4 i64)
		(local $lane_4_4 i64)
		(local $round_constant i64)

		i32.const 0
		i64.load offset=0
		local.set $lane_0_0
		i32.const 0
		i64.load offset=8
		local.set $lane_1_0
		i32.const 0
		i64.load offset=16
		local.set $lane_2_0
		i32.const 0
		i64.load offset=24
		local.set $lane_3_0
		i32.const 0
		i64.load offset=32
		local.set $lane_4_0
		i32.const 0
		i64.load offset=40
		local.set $lane_0_1
		i32.const 0
		i64.load offset=48
		local.set $lane_1_1
		i32.const 0
		i64.load offset=56
		local.set $lane_2_1
		i32.const 0
		i64.load offset=64
		local.set $lane_3_1
		i32.const 0
		i64.load offset=72
		local.set $lane_4_1
		i32.const 0
		i64.load offset=80
		local.set $lane_0_2
		i32.const 0
		i64.load offset=88
		local.set $lane_1_2
		i32.const 0
		i64.load offset=96
		local.set $lane_2_2
		i32.const 0
		i64.load offset=104
		local.set $lane_3_2
		i32.const 0
		i64.load offset=112
		local.set $lane_4_2
		i32.const 0
		i64.load offset=120
		local.set $lane_0_3
		i32.const 0
		i64.load offset=128
		local.set $lane_1_3
		i32.const 0
		i64.load offset=136
		local.set $lane_2_3
		i32.const 0
		i64.load offset=144
		local.set $lane_3_3
		i32.const 0
		i64.load offset=152
		local.set $lane_4_3
		i32.const 0
		i64.load offset=160
		local.set $lane_0_4
		i32.const 0
		i64.load offset=168
		local.set $lane_1_4
		i32.const 0
		i64.load offset=176
		local.set $lane_2_4
		i32.const 0
		i64.load offset=184
		local.set $lane_3_4
		i32.const 0
		i64.load offset=192
		local.set $lane_4_4

		local.get $i_round
		i32.const 0
		i32.eq
		if
			i64.const 0x0000000000000001
			local.set $round_constant
		end
		local.get $i_round
		i32.const 1
		i32.eq
		if
			i64.const 0x0000000000008082
			local.set $round_constant
		end
		local.get $i_round
		i32.const 2
		i32.eq
		if
			i64.const 0x800000000000808a
			local.set $round_constant
		end
		local.get $i_round
		i32.const 3
		i32.eq
		if
			i64.const 0x8000000080008000
			local.set $round_constant
		end
		local.get $i_round
		i32.const 4
		i32.eq
		if
			i64.const 0x000000000000808b
			local.set $round_constant
		end
		local.get $i_round
		i32.const 5
		i32.eq
		if
			i64.const 0x0000000080000001
			local.set $round_constant
		end
		local.get $i_round
		i32.const 6
		i32.eq
		if
			i64.const 0x8000000080008081
			local.set $round_constant
		end
		local.get $i_round
		i32.const 7
		i32.eq
		if
			i64.const 0x8000000000008009
			local.set $round_constant
		end
		local.get $i_round
		i32.const 8
		i32.eq
		if
			i64.const 0x000000000000008a
			local.set $round_constant
		end
		local.get $i_round
		i32.const 9
		i32.eq
		if
			i64.const 0x0000000000000088
			local.set $round_constant
		end
		local.get $i_round
		i32.const 10
		i32.eq
		if
			i64.const 0x0000000080008009
			local.set $round_constant
		end
		local.get $i_round
		i32.const 11
		i32.eq
		if
			i64.const 0x000000008000000a
			local.set $round_constant
		end
		local.get $i_round
		i32.const 12
		i32.eq
		if
			i64.const 0x000000008000808b
			local.set $round_constant
		end
		local.get $i_round
		i32.const 13
		i32.eq
		if
			i64.const 0x800000000000008b
			local.set $round_constant
		end
		local.get $i_round
		i32.const 14
		i32.eq
		if
			i64.const 0x8000000000008089
			local.set $round_constant
		end
		local.get $i_round
		i32.const 15
		i32.eq
		if
			i64.const 0x8000000000008003
			local.set $round_constant
		end
		local.get $i_round
		i32.const 16
		i32.eq
		if
			i64.const 0x8000000000008002
			local.set $round_constant
		end
		local.get $i_round
		i32.const 17
		i32.eq
		if
			i64.const 0x8000000000000080
			local.set $round_constant
		end
		local.get $i_round
		i32.const 18
		i32.eq
		if
			i64.const 0x000000000000800a
			local.set $round_constant
		end
		local.get $i_round
		i32.const 19
		i32.eq
		if
			i64.const 0x800000008000000a
			local.set $round_constant
		end
		local.get $i_round
		i32.const 20
		i32.eq
		if
			i64.const 0x8000000080008081
			local.set $round_constant
		end
		local.get $i_round
		i32.const 21
		i32.eq
		if
			i64.const 0x8000000000008080
			local.set $round_constant
		end
		local.get $i_round
		i32.const 22
		i32.eq
		if
			i64.const 0x0000000080000001
			local.set $round_constant
		end
		local.get $i_round
		i32.const 23
		i32.eq
		if
			i64.const 0x8000000080008008
			local.set $round_constant
		end

		local.get $lane_0_0
		local.get $round_constant
		i64.xor
		local.set $lane_0_0

		i32.const 0
		local.get $lane_0_0
		i64.store offset=0
		i32.const 0
		local.get $lane_1_0
		i64.store offset=8
		i32.const 0
		local.get $lane_2_0
		i64.store offset=16
		i32.const 0
		local.get $lane_3_0
		i64.store offset=24
		i32.const 0
		local.get $lane_4_0
		i64.store offset=32
		i32.const 0
		local.get $lane_0_1
		i64.store offset=40
		i32.const 0
		local.get $lane_1_1
		i64.store offset=48
		i32.const 0
		local.get $lane_2_1
		i64.store offset=56
		i32.const 0
		local.get $lane_3_1
		i64.store offset=64
		i32.const 0
		local.get $lane_4_1
		i64.store offset=72
		i32.const 0
		local.get $lane_0_2
		i64.store offset=80
		i32.const 0
		local.get $lane_1_2
		i64.store offset=88
		i32.const 0
		local.get $lane_2_2
		i64.store offset=96
		i32.const 0
		local.get $lane_3_2
		i64.store offset=104
		i32.const 0
		local.get $lane_4_2
		i64.store offset=112
		i32.const 0
		local.get $lane_0_3
		i64.store offset=120
		i32.const 0
		local.get $lane_1_3
		i64.store offset=128
		i32.const 0
		local.get $lane_2_3
		i64.store offset=136
		i32.const 0
		local.get $lane_3_3
		i64.store offset=144
		i32.const 0
		local.get $lane_4_3
		i64.store offset=152
		i32.const 0
		local.get $lane_0_4
		i64.store offset=160
		i32.const 0
		local.get $lane_1_4
		i64.store offset=168
		i32.const 0
		local.get $lane_2_4
		i64.store offset=176
		i32.const 0
		local.get $lane_3_4
		i64.store offset=184
		i32.const 0
		local.get $lane_4_4
		i64.store offset=192
	)
	(export "memory" (memory $memory))
	(export "do_iota" (func $do_iota))
)

(module
	(memory $mem_state 1)
	(func $reset_state
		i32.const 0
		i32.const 0
		i32.const 200
		memory.fill
	)
	(func $do_rho
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

		local.get $lane_1_0
		i64.const 1
		i64.rotl
		local.set $lane_1_0
		local.get $lane_2_0
		i64.const 62
		i64.rotl
		local.set $lane_2_0
		local.get $lane_3_0
		i64.const 28
		i64.rotl
		local.set $lane_3_0
		local.get $lane_4_0
		i64.const 27
		i64.rotl
		local.set $lane_4_0
		local.get $lane_0_1
		i64.const 36
		i64.rotl
		local.set $lane_0_1
		local.get $lane_1_1
		i64.const 44
		i64.rotl
		local.set $lane_1_1
		local.get $lane_2_1
		i64.const 6
		i64.rotl
		local.set $lane_2_1
		local.get $lane_3_1
		i64.const 55
		i64.rotl
		local.set $lane_3_1
		local.get $lane_4_1
		i64.const 20
		i64.rotl
		local.set $lane_4_1
		local.get $lane_0_2
		i64.const 3
		i64.rotl
		local.set $lane_0_2
		local.get $lane_1_2
		i64.const 10
		i64.rotl
		local.set $lane_1_2
		local.get $lane_2_2
		i64.const 43
		i64.rotl
		local.set $lane_2_2
		local.get $lane_3_2
		i64.const 25
		i64.rotl
		local.set $lane_3_2
		local.get $lane_4_2
		i64.const 39
		i64.rotl
		local.set $lane_4_2
		local.get $lane_0_3
		i64.const 41
		i64.rotl
		local.set $lane_0_3
		local.get $lane_1_3
		i64.const 45
		i64.rotl
		local.set $lane_1_3
		local.get $lane_2_3
		i64.const 15
		i64.rotl
		local.set $lane_2_3
		local.get $lane_3_3
		i64.const 21
		i64.rotl
		local.set $lane_3_3
		local.get $lane_4_3
		i64.const 8
		i64.rotl
		local.set $lane_4_3
		local.get $lane_0_4
		i64.const 18
		i64.rotl
		local.set $lane_0_4
		local.get $lane_1_4
		i64.const 2
		i64.rotl
		local.set $lane_1_4
		local.get $lane_2_4
		i64.const 61
		i64.rotl
		local.set $lane_2_4
		local.get $lane_3_4
		i64.const 56
		i64.rotl
		local.set $lane_3_4
		local.get $lane_4_4
		i64.const 14
		i64.rotl
		local.set $lane_4_4

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
	(export "memory_state" (memory $mem_state))
	(export "reset_state" (func $reset_state))
	(export "do_rho" (func $do_rho))
)

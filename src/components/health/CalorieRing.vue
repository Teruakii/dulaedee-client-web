<template>
  <div class="relative shrink-0" :class="size === 'lg' ? 'h-40 w-40 md:h-48 md:w-48' : 'h-32 w-32'">
    <svg viewBox="0 0 100 100" class="h-full w-full -rotate-90">
      <circle cx="50" cy="50" r="42" fill="none" class="stroke-white/30" stroke-width="12" />
      <circle
        cx="50"
        cy="50"
        r="42"
        fill="none"
        class="animate-ring stroke-white transition-[stroke-dashoffset] duration-500"
        stroke-width="12"
        stroke-linecap="round"
        :stroke-dasharray="CIRCUMFERENCE"
        :stroke-dashoffset="offset"
      />
    </svg>
    <div class="absolute inset-0 grid place-items-center text-center">
      <div>
        <div class="font-display text-5xl">{{ formatNumber(Math.abs(remaining)) }}</div>
        <!-- กินเกินงบไม่ดุ บอกตามจริงด้วยภาษาเป็นกลาง -->
        <div class="text-sm opacity-90">{{ remaining >= 0 ? 'เหลือ kcal' : 'kcal เกินงบ' }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formatNumber } from '@/utils/date'

const props = withDefaults(defineProps<{ eaten: number; target: number; size?: 'md' | 'lg' }>(), { size: 'lg' })

const CIRCUMFERENCE = 2 * Math.PI * 42
const remaining = computed(() => props.target - props.eaten)
// วงเต็มเมื่อกินครบงบ
const offset = computed(() => CIRCUMFERENCE * (1 - Math.min(1, props.target > 0 ? props.eaten / props.target : 0)))
</script>

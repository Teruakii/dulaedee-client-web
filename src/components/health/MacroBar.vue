<template>
  <div>
    <div class="flex justify-between text-sm">
      <span>{{ ICON[kind] }} {{ label }}</span>
      <span :class="onColor ? '' : 'text-mute'">{{ Math.round(value) }}/{{ Math.round(target) }} ก.</span>
    </div>
    <div class="mt-1 h-3 rounded-full" :class="onColor ? 'bg-white/30' : 'bg-line'">
      <div class="h-3 rounded-full transition-[width] duration-500" :class="onColor ? 'bg-white' : BAR[kind]" :style="{ width: `${percent}%` }" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const BAR = { protein: 'bg-protein', carb: 'bg-carb', fat: 'bg-fat' } as const
const ICON = { protein: '🥩', carb: '🍚', fat: '🥑' } as const

// onColor = วางบนการ์ดไล่สี ใช้แถบขาว
const props = defineProps<{ label: string; value: number; target: number; kind: keyof typeof BAR; onColor?: boolean }>()

const percent = computed(() => (props.target > 0 ? Math.min(100, (props.value / props.target) * 100) : 0))
</script>

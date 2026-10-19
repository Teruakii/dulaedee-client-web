<template>
  <!-- บริการอากาศล่มก็ไม่แสดงการ์ด หน้าอื่นยังใช้ได้ -->
  <div v-if="view" class="lift card bg-lemon">
    <div class="flex items-start justify-between gap-2">
      <p class="font-display">{{ view.eyebrow }}</p>
      <span v-if="!plain" class="animate-spin-slow text-3xl" aria-hidden="true">☀️</span>
    </div>
    <p class="font-display text-4xl">{{ view.headline }}</p>
    <p class="text-sm text-mute">{{ view.sub }}</p>
    <p v-if="!compact" class="mt-2 text-sm">{{ view.advice }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { getWeather } from '@/api/health/weather.api'
import { ADVICE_LABELS, UV_LABELS } from '@/utils/labels'
import type { Weather } from '@/types/health.types'

const props = withDefaults(defineProps<{ when?: 'today' | 'tomorrow'; compact?: boolean; plain?: boolean }>(), { when: 'today', compact: false })

const weather = ref<Weather | null>(null)

const view = computed(() => {
  const w = weather.value
  if (!w) return null
  const advice = w.advice.map((a) => ADVICE_LABELS[a] ?? a).join(' ') || 'อากาศดี ดูแลผิวตามปกติ'
  if (props.when === 'tomorrow') {
    if (!w.tomorrow) return null
    return { eyebrow: 'แดดพรุ่งนี้ · กรุงเทพฯ', headline: `UV ${Math.round(w.tomorrow.uvMax)}`, sub: `${UV_LABELS[w.tomorrow.uvLevel]} · ${advice}`, advice }
  }
  return {
    eyebrow: 'แดดวันนี้ · กรุงเทพฯ',
    headline: `UV ${Math.round(w.today.uvMax)}`,
    sub: `${UV_LABELS[w.today.uvLevel]} · ชื้น ${Math.round(w.now.humidityPct)}%`,
    advice,
  }
})

onMounted(async () => {
  try {
    weather.value = await getWeather()
  } catch {
    weather.value = null
  }
})
</script>

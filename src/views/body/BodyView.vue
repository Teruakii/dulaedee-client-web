<template>
  <header class="mb-6 flex flex-wrap items-center gap-3 md:mb-8">
    <h1 class="text-3xl">ร่างกาย</h1>
    <RouterLink to="/summary" class="mr-auto rounded-full bg-peach px-3 py-1 text-sm font-semibold text-melon">สรุปและเหรียญ →</RouterLink>
    <div class="pill-tabs">
      <button
        v-for="r in RANGES"
        :key="r.days"
        class="pill-tab"
        :class="{ 'pill-tab-active': r.days === days }"
        @click="days = r.days"
      >
        {{ r.label }}
      </button>
    </div>
  </header>

  <div class="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3">
    <section class="card lg:col-span-2">
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p class="text-mute">น้ำหนักล่าสุด</p>
          <div class="font-display text-4xl">
            {{ latestWeight?.toFixed(1) ?? '–' }} <span class="text-lg font-medium text-mute">กก.</span>
          </div>
        </div>
        <div v-if="weightChange !== null" class="text-right">
          <p class="text-sm text-mute">{{ rangeLabel }}ที่ผ่านมา</p>
          <p class="mt-1 inline-block rounded-full bg-mint px-3 py-1 font-semibold text-lime">
            {{ weightChange === 0 ? 'คงที่' : `${weightChange < 0 ? 'ลดลง' : 'เพิ่มขึ้น'} ${Math.abs(weightChange).toFixed(1)} กก.` }}
          </p>
        </div>
      </div>

      <svg v-if="chart" viewBox="0 0 600 200" class="mt-6 h-48 w-full" preserveAspectRatio="none" role="img" aria-label="กราฟน้ำหนัก">
        <g class="stroke-line" stroke-width="1"><line x1="0" y1="40" x2="600" y2="40" /><line x1="0" y1="100" x2="600" y2="100" /><line x1="0" y1="160" x2="600" y2="160" /></g>
        <path :d="chart.area" class="fill-blush" />
        <path :d="chart.line" fill="none" class="stroke-melon" stroke-width="3" stroke-linejoin="round" vector-effect="non-scaling-stroke" />
      </svg>
      <p v-else class="mt-6 grid h-48 place-items-center rounded-3xl bg-bg text-center text-mute">บันทึกน้ำหนักอย่างน้อย 2 วันเพื่อดูกราฟ</p>
      <div v-if="chart" class="mt-2 flex justify-between text-xs text-mute">
        <span>{{ shortThaiDate(chart.from) }}</span>
        <span>{{ chart.min.toFixed(1) }} ถึง {{ chart.max.toFixed(1) }} กก.</span>
        <span>{{ shortThaiDate(chart.to) }}</span>
      </div>

      <form class="mt-5 flex gap-3" @submit.prevent="saveWeight">
        <input
          v-model.number="weightInput"
          type="number"
          inputmode="decimal"
          step="0.1"
          min="25"
          max="300"
          class="field mt-0 min-w-0 flex-1"
          placeholder="น้ำหนักวันนี้ กก."
        />
        <button class="btn-ink whitespace-nowrap" :disabled="saving || !validWeight">บันทึก</button>
      </form>
    </section>

    <div class="space-y-4 md:space-y-6">
      <section v-if="targets" class="lift card bg-lemon">
        <p class="font-display">BMI</p>
        <div class="font-display text-4xl">{{ targets.bmi.toFixed(1) }}</div>
        <div class="mt-4 flex h-2 overflow-hidden rounded-full">
          <span class="flex-[18.5] bg-sky/50" /><span class="flex-[4.5] bg-lime" /><span class="flex-[2] bg-mango" /><span class="flex-[5] bg-melon/70" />
        </div>
        <div class="relative h-4"><span class="absolute top-0 h-3 w-0.5 bg-ink" :style="{ left: `${bmiMarker}%` }" /></div>
        <p class="text-sm text-mute">{{ BMI_LABELS[targets.bmiClass] }} ตามเกณฑ์คนเอเชีย (สมส่วน 18.5 ถึง 22.9)</p>
      </section>

      <section class="lift card bg-ice">
        <div class="flex justify-between">
          <h2 class="text-lg">น้ำ 7 วัน</h2>
          <span class="text-sm text-mute">เฉลี่ย {{ (waterAvg / 1000).toFixed(1) }} ลิตร</span>
        </div>
        <div class="mt-4 flex h-28 items-end gap-2">
          <div
            v-for="d in water7"
            :key="d.date"
            class="flex-1 rounded-t-xl"
            :class="d.date === today ? 'bg-sky' : 'bg-sky/50'"
            :style="{ height: `${Math.max(4, (d.waterMl / waterScale) * 100)}%` }"
            :title="`${d.waterMl} มล.`"
          />
        </div>
        <div class="mt-2 flex justify-between text-xs text-mute">
          <span v-for="d in water7" :key="d.date" class="flex-1 text-center">{{ weekdayShort(d.date) }}</span>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { getRange } from '@/api/health/daylog.api'
import { useDayStore } from '@/stores/day.pinia'
import { useProfileStore } from '@/stores/profile.pinia'
import { useMessage } from '@/use/useMessage'
import { getApiErrorMessage } from '@/utils/apiError'
import { addDays, shortThaiDate, todayBangkok, weekdayShort } from '@/utils/date'
import { BMI_LABELS } from '@/utils/labels'
import type { RangePoint } from '@/types/health.types'

const RANGES = [
  { days: 7, label: '7 วัน' },
  { days: 30, label: '30 วัน' },
  { days: 90, label: '3 เดือน' },
]

const dayStore = useDayStore()
const profileStore = useProfileStore()
const { showError, showSuccess } = useMessage()

const today = todayBangkok()
const days = ref(30)
const points = ref<RangePoint[]>([])
const water7 = ref<{ date: string; waterMl: number }[]>([])
const weightInput = ref<number | null>(null)
const saving = ref(false)

const targets = computed(() => profileStore.targets)
const rangeLabel = computed(() => RANGES.find((r) => r.days === days.value)?.label ?? '')
const weights = computed(() => points.value.filter((p): p is RangePoint & { weightKg: number } => p.weightKg !== undefined))
const latestWeight = computed(() => weights.value.at(-1)?.weightKg ?? profileStore.profile?.weightKg ?? null)
const weightChange = computed(() => (weights.value.length >= 2 ? weights.value.at(-1)!.weightKg - weights.value[0]!.weightKg : null))
const validWeight = computed(() => weightInput.value !== null && weightInput.value >= 25 && weightInput.value <= 300)

// แกน x ตามวันจริงในช่วง ไม่ใช่ตามลำดับจุด วันที่ไม่ได้ชั่งจึงไม่บีบกราฟ
const chart = computed(() => {
  const w = weights.value
  if (w.length < 2) return null
  const from = addDays(today, -(days.value - 1))
  const span = days.value - 1 || 1
  const min = Math.min(...w.map((p) => p.weightKg))
  const max = Math.max(...w.map((p) => p.weightKg))
  const pad = Math.max(0.5, (max - min) * 0.2)
  const x = (date: string) => (Math.round((Date.parse(date) - Date.parse(from)) / 86_400_000) / span) * 600
  const y = (kg: number) => 180 - ((kg - (min - pad)) / (max - min + 2 * pad)) * 160
  const coords = w.map((p) => `${x(p.date).toFixed(1)} ${y(p.weightKg).toFixed(1)}`)
  const line = `M${coords.join(' L')}`
  const area = `${line} L${x(w.at(-1)!.date).toFixed(1)} 200 L${x(w[0]!.date).toFixed(1)} 200Z`
  return { line, area, min, max, from, to: today }
})

const waterAvg = computed(() => water7.value.reduce((s, d) => s + d.waterMl, 0) / 7)
const waterScale = computed(() => Math.max(targets.value?.waterMl ?? 2000, ...water7.value.map((d) => d.waterMl)))
// แถบ BMI กว้าง 0 ถึง 30
const bmiMarker = computed(() => Math.min(100, ((targets.value?.bmi ?? 0) / 30) * 100))

const loadRange = async () => {
  try {
    points.value = await getRange(addDays(today, -(days.value - 1)), today)
  } catch (err) {
    showError(getApiErrorMessage(err))
  }
}

const loadWater = async () => {
  const from = addDays(today, -6)
  const got = new Map((await getRange(from, today)).map((p) => [p.date, p.waterMl]))
  water7.value = Array.from({ length: 7 }, (_, i) => addDays(from, i)).map((date) => ({ date, waterMl: got.get(date) ?? 0 }))
}

const saveWeight = async () => {
  if (!validWeight.value) return
  saving.value = true
  try {
    dayStore.date = today
    await dayStore.setWeight(weightInput.value!)
    // น้ำหนักวันนี้เปลี่ยนงบแคลอรี่ ต้องโหลดโปรไฟล์ใหม่
    await Promise.all([loadRange(), profileStore.load(true)])
    showSuccess('บันทึกน้ำหนักแล้ว')
  } catch (err) {
    showError(getApiErrorMessage(err))
  } finally {
    saving.value = false
  }
}

watch(days, loadRange)
// โปรไฟล์โหลดพร้อมกับ layout อาจมาทีหลังหน้า
watch(
  () => profileStore.profile?.weightKg,
  (w) => {
    if (weightInput.value === null && w) weightInput.value = w
  },
  { immediate: true },
)

onMounted(async () => {
  await Promise.all([loadRange(), loadWater().catch(() => undefined)])
})
</script>

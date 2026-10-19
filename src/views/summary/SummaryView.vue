<template>
  <header class="mb-6 flex flex-wrap items-center gap-3 md:mb-8">
    <h1 class="mr-auto text-3xl">สรุป</h1>
    <div class="pill-tabs">
      <button v-for="r in RANGES" :key="r" class="pill-tab" :class="{ 'pill-tab-active': r === days }" @click="days = r">{{ r }} วัน</button>
    </div>
  </header>

  <EmptyState v-if="loadError" title="โหลดสรุปไม่ได้" :text="loadError">
    <button class="btn-soft" @click="load">ลองอีกครั้ง</button>
  </EmptyState>
  <div v-else-if="!streaks" class="h-96 animate-pulse rounded-[2.5rem] bg-surface" />

  <template v-else>
    <div class="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3">
      <!-- วันต่อเนื่อง -->
      <section class="lift rounded-[2.5rem] bg-gradient-to-br from-melon to-mango p-6 text-white lg:row-span-2">
        <p class="font-display">จดอาหารต่อเนื่อง</p>
        <p class="font-display text-6xl">🔥 {{ streaks.streaks.log.current }} <span class="text-2xl">วัน</span></p>
        <p class="mt-1 text-sm opacity-90">{{ streakNote }}</p>
        <div class="mt-5 grid grid-cols-3 gap-2 text-center">
          <div v-for="h in OTHER_HABITS" :key="h" class="rounded-2xl bg-white/20 px-2 py-3">
            <p class="text-xl" aria-hidden="true">{{ HABIT_LABELS[h].emoji }}</p>
            <p class="font-display text-2xl">{{ streaks.streaks[h].current }}</p>
            <p class="text-xs opacity-90">{{ HABIT_LABELS[h].name }}</p>
          </div>
        </div>
        <p class="mt-3 text-xs opacity-80">ตัวเลขคือวันติดกันถึงวันนี้ ยังไม่ทำวันนี้ก็ยังไม่ขาด</p>
      </section>

      <!-- ตัวเลขของช่วงที่เลือก -->
      <section class="card lg:col-span-2">
        <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div>
            <p class="text-sm text-mute">จดอาหาร</p>
            <p class="font-display text-3xl">{{ loggedDays.length }}<span class="text-base text-mute">/{{ days }} วัน</span></p>
          </div>
          <div>
            <p class="text-sm text-mute">แคลอรี่เฉลี่ย</p>
            <p class="font-display text-3xl">{{ loggedDays.length ? formatNumber(avgKcal) : '–' }}</p>
            <p v-if="targets && loggedDays.length" class="text-xs" :class="avgKcal > targets.kcal ? 'text-melon' : 'text-lime'">
              {{ avgKcal > targets.kcal ? `เกินงบ ${formatNumber(avgKcal - targets.kcal)}` : `ต่ำกว่างบ ${formatNumber(targets.kcal - avgKcal)}` }}
            </p>
          </div>
          <div>
            <p class="text-sm text-mute">โปรตีนเฉลี่ย</p>
            <p class="font-display text-3xl">{{ loggedDays.length ? Math.round(avgProtein) : '–' }}<span class="text-base text-mute"> ก.</span></p>
            <p v-if="targets && loggedDays.length" class="text-xs text-mute">เป้า {{ Math.round(targets.proteinG) }} ก.</p>
          </div>
          <div>
            <p class="text-sm text-mute">น้ำถึงเป้า</p>
            <p class="font-display text-3xl">{{ waterDays }}<span class="text-base text-mute">/{{ days }} วัน</span></p>
          </div>
        </div>

        <!-- แท่งแคลอรี่รายวัน เส้นประคืองบ · วันที่ไม่ได้จดเป็นแท่งจาง -->
        <div class="relative mt-6 h-40">
          <div v-if="targets" class="absolute inset-x-0 border-t-2 border-dashed border-melon/50" :style="{ bottom: `${(targets.kcal / kcalScale) * 100}%` }">
            <span class="absolute -top-5 right-0 text-xs text-melon">งบ {{ formatNumber(targets.kcal) }}</span>
          </div>
          <div class="flex h-full items-end" :class="days > 7 ? 'gap-0.5' : 'gap-2'">
            <div
              v-for="d in series"
              :key="d.date"
              class="flex-1 rounded-t-lg"
              :class="!d.entries ? 'bg-line' : targets && d.kcal > targets.kcal ? 'bg-melon' : 'bg-mango'"
              :style="{ height: `${d.entries ? Math.max(4, (d.kcal / kcalScale) * 100) : 4}%` }"
              :title="`${shortThaiDate(d.date)} · ${d.entries ? `${formatNumber(d.kcal)} kcal` : 'ไม่ได้จด'}`"
            />
          </div>
        </div>
        <div class="mt-2 flex justify-between text-xs text-mute">
          <span>{{ shortThaiDate(series[0]!.date) }}</span>
          <span>{{ shortThaiDate(today) }}</span>
        </div>
      </section>

      <!-- น้ำหนักและแนวโน้ม -->
      <section class="lift card bg-lemon">
        <p class="font-display">น้ำหนัก</p>
        <template v-if="trend">
          <p class="font-display text-3xl">
            {{ Math.abs(trend.perWeekKg) < 0.1 ? 'ทรงตัว' : `${trend.perWeekKg < 0 ? 'ลด' : 'เพิ่ม'} ${Math.abs(trend.perWeekKg).toFixed(1)} กก./สัปดาห์` }}
          </p>
          <p class="mt-2 text-sm">ถ้าเป็นแบบนี้ต่อ อีก {{ trend.weeksAhead }} สัปดาห์จะประมาณ <b>{{ trend.projectedKg.toFixed(1) }} กก.</b></p>
          <p v-if="offGoal" class="mt-2 text-sm text-melon">{{ offGoal }}</p>
          <p class="mt-2 text-xs text-mute">คิดจากน้ำหนักที่ชั่งใน 30 วันล่าสุด เป็นแค่การคาดคร่าวๆ</p>
        </template>
        <p v-else class="mt-2 text-sm text-mute">ชั่งน้ำหนักอย่างน้อย 3 วัน ห่างกันเกิน 1 สัปดาห์ แล้วจะเห็นแนวโน้มตรงนี้</p>
        <RouterLink to="/body" class="mt-3 inline-block text-sm font-semibold text-ink">บันทึกน้ำหนัก →</RouterLink>
      </section>

      <!-- ชาเลนจ์กลุ่ม -->
      <RouterLink to="/groups" class="lift card block bg-mint">
        <p class="font-display">ชาเลนจ์กับเพื่อน 🤝</p>
        <p class="mt-2 text-sm">ชวนเพื่อนหรือครอบครัวมาแข่งกันจดอาหาร ดื่มน้ำ ออกกำลัง หรือดูแลผิวในแต่ละสัปดาห์</p>
        <p class="mt-3 text-sm font-semibold text-lime">ไปที่กลุ่มของฉัน →</p>
      </RouterLink>
    </div>

    <h2 class="mt-8 text-xl">เหรียญ</h2>
    <div class="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
      <div v-for="b in streaks.badges" :key="b.id" class="rounded-[2rem] p-4 text-center" :class="b.earned ? 'lift bg-surface soft-shadow' : 'bg-surface/60'">
        <p class="text-4xl" :class="{ 'opacity-30 grayscale': !b.earned }" aria-hidden="true">{{ BADGE_LABELS[b.id].emoji }}</p>
        <p class="mt-2 font-display" :class="{ 'text-mute': !b.earned }">{{ BADGE_LABELS[b.id].name }}</p>
        <p class="text-xs text-mute">{{ BADGE_LABELS[b.id].how }}</p>
        <p v-if="!b.earned" class="mt-1 text-xs font-semibold text-melon">{{ b.progress }}/{{ b.goal }}</p>
        <span class="sr-only">{{ b.earned ? 'ได้แล้ว' : 'ยังไม่ได้' }}</span>
      </div>
    </div>
  </template>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { getRange, getStreaks } from '@/api/health/daylog.api'
import EmptyState from '@/components/page/EmptyState.vue'
import { useProfileStore } from '@/stores/profile.pinia'
import { getApiErrorMessage } from '@/utils/apiError'
import { addDays, formatNumber, shortThaiDate, todayBangkok } from '@/utils/date'
import { BADGE_LABELS, HABIT_LABELS } from '@/utils/labels'
import { weightTrend } from '@/utils/trend'
import type { Habit, RangePoint, StreakSummary } from '@/types/health.types'

const RANGES = [7, 30] as const
// เส้นแนวโน้มน้ำหนักใช้ 30 วันเสมอ ไม่ตามแท็บ
const FETCH_DAYS = 30
const OTHER_HABITS: Habit[] = ['water', 'workout', 'skin']

const profileStore = useProfileStore()
const today = todayBangkok()
const days = ref<(typeof RANGES)[number]>(7)
const points = ref<RangePoint[]>([])
const streaks = ref<StreakSummary | null>(null)
const loadError = ref('')

const targets = computed(() => profileStore.targets)

// ทุกวันในช่วง รวมวันที่ไม่มีเอกสาร
const series = computed(() => {
  const byDate = new Map(points.value.map((p) => [p.date, p]))
  return Array.from({ length: days.value }, (_, i) => addDays(today, i - days.value + 1)).map(
    (date) => byDate.get(date) ?? { date, kcal: 0, proteinG: 0, entries: 0, waterMl: 0, skinAm: 0, skinPm: 0, workoutMin: 0, burnedKcal: 0 },
  )
})
const loggedDays = computed(() => series.value.filter((d) => d.entries > 0))
const avgKcal = computed(() => Math.round(loggedDays.value.reduce((s, d) => s + d.kcal, 0) / (loggedDays.value.length || 1)))
const avgProtein = computed(() => loggedDays.value.reduce((s, d) => s + d.proteinG, 0) / (loggedDays.value.length || 1))
const waterDays = computed(() => series.value.filter((d) => d.waterMl >= (targets.value?.waterMl ?? 2000)).length)
const kcalScale = computed(() => Math.max((targets.value?.kcal ?? 0) * 1.3, ...series.value.map((d) => d.kcal), 1))

const trend = computed(() => weightTrend(points.value.filter((p): p is RangePoint & { weightKg: number } => p.weightKg !== undefined), today))

// แนวโน้มสวนทางเป้าที่ตั้งไว้ · บอกเบาๆ ไม่ตำหนิ
const offGoal = computed(() => {
  const goal = profileStore.profile?.goal
  const t = trend.value
  if (!t || Math.abs(t.perWeekKg) < 0.1) return ''
  if (goal === 'lose' && t.perWeekKg > 0) return 'เป้าคือลดน้ำหนัก ลองดูแคลอรี่เฉลี่ยเทียบกับงบด้านบน'
  if (goal === 'gain' && t.perWeekKg < 0) return 'เป้าคือเพิ่มน้ำหนัก ลองกินให้ถึงงบในแต่ละวัน'
  if (goal === 'lose' && t.perWeekKg < -1) return 'ลดเร็วกว่าสัปดาห์ละ 1 กก. ระวังกินน้อยเกินไป'
  return ''
})

const streakNote = computed(() => {
  const s = streaks.value!.streaks.log
  if (!s.days) return 'เริ่มจดมื้อแรกวันนี้เลย'
  if (s.current && s.current >= s.best) return 'สถิติดีที่สุดของคุณ ทำต่อเลย'
  return `ดีที่สุด ${s.best} วัน · จดมาแล้วทั้งหมด ${s.days} วัน`
})

const load = async () => {
  loadError.value = ''
  try {
    ;[points.value, streaks.value] = await Promise.all([getRange(addDays(today, -(FETCH_DAYS - 1)), today), getStreaks(today)])
  } catch (err) {
    loadError.value = getApiErrorMessage(err)
  }
}

onMounted(load)
</script>

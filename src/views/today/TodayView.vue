<template>
  <div class="flex items-end gap-3 md:gap-4">
    <MascotLeaf :mood="remaining < 0 ? 'wow' : 'happy'" class="h-20 w-20 md:h-24 md:w-24" />
    <div class="soft-shadow relative mb-3 min-w-0 flex-1 rounded-3xl rounded-bl-md bg-surface px-5 py-3 md:flex-none">
      <p class="text-sm text-mute">{{ longThaiDate(dayStore.date) }} · {{ greeting() }} {{ userStore.userProfile?.firstName }}</p>
      <p class="font-display text-lg md:text-xl">
        <template v-if="!targets">กำลังเตรียมงบวันนี้…</template>
        <template v-else-if="remaining > 0">{{ MEAL_LABELS[nextMeal] }}ยังกินได้อีก <b class="text-melon">{{ formatNumber(remaining) }} kcal</b> นะ {{ MEAL_EMOJI[nextMeal] }}</template>
        <template v-else-if="remaining === 0">ครบงบพอดีเป๊ะ เก่งมาก 🎉</template>
        <template v-else>วันนี้เกินงบไป {{ formatNumber(-remaining) }} kcal ไม่เป็นไร พรุ่งนี้เริ่มใหม่ 🌱</template>
      </p>
    </div>
    <RouterLink to="/profile" class="mb-3 md:hidden" aria-label="โปรไฟล์"><UserAvatar :name="userStore.displayName" /></RouterLink>
  </div>

  <div v-if="summary && targets" class="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
    <section class="lift col-span-2 row-span-2 rounded-[2.5rem] bg-gradient-to-br from-melon to-mango p-6 text-white md:p-8">
      <div class="flex items-center justify-between">
        <h2 class="text-lg">งบวันนี้</h2>
        <span class="rounded-full bg-white/25 px-3 py-1 text-sm">{{ formatNumber(targets.kcal) }} kcal</span>
      </div>
      <div class="mt-4 flex flex-col items-center gap-6 sm:flex-row">
        <CalorieRing :eaten="summary.totals.kcal" :target="targets.kcal" />
        <div class="w-full flex-1 space-y-3">
          <MacroBar label="โปรตีน" kind="protein" :value="summary.totals.proteinG" :target="targets.proteinG" on-color />
          <MacroBar label="คาร์บ" kind="carb" :value="summary.totals.carbG" :target="targets.carbG" on-color />
          <MacroBar label="ไขมัน" kind="fat" :value="summary.totals.fatG" :target="targets.fatG" on-color />
          <p class="pt-1 text-sm opacity-90">กินไปแล้ว {{ formatNumber(summary.totals.kcal) }} kcal</p>
        </div>
      </div>
    </section>

    <section class="lift relative min-h-44 overflow-hidden rounded-[2rem] bg-ice p-5">
      <h2>💧 น้ำ</h2>
      <p class="font-display text-3xl">{{ filledGlasses }}<span class="text-base text-mute">/{{ glasses }} แก้ว</span></p>
      <!-- ระดับคลื่นตามน้ำที่ดื่ม -->
      <div class="absolute inset-x-0 bottom-0 overflow-hidden transition-[height] duration-700" :style="{ height: `${waterLevel}%` }" aria-hidden="true">
        <svg class="animate-wave h-full w-[200%]" viewBox="0 0 400 60" preserveAspectRatio="none">
          <path d="M0 10 Q25 0 50 10 T100 10 T150 10 T200 10 T250 10 T300 10 T350 10 T400 10 V60 H0Z" class="fill-sky/80" />
        </svg>
      </div>
      <div class="relative mt-4 flex gap-2">
        <button class="grid h-10 w-10 place-items-center rounded-full bg-white text-lg text-sky shadow disabled:opacity-40" :disabled="!summary.waterMl || busy" aria-label="ลบ 1 แก้ว" @click="water(-GLASS_ML)">−</button>
        <button class="rounded-full bg-white px-4 py-2 text-sm font-semibold text-sky shadow active:scale-95" :disabled="busy" @click="water(GLASS_ML)">+ 1 แก้ว</button>
      </div>
    </section>

    <WeatherCard compact />

    <RouterLink to="/skin" class="lift col-span-2 block rounded-[2rem] bg-lilac p-5">
      <div class="flex items-center justify-between">
        <h2>✨ {{ slot === 'am' ? 'ผิวเช้านี้' : 'ผิวคืนนี้' }}</h2>
        <span class="rounded-full bg-white px-3 py-1 text-sm">{{ skinDoneCount }}/{{ routine?.products.length ?? 0 }}</span>
      </div>
      <div v-if="routine?.products.length" class="mt-3 flex flex-wrap gap-2 text-sm">
        <span
          v-for="p in routine.products"
          :key="p.id"
          class="rounded-full px-3 py-1.5"
          :class="isDone(p.id) ? 'bg-grape text-white line-through decoration-white/70' : clashIds.has(p.id) ? 'bg-white ring-2 ring-melon' : 'bg-white'"
          >{{ isDone(p.id) ? '✓ ' : '' }}{{ p.name }}{{ clashIds.has(p.id) && !isDone(p.id) ? ' ⚠️' : '' }}</span
        >
      </div>
      <p v-else class="mt-3 text-sm text-mute">ยังไม่มี routine เริ่มจากล้างหน้า บำรุง กันแดด</p>
      <p v-if="routine?.clashes.length" class="mt-3 text-sm text-melon">{{ clashNote }}</p>
    </RouterLink>

    <section class="lift col-span-2 rounded-[2rem] bg-mint p-5 md:col-span-4">
      <div class="flex flex-wrap items-center gap-2">
        <h2 class="mr-auto">🏃 ออกกำลังวันนี้</h2>
        <span v-if="summary.burned.minutes" class="rounded-full bg-white px-3 py-1 text-sm">{{ summary.burned.kcal ? `เผาผลาญ ${formatNumber(summary.burned.kcal)} kcal · ` : '' }}เล่นแล้ว {{ summary.burned.minutes }} นาที</span>
        <RouterLink to="/workout" class="text-sm font-semibold text-lime">ดูตาราง →</RouterLink>
      </div>
      <div v-if="todayPlan.length" class="no-scrollbar -mx-5 mt-3 flex gap-2 overflow-x-auto px-5 md:mx-0 md:flex-wrap md:px-0">
        <button
          v-for="item in todayPlan"
          :key="item.id"
          class="flex shrink-0 items-center gap-2 rounded-full py-2 pl-3 pr-4 text-sm transition-colors active:scale-95"
          :class="workoutDone(item.id) ? 'bg-lime text-white' : 'bg-white'"
          :disabled="busy"
          :aria-label="workoutDone(item.id) ? `ยกเลิก ${item.name}` : `เล่นแล้ว ${item.name}`"
          @click="toggleWorkout(item)"
        >
          <span aria-hidden="true">{{ workoutDone(item.id) ? '✓' : '🏃' }}</span>
          {{ item.name }} · {{ activityText(item) }}
        </button>
      </div>
      <RouterLink v-else to="/workout" class="mt-2 inline-block text-sm text-lime">วันนี้ยังไม่ได้กรอกว่าจะเล่นอะไร กรอกตารางเลย ✏️</RouterLink>
    </section>

    <StreakCard class="col-span-2 md:col-span-4" />
  </div>

  <EmptyState v-else-if="loadError" title="โหลดข้อมูลไม่ได้" :text="loadError" class="mt-6">
    <button class="btn-soft" @click="load">ลองอีกครั้ง</button>
  </EmptyState>
  <div v-else class="mt-6 h-96 animate-pulse rounded-[2.5rem] bg-surface" />

  <template v-if="summary">
    <h2 class="mt-8 text-xl">มื้อวันนี้</h2>
    <div class="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
      <RouterLink
        v-for="m in meals"
        :key="m.meal"
        :to="{ name: 'food', query: { meal: m.meal } }"
        class="lift block rounded-[2rem] p-5"
        :class="m.entries.length ? foodTint(m.entries[0]!.nameTh) : m.meal === nextMeal ? 'border-[3px] border-dashed border-melon/50 bg-surface' : 'border-[3px] border-dashed border-mute/25 bg-surface'"
      >
        <div class="text-4xl" aria-hidden="true">{{ m.entries.length ? foodEmoji(m.entries[0]!.nameTh) : MEAL_EMOJI[m.meal] }}</div>
        <p class="mt-2 font-display">{{ MEAL_SHORT[m.meal] }}</p>
        <template v-if="m.entries.length">
          <p class="truncate text-sm text-mute">{{ m.entries.map((e) => e.nameTh).join(', ') }}</p>
          <p class="mt-2 font-display text-xl">{{ formatNumber(summary.byMeal[m.meal].kcal) }}</p>
        </template>
        <template v-else-if="m.meal === nextMeal && remaining > 0">
          <p class="text-sm text-melon">เลือกเมนูพอดีงบ</p>
          <span class="mt-2 grid h-8 w-8 place-items-center rounded-full bg-melon font-bold text-white">+</span>
        </template>
        <p v-else class="text-sm text-mute">ยังไม่ได้บันทึก</p>
      </RouterLink>
    </div>
  </template>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { getRoutine } from '@/api/health/skin.api'
import { getPlan } from '@/api/health/workout.api'
import MascotLeaf from '@/components/MascotLeaf.vue'
import UserAvatar from '@/components/UserAvatar.vue'
import CalorieRing from '@/components/health/CalorieRing.vue'
import MacroBar from '@/components/health/MacroBar.vue'
import StreakCard from '@/components/health/StreakCard.vue'
import WeatherCard from '@/components/health/WeatherCard.vue'
import EmptyState from '@/components/page/EmptyState.vue'
import { useDayStore } from '@/stores/day.pinia'
import { useProfileStore } from '@/stores/profile.pinia'
import { useUserStore } from '@/stores/user.pinia'
import { useMessage } from '@/use/useMessage'
import { getApiErrorMessage } from '@/utils/apiError'
import { formatNumber, greeting, longThaiDate, weekdayOf } from '@/utils/date'
import { foodEmoji, foodTint, MEAL_EMOJI } from '@/utils/foodEmoji'
import { ACTIVE_LABELS, activityText, CLASH_LABELS, MEAL_LABELS, MEAL_SHORT } from '@/utils/labels'
import { currentSlot, nextMealNow } from '@/utils/timeOfDay'
import type { Meal, PlanItem, Routine, WorkoutPlan } from '@/types/health.types'

const GLASS_ML = 250
const MEALS: Meal[] = ['breakfast', 'lunch', 'dinner', 'snack']

const userStore = useUserStore()
const profileStore = useProfileStore()
const dayStore = useDayStore()
const { showError } = useMessage()

const loadError = ref('')
const busy = ref(false)
const routine = ref<Routine | null>(null)

const summary = computed(() => dayStore.summary)
const targets = computed(() => summary.value?.targets ?? null)
const remaining = computed(() => dayStore.remainingKcal ?? 0)
const slot = currentSlot()

// มื้อถัดไปคือมื้อแรกตามเวลาที่ยังไม่ได้บันทึก
const nextMeal = computed<Meal>(() => {
  const now = nextMealNow()
  return MEALS.slice(MEALS.indexOf(now)).find((m) => !summary.value?.byMeal[m].kcal) ?? now
})

const meals = computed(() => MEALS.map((meal) => ({ meal, entries: (summary.value?.entries ?? []).filter((e) => e.meal === meal) })))
const glasses = computed(() => Math.max(1, Math.round((targets.value?.waterMl ?? 2000) / GLASS_ML)))
const filledGlasses = computed(() => Math.floor((summary.value?.waterMl ?? 0) / GLASS_ML))
// คลื่นต่ำสุดยังโผล่ให้เห็นนิดหน่อย สูงสุดไม่ทับปุ่ม
const waterLevel = computed(() => 12 + Math.min(1, filledGlasses.value / glasses.value) * 50)

const doneIds = computed(() => new Set(summary.value?.skinDone[slot] ?? []))
const isDone = (id: string) => doneIds.value.has(id)
const skinDoneCount = computed(() => routine.value?.products.filter((p) => isDone(p.id)).length ?? 0)
const clashIds = computed(() => new Set(routine.value?.clashes.flatMap((c) => c.productIds) ?? []))
const clashNote = computed(() => {
  const c = routine.value?.clashes[0]
  return c ? `${ACTIVE_LABELS[c.actives[0]]} กับ ${ACTIVE_LABELS[c.actives[1]]} รอบเดียวกัน ${CLASH_LABELS[c.kind]}` : ''
})

const workoutPlan = ref<WorkoutPlan | null>(null)
const todayPlan = computed(() => workoutPlan.value?.days[weekdayOf(dayStore.date)] ?? [])
const workoutDone = (planItemId: string) => summary.value?.workouts.find((w) => w.planItemId === planItemId)
const toggleWorkout = async (item: PlanItem) => {
  busy.value = true
  try {
    const log = workoutDone(item.id)
    if (log) await dayStore.removeWorkout(log.id)
    else {
      const { id, ...activity } = item
      await dayStore.addWorkout({ ...activity, planItemId: id })
    }
  } catch (err) {
    showError(getApiErrorMessage(err))
  } finally {
    busy.value = false
  }
}

const water = async (delta: number) => {
  busy.value = true
  try {
    await dayStore.addWater(delta)
  } catch (err) {
    showError(getApiErrorMessage(err))
  } finally {
    busy.value = false
  }
}

const load = async () => {
  loadError.value = ''
  try {
    await Promise.all([dayStore.load(), getRoutine(slot).then((r) => (routine.value = r)), getPlan().then((p) => (workoutPlan.value = p))])
  } catch (err) {
    loadError.value = getApiErrorMessage(err)
  }
}

onMounted(load)
</script>

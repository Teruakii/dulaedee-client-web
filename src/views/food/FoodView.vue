<template>
  <div class="flex flex-wrap items-center gap-3">
    <h1 class="mr-auto text-3xl">{{ MEAL_LABELS[meal] }}กินอะไรดี {{ MEAL_EMOJI[meal] }}</h1>
    <div class="pill-tabs w-full sm:w-auto">
      <button v-for="m in MEALS" :key="m" class="pill-tab" :class="{ 'pill-tab-active': m === meal }" @click="setMeal(m)">{{ MEAL_SHORT[m] }}</button>
    </div>
  </div>

  <label class="soft-shadow mt-5 flex items-center gap-3 rounded-full bg-surface px-6 py-4">
    <span class="text-xl" aria-hidden="true">🔎</span>
    <input v-model="query" type="search" class="min-w-0 flex-1 bg-transparent text-lg outline-none placeholder:text-mute" placeholder="ค้นหาเมนู เช่น กะเพรา ส้มตำ" />
    <span v-if="remaining > 0" class="hidden shrink-0 rounded-full bg-mint px-3 py-1 text-sm text-lime sm:block">เหลือ {{ formatNumber(remaining) }} kcal</span>
  </label>
  <div class="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
    <button v-for="f in FILTERS" :key="f.label" class="chip" :class="filter === f ? 'bg-ink text-white' : f.tint" @click="filter = f">{{ f.label }}</button>
  </div>

  <!-- กินซ้ำบ่อย กดทีเดียวเพิ่มได้ ไม่ต้องค้น -->
  <section v-if="!query.trim() && filter === FILTERS[0] && (quick.yesterday.length || quick.frequent.length)" class="mt-6">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <h2 class="text-xl">กินบ่อย ⚡</h2>
      <button v-if="quick.yesterday.length" class="chip bg-lemon" :disabled="saving" @click="copyYesterday">
        ↺ เหมือน{{ MEAL_LABELS[meal] }}เมื่อวาน · {{ formatNumber(yesterdayKcal) }} kcal
      </button>
    </div>
    <div class="no-scrollbar -mx-5 mt-3 flex gap-2 overflow-x-auto px-5 pb-1 md:mx-0 md:flex-wrap md:px-0">
      <button
        v-for="q in quick.frequent"
        :key="q.entryId"
        class="soft-shadow flex shrink-0 items-center gap-2 rounded-full bg-surface py-2 pl-3 pr-4 text-sm active:scale-95"
        :disabled="saving"
        :aria-label="`เพิ่ม ${q.nameTh}`"
        @click="addQuick(q)"
      >
        <span aria-hidden="true">{{ foodEmoji(q.nameTh) }}</span>
        <span>{{ q.nameTh }}{{ q.qty !== 1 ? ` ×${q.qty}` : '' }}</span>
        <span class="text-mute">{{ formatNumber(q.kcal) }}</span>
        <span class="font-bold text-melon" aria-hidden="true">+</span>
      </button>
    </div>
  </section>

  <template v-if="!query.trim() && filter === FILTERS[0]">
    <h2 class="mt-8 text-xl">{{ dayStore.proteinGapG > 0 ? 'พอดีงบ แถมโปรตีนเยอะ ✨' : 'พอดีงบที่เหลือ ✨' }}</h2>
    <p v-if="remaining <= 0" class="mt-2 text-mute">วันนี้ครบงบแล้ว ถ้ายังหิวลองค้นเมนูเบาๆ ด้านบน</p>
    <div v-else-if="recommended.length" class="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div v-for="(f, i) in recommended" :key="f.id" class="lift relative rounded-[2rem] p-5" :class="foodTint(f.nameTh)">
        <span v-if="i === 0" class="absolute -right-2 -top-3 rotate-12 rounded-full bg-lime px-3 py-1 text-xs font-semibold text-white">อันดับ 1</span>
        <div class="text-6xl" aria-hidden="true">{{ foodEmoji(f.nameTh, f.tags) }}</div>
        <p class="mt-3 font-display text-lg">{{ f.nameTh }}</p>
        <p v-if="isEstimate(f)" class="text-xs text-mute">ค่าประมาณ</p>
        <div class="mt-2 flex flex-wrap gap-2 text-sm">
          <span class="rounded-full bg-white px-3 py-1">{{ formatNumber(f.kcal) }} kcal</span>
          <span class="rounded-full bg-white px-3 py-1">โปรตีน {{ f.proteinG }} ก.</span>
        </div>
        <div class="mt-4 flex gap-2">
          <button class="btn-ink flex-1" :disabled="saving" @click="addOne(f)">+ เพิ่ม</button>
        </div>
      </div>
    </div>
    <p v-else class="mt-2 text-mute">ไม่มีเมนูที่พอดีกับงบที่เหลือ ลองค้นหาเมนูเบาๆ ด้านบน</p>
  </template>

  <section v-if="mealEntries.length" class="mt-8">
    <h2 class="text-xl">ใน{{ MEAL_LABELS[meal] }}แล้ว</h2>
    <div class="mt-3 flex flex-wrap gap-2">
      <span v-for="e in mealEntries" :key="e.id" class="flex items-center gap-2 rounded-full bg-surface py-1.5 pl-2 pr-1.5 soft-shadow">
        <span aria-hidden="true">{{ foodEmoji(e.nameTh) }}</span>
        <span class="text-sm">{{ e.nameTh }}{{ e.unit && e.qty !== 1 ? ` ×${e.qty}` : '' }} · {{ formatNumber(e.kcal) }}</span>
        <button class="grid h-7 w-7 place-items-center rounded-full text-mute hover:bg-bg" :aria-label="`ลบ ${e.nameTh}`" @click="remove(e.id)"><X class="h-4 w-4" /></button>
      </span>
    </div>
  </section>

  <div class="mt-8 flex items-center justify-between gap-3">
    <h2 class="text-xl">{{ query.trim() ? `ผลค้นหา "${query.trim()}"` : filter === FILTERS[0] ? 'เมนูทั้งหมด' : filter.label }}</h2>
    <button class="shrink-0 rounded-full bg-blush px-4 py-2 text-sm font-semibold text-melon" @click="customOpen = true">+ เพิ่มเมนูของฉัน</button>
  </div>
  <div class="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
    <div v-for="f in results" :key="f.id" class="flex items-center gap-4 rounded-3xl bg-surface p-4" :class="{ 'ring-2 ring-melon': picked?.id === f.id }">
      <FoodTile :name="f.nameTh" :tags="f.tags" />
      <button class="min-w-0 flex-1 text-left" @click="pick(f)">
        <p class="font-medium">
          {{ f.nameTh }}
          <span v-if="f.personal" class="ml-1 whitespace-nowrap rounded-full bg-lilac px-2 py-0.5 align-middle text-xs font-normal">ของฉัน</span>
          <span v-else-if="isEstimate(f)" class="ml-1 whitespace-nowrap rounded-full bg-bg px-2 py-0.5 align-middle text-xs font-normal text-mute">ค่าประมาณ</span>
        </p>
        <p class="text-sm" :class="overBudget(f.kcal) ? 'text-melon' : 'text-mute'">
          {{ overBudget(f.kcal) ? `เกินงบ ${formatNumber(f.kcal - remaining)} kcal` : `1 ${UNIT_LABELS[f.unit]} · P${f.proteinG} C${f.carbG} F${f.fatG}` }}
        </p>
      </button>
      <span class="rounded-full px-3 py-1 font-display" :class="overBudget(f.kcal) ? 'bg-blush text-melon' : 'bg-lemon'">{{ formatNumber(f.kcal) }}</span>
      <button
        v-if="f.personal"
        class="-mx-2 grid h-11 w-9 shrink-0 place-items-center rounded-full text-mute hover:bg-bg hover:text-melon"
        :aria-label="`ลบเมนู ${f.nameTh}`"
        @click="removeMine(f)"
      >
        <Trash2 class="h-5 w-5" />
      </button>
      <button class="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-ink text-xl text-white active:scale-90" :aria-label="`เลือก ${f.nameTh}`" @click="pick(f)">+</button>
    </div>
  </div>
  <p v-if="!searching && !results.length" class="py-6 text-center text-mute">
    {{ filter.mine && !query.trim() ? 'ยังไม่มีเมนูของคุณ กด "+ เพิ่มเมนูของฉัน" เก็บเมนูที่กินบ่อยไว้ได้เลย' : `ไม่พบ "${query}" ในรายการ` }}
  </p>
  <div class="mt-4 flex flex-wrap justify-center gap-3">
    <button v-if="hasMore" class="btn-soft" @click="search(page + 1)">ดูเพิ่ม</button>
    <button class="rounded-full border-[3px] border-dashed border-melon/40 px-5 py-2.5 font-semibold text-melon" @click="customOpen = true">ไม่เจอเมนู? เพิ่มเอง</button>
  </div>

  <!-- แผงเลือกปริมาณ ลอยเหนือแถบเมนูล่าง -->
  <Transition enter-from-class="translate-y-full opacity-0" leave-to-class="translate-y-full opacity-0">
    <div v-if="picked" class="fixed inset-x-4 bottom-28 z-30 mx-auto max-w-xl rounded-[2rem] bg-ink p-4 text-white shadow-2xl transition-all duration-300 md:bottom-8">
      <div class="flex items-center gap-3">
        <FoodTile :name="picked.nameTh" :tags="picked.tags" size="sm" />
        <p class="min-w-0 flex-1 truncate font-display">{{ picked.nameTh }}</p>
        <button class="text-sm text-white/70" @click="picked = null">ปิด</button>
      </div>
      <div class="mt-3 flex items-center gap-2">
        <button class="grid h-11 w-11 place-items-center rounded-full bg-white/15 text-xl" :disabled="qty <= 0.5" aria-label="ลดปริมาณ" @click="qty -= 0.5">−</button>
        <span class="w-20 text-center font-display text-lg">{{ qty }} {{ UNIT_LABELS[picked.unit] }}</span>
        <button class="grid h-11 w-11 place-items-center rounded-full bg-white/15 text-xl" :disabled="qty >= 10" aria-label="เพิ่มปริมาณ" @click="qty += 0.5">+</button>
        <button class="ml-auto whitespace-nowrap rounded-full bg-melon px-5 py-3 font-semibold active:scale-95" :disabled="saving" @click="addPicked">
          เพิ่ม {{ formatNumber(Math.round(picked.kcal * qty)) }} kcal
        </button>
      </div>
    </div>
  </Transition>

  <el-dialog v-model="customOpen" title="เพิ่มเมนูของฉัน" width="min(480px, 92vw)">
    <p class="-mt-2 mb-4 text-sm text-mute">เมนูนี้จะอยู่ใน "เมนูของฉัน" ครั้งหน้ากดเพิ่มได้เลย เห็นแค่คุณคนเดียว ลบทิ้งได้ทุกเมื่อ</p>
    <el-form label-position="top" @submit.prevent="addCustom">
      <el-form-item label="ชื่อเมนู"><el-input v-model="custom.nameTh" :placeholder="query || 'เช่น ข้าวซอยไก่ใส่ไข่'" /></el-form-item>
      <el-form-item label="แคลอรี่ (kcal)"><el-input-number v-model="custom.kcal" :min="0" :max="5000" class="!w-full" /></el-form-item>
      <div class="grid grid-cols-3 gap-3">
        <el-form-item label="โปรตีน ก."><el-input-number v-model="custom.proteinG" :min="0" :max="500" :controls="false" class="!w-full" /></el-form-item>
        <el-form-item label="คาร์บ ก."><el-input-number v-model="custom.carbG" :min="0" :max="500" :controls="false" class="!w-full" /></el-form-item>
        <el-form-item label="ไขมัน ก."><el-input-number v-model="custom.fatG" :min="0" :max="500" :controls="false" class="!w-full" /></el-form-item>
      </div>
      <el-checkbox v-model="logNow" class="mb-3">กินแล้ว เพิ่มเข้า{{ MEAL_LABELS[meal] }}ด้วย</el-checkbox>
      <button type="submit" class="btn-ink w-full" :disabled="saving || !custom.nameTh.trim()">{{ logNow ? `บันทึกและเพิ่มเข้า${MEAL_LABELS[meal]}` : 'บันทึกเมนู' }}</button>
    </el-form>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, shallowRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { Trash2, X } from 'lucide-vue-next'
import { getQuick } from '@/api/health/daylog.api'
import { createMyFood, deleteMyFood, listFoods, recommendFoods } from '@/api/health/food.api'
import FoodTile from '@/components/health/FoodTile.vue'
import { useDayStore } from '@/stores/day.pinia'
import { useProfileStore } from '@/stores/profile.pinia'
import { useMessage } from '@/use/useMessage'
import { getApiErrorMessage } from '@/utils/apiError'
import { formatNumber } from '@/utils/date'
import { foodEmoji, foodTint, MEAL_EMOJI } from '@/utils/foodEmoji'
import { MEAL_LABELS, MEAL_SHORT, UNIT_LABELS } from '@/utils/labels'
import { nextMealNow } from '@/utils/timeOfDay'
import type { EntryAdd, Food, FoodTag, Meal, QuickItem } from '@/types/health.types'

const MEALS: Meal[] = ['breakfast', 'lunch', 'dinner', 'snack']
// ตัวแรกคือ "ทั้งหมด" · mine กรองเฉพาะเมนูที่ผู้ใช้เพิ่มเอง
const FILTERS: { label: string; tag?: FoodTag; mine?: true; tint: string }[] = [
  { label: 'ทั้งหมด', tint: 'bg-surface' },
  { label: '⭐ เมนูของฉัน', mine: true, tint: 'bg-blush' },
  { label: '🍛 จานเดียว', tag: 'one_dish', tint: 'bg-peach' },
  { label: '🍲 ต้ม แกง', tag: 'soup', tint: 'bg-ice' },
  { label: '💪 โปรตีนสูง', tag: 'high_protein', tint: 'bg-mint' },
  { label: '🥗 ยำ สลัด', tag: 'salad', tint: 'bg-lemon' },
  { label: '🍌 ของว่าง', tag: 'snack', tint: 'bg-lilac' },
]
const PAGE_SIZE = 8

const route = useRoute()
const router = useRouter()
const dayStore = useDayStore()
const profileStore = useProfileStore()
const { showError, showSuccess } = useMessage()

const meal = computed<Meal>(() => {
  const q = route.query.meal
  return typeof q === 'string' && (MEALS as string[]).includes(q) ? (q as Meal) : nextMealNow()
})
const setMeal = (m: Meal) => router.replace({ query: { ...route.query, meal: m } })

const remaining = computed(() => dayStore.remainingKcal ?? 0)
// ค่าในฐานเมนูกลางที่ยังไม่ได้ตรวจกับแหล่งอ้างอิง (ดูข้อกำหนดการใช้งาน)
const isEstimate = (f: Food) => !f.personal && !f.verified
const overBudget = (kcal: number) => remaining.value > 0 && kcal > remaining.value
const mealEntries = computed(() => (dayStore.summary?.entries ?? []).filter((e) => e.meal === meal.value))

const query = ref('')
const filter = shallowRef(FILTERS[0]!)
const results = ref<Food[]>([])
const page = ref(1)
const hasMore = ref(false)
const searching = ref(false)

const search = async (p = 1) => {
  searching.value = true
  try {
    const res = await listFoods({ q: query.value.trim() || undefined, tag: filter.value.tag, mine: filter.value.mine, page: p, limit: PAGE_SIZE })
    results.value = p === 1 ? res.data : [...results.value, ...res.data]
    page.value = p
    hasMore.value = res.pagination.hasMore
  } catch (err) {
    showError(getApiErrorMessage(err))
  } finally {
    searching.value = false
  }
}

// พิมพ์ต่อเนื่องค่อยค้นทีเดียว
let timer: ReturnType<typeof setTimeout> | undefined
watch(query, () => {
  clearTimeout(timer)
  timer = setTimeout(() => search(1), 250)
})
watch(filter, () => search(1))

const picked = ref<Food | null>(null)
const qty = ref(1)
const saving = ref(false)

const pick = (f: Food) => {
  picked.value = f
  qty.value = 1
}

const save = async (payload: EntryAdd, label: string) => {
  saving.value = true
  try {
    await dayStore.addEntry(payload)
    showSuccess(`เพิ่ม ${label} แล้ว 🎉`)
    return true
  } catch (err) {
    showError(getApiErrorMessage(err))
    return false
  } finally {
    saving.value = false
  }
}

const addPicked = async () => {
  if (!picked.value) return
  if (await save({ meal: meal.value, foodId: picked.value.id, qty: qty.value }, picked.value.nameTh)) picked.value = null
}

const addOne = (f: Food) => save({ meal: meal.value, foodId: f.id, qty: 1 }, f.nameTh)

const remove = async (entryId: string) => {
  try {
    await dayStore.removeEntry(entryId)
  } catch (err) {
    showError(getApiErrorMessage(err))
  }
}

const customOpen = ref(false)
const logNow = ref(true)
const custom = reactive({ nameTh: '', kcal: 0, proteinG: 0, carbG: 0, fatG: 0 })
watch(customOpen, (open) => {
  if (open && !custom.nameTh) custom.nameTh = query.value.trim()
})
const addCustom = async () => {
  saving.value = true
  let food: Food
  try {
    food = await createMyFood({ ...custom, nameTh: custom.nameTh.trim() })
  } catch (err) {
    showError(getApiErrorMessage(err))
    return
  } finally {
    saving.value = false
  }
  if (logNow.value) await save({ meal: meal.value, foodId: food.id, qty: 1 }, food.nameTh)
  else showSuccess(`เก็บ ${food.nameTh} ไว้ในเมนูของฉันแล้ว`)
  customOpen.value = false
  Object.assign(custom, { nameTh: '', kcal: 0, proteinG: 0, carbG: 0, fatG: 0 })
  await search(1)
}

const removeMine = async (f: Food) => {
  try {
    await ElMessageBox.confirm(`ลบ ${f.nameTh} ออกจากเมนูของฉัน? มื้อที่บันทึกไปแล้วยังอยู่ครบ`, 'ลบเมนู', { confirmButtonText: 'ลบ', cancelButtonText: 'ยกเลิก', type: 'warning' })
  } catch {
    return
  }
  try {
    await deleteMyFood(f.id)
    results.value = results.value.filter((r) => r.id !== f.id)
    if (picked.value?.id === f.id) picked.value = null
    showSuccess(`ลบ ${f.nameTh} แล้ว`)
  } catch (err) {
    showError(getApiErrorMessage(err))
  }
}

// คัดลอกรายการเดิมทั้งปริมาณและสารอาหาร · ไม่สนว่าเมนูนั้นถูกแก้หรือลบไปแล้ว
const quick = ref<{ yesterday: QuickItem[]; frequent: QuickItem[] }>({ yesterday: [], frequent: [] })
const yesterdayKcal = computed(() => quick.value.yesterday.reduce((s, q) => s + q.kcal, 0))

const loadQuick = async () => {
  try {
    quick.value = await getQuick(dayStore.date, meal.value)
  } catch {
    quick.value = { yesterday: [], frequent: [] }
  }
}

const copy = async (items: QuickItem[], label: string) => {
  saving.value = true
  try {
    await dayStore.copyEntries(meal.value, items)
    showSuccess(`เพิ่ม ${label} แล้ว 🎉`)
  } catch (err) {
    showError(getApiErrorMessage(err))
  } finally {
    saving.value = false
  }
}

const addQuick = (q: QuickItem) => copy([q], q.nameTh)
const copyYesterday = () => copy(quick.value.yesterday, `${MEAL_LABELS[meal.value]}เหมือนเมื่อวาน`)

watch(meal, loadQuick)

const recommended = ref<Food[]>([])

const loadRecommended = async () => {
  try {
    recommended.value =
      remaining.value > 0 ? await recommendFoods({ remainingKcal: remaining.value, proteinGapG: dayStore.proteinGapG, limit: 3 }) : []
  } catch {
    recommended.value = []
  }
}

// งบเปลี่ยนเมื่อเพิ่มหรือลบรายการ คำแนะนำต้องตามงบล่าสุด
watch(remaining, loadRecommended)

onMounted(async () => {
  await Promise.all([dayStore.load(), search(1)])
  await Promise.all([loadRecommended(), loadQuick()])
})
</script>

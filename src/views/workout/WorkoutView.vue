<template>
  <h1 class="text-3xl">ตารางออกกำลังกาย</h1>
  <p class="mt-1 text-mute">กรอกเองว่าแต่ละวันจะเล่นอะไร กี่นาที แล้วกลับมาติ๊กเมื่อเล่นเสร็จ</p>

  <!-- แถบสัปดาห์ -->
  <div class="no-scrollbar -mx-5 mt-6 flex gap-2 overflow-x-auto px-5 pb-2 md:mx-0 md:grid md:grid-cols-7 md:px-0">
    <button
      v-for="d in week"
      :key="d.date"
      class="lift flex w-24 shrink-0 flex-col items-center gap-1 rounded-3xl p-3 md:w-auto"
      :class="d.date === selected ? 'bg-ink text-white' : d.items.length ? 'bg-surface' : 'bg-surface/60'"
      @click="selected = d.date"
    >
      <span class="text-sm" :class="d.date === selected ? 'text-white/80' : 'text-mute'">{{ WEEKDAY_SHORT[d.weekday] }}</span>
      <span class="font-display text-lg">{{ Number(d.date.slice(8)) }}</span>
      <span class="w-full truncate text-center text-xs" :class="d.date === selected ? 'text-white/80' : 'text-mute'">
        {{ d.items.length ? d.items[0]!.name + (d.items.length > 1 ? ` +${d.items.length - 1}` : '') : 'ว่าง' }}
      </span>
      <span class="h-2 w-2 rounded-full" :class="d.done ? 'bg-lime' : d.date === today ? 'bg-melon' : 'bg-transparent'" />
    </button>
  </div>

  <div class="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
    <!-- วันที่เลือก -->
    <section class="card bg-gradient-to-br from-lime/15 to-sky/20 lg:col-span-2">
      <div class="flex flex-wrap items-start gap-3">
        <div class="mr-auto">
          <p class="text-sm text-mute">{{ selected === today ? 'วันนี้' : selected < today ? 'ที่ผ่านมา' : 'ล่วงหน้า' }}</p>
          <h2 class="text-2xl">วัน{{ WEEKDAY_LONG[selectedDay.weekday] }} {{ shortThaiDate(selected) }}</h2>
          <p v-if="selectedDay.items.length" class="text-sm text-mute">รวม {{ plannedMinutes }} นาที{{ plannedKcal ? ` · ${formatNumber(plannedKcal)} kcal` : '' }}</p>
        </div>
        <button v-if="selectedDay.items.length" class="btn-soft text-sm" @click="openEditor">แก้ตาราง</button>
      </div>

      <ul v-if="selectedDay.items.length" class="mt-4 space-y-2">
        <li v-for="item in selectedDay.items" :key="item.id" class="flex items-center gap-3 rounded-3xl bg-white p-3 pl-5">
          <div class="min-w-0 flex-1">
            <p class="font-medium" :class="{ 'text-mute line-through': doneLog(item.id) }">{{ item.name }}</p>
            <p class="text-sm text-mute">{{ activityText(item) }}</p>
          </div>
          <button
            v-if="selected <= today"
            class="grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 text-lg transition-colors active:scale-90"
            :class="doneLog(item.id) ? 'border-lime bg-lime text-white' : 'border-line'"
            :aria-label="doneLog(item.id) ? `ยกเลิก ${item.name}` : `เล่นแล้ว ${item.name}`"
            :disabled="busy"
            @click="toggle(item)"
          >
            <Check v-if="doneLog(item.id)" class="h-5 w-5" :stroke-width="3" />
          </button>
        </li>
      </ul>
      <div v-else class="mt-4 rounded-3xl bg-white p-5">
        <p class="text-mute">ยังไม่ได้กรอกว่าวัน{{ WEEKDAY_LONG[selectedDay.weekday] }}จะเล่นอะไร ถ้าเป็นวันพักก็ปล่อยว่างไว้ได้</p>
        <button class="btn-ink mt-3 text-sm" @click="openEditor">+ กรอกตารางวัน{{ WEEKDAY_LONG[selectedDay.weekday] }}</button>
      </div>

      <!-- สิ่งที่เล่นนอกตาราง -->
      <div v-if="extraLogs.length" class="mt-4">
        <p class="text-sm font-semibold text-mute">เล่นเพิ่มนอกตาราง</p>
        <div class="mt-2 flex flex-wrap gap-2">
          <span v-for="w in extraLogs" :key="w.id" class="flex items-center gap-2 rounded-full bg-white py-1.5 pl-3 pr-1.5 text-sm">
            {{ w.name }} · {{ activityText(w) }}
            <button class="grid h-7 w-7 place-items-center rounded-full text-mute hover:bg-bg" :aria-label="`ลบ ${w.name}`" @click="removeLog(w.id)"><X class="h-4 w-4" /></button>
          </span>
        </div>
      </div>

      <!-- บันทึกสิ่งที่เล่นแต่ไม่ได้อยู่ในตาราง -->
      <form v-if="selected <= today" class="mt-4 rounded-3xl bg-white/70 p-4" @submit.prevent="logExtra">
        <p class="text-sm font-semibold">เล่นอย่างอื่นที่ไม่อยู่ในตาราง <span class="font-normal text-mute">kcal ไม่ใส่ก็ได้</span></p>
        <div class="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-[1fr_110px_110px_auto]">
          <input v-model="extra.name" class="field col-span-2 sm:col-span-1" placeholder="เช่น เตะฟุตบอล" maxlength="60" aria-label="ชื่อกิจกรรม" />
          <input v-model.number="extra.minutes" type="number" inputmode="numeric" min="1" max="300" class="field" placeholder="นาที" aria-label="นาที" />
          <input v-model.number="extra.kcal" type="number" inputmode="numeric" min="0" max="3000" class="field" placeholder="kcal" aria-label="kcal" />
          <button type="submit" class="btn-ink col-span-2 text-sm sm:col-span-1" :disabled="busy || !validRow(extra)">บันทึก</button>
        </div>
      </form>
    </section>

    <!-- สรุปสัปดาห์ -->
    <section class="lift card self-start bg-lemon">
      <h2 class="text-lg">สัปดาห์นี้</h2>
      <p class="mt-2 font-display text-4xl">{{ doneDays }}<span class="text-lg text-mute">/{{ plannedDays }} วัน</span></p>
      <div class="mt-3 flex gap-1.5">
        <span v-for="d in week" :key="d.date" class="h-3 flex-1 rounded-full" :class="d.done ? 'bg-lime' : d.items.length ? 'bg-white' : 'bg-white/40'" />
      </div>
      <p class="mt-4 text-sm">เล่นรวม <b>{{ weekMinutes }} นาที</b>{{ weekKcal ? ` · ${formatNumber(weekKcal)} kcal` : '' }}</p>
      <p class="mt-3 text-xs text-mute">kcal นับเฉพาะรายการที่คุณใส่ไว้ และแสดงไว้ดูเท่านั้น งบกินต่อวันคิดรวมการออกกำลังตามระดับกิจกรรมแล้ว จึงไม่บวกเพิ่มให้</p>
    </section>
  </div>

  <!-- กรอกตารางของวันที่เลือก -->
  <el-dialog v-model="editorOpen" :title="`ตารางวัน${WEEKDAY_LONG[selectedDay.weekday]}`" width="min(560px, 92vw)">
    <p class="mb-3 text-sm text-mute">พิมพ์ชื่อกิจกรรมอะไรก็ได้ ใส่จำนวนนาที ส่วน kcal ใส่เมื่อรู้ เช่น ดูจากนาฬิกา ไม่ใส่ก็ได้</p>
    <ul class="space-y-2">
      <li v-for="(row, i) in draft" :key="i" class="grid grid-cols-[1fr_auto] gap-2 rounded-3xl bg-bg p-3 sm:grid-cols-[1fr_90px_100px_auto]">
        <input v-model="row.name" class="field sm:col-span-1" placeholder="เช่น วิ่งรอบสวน" maxlength="60" :aria-label="`ชื่อกิจกรรมที่ ${i + 1}`" />
        <button type="button" class="grid h-11 w-11 place-items-center self-center rounded-full text-mute hover:bg-white sm:order-last" :aria-label="`เอารายการที่ ${i + 1} ออก`" @click="draft.splice(i, 1)"><X class="h-4 w-4" /></button>
        <div class="col-span-2 grid grid-cols-2 gap-2 sm:col-span-2">
          <input v-model.number="row.minutes" type="number" inputmode="numeric" min="1" max="300" class="field" placeholder="นาที" :aria-label="`นาทีของรายการที่ ${i + 1}`" />
          <input v-model.number="row.kcal" type="number" inputmode="numeric" min="0" max="3000" class="field" placeholder="kcal" :aria-label="`kcal ของรายการที่ ${i + 1}`" />
        </div>
      </li>
    </ul>
    <p v-if="!draft.length" class="rounded-3xl bg-bg p-4 text-center text-mute">ว่าง ถือเป็นวันพัก</p>
    <button type="button" class="mt-3 w-full rounded-full border-[3px] border-dashed border-lime/50 py-3 font-semibold text-lime" @click="addRow">+ เพิ่มกิจกรรม</button>
    <button class="btn-ink mt-4 w-full" :disabled="busy || !draft.every(validRow)" @click="saveDay">บันทึกวัน{{ WEEKDAY_LONG[selectedDay.weekday] }}</button>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { Check, X } from 'lucide-vue-next'
import { addWorkout, getDay, getRange, removeWorkout } from '@/api/health/daylog.api'
import { getPlan, setPlanDay } from '@/api/health/workout.api'
import { useDayStore } from '@/stores/day.pinia'
import { useMessage } from '@/use/useMessage'
import { getApiErrorMessage } from '@/utils/apiError'
import { addDays, formatNumber, shortThaiDate, todayBangkok, weekdayOf } from '@/utils/date'
import { activityText, WEEKDAY_LONG, WEEKDAY_SHORT } from '@/utils/labels'
import type { DaySummary, PlanItem, RangePoint, WorkoutActivity, WorkoutPlan } from '@/types/health.types'

// ช่องตัวเลขที่ลบจนว่าง v-model.number ให้ค่าเป็น '' จึงรับไว้ด้วย
type Row = { name: string; minutes?: number | ''; kcal?: number | '' }

const today = todayBangkok()
const monday = addDays(today, -weekdayOf(today))

const dayStore = useDayStore()
const { showError, showSuccess } = useMessage()

const plan = ref<WorkoutPlan | null>(null)
const busy = ref(false)
const selected = ref(today)
const daySummary = ref<DaySummary | null>(null)
const weekPoints = ref<RangePoint[]>([])

const week = computed(() =>
  Array.from({ length: 7 }, (_, i) => {
    const date = addDays(monday, i)
    const point = weekPoints.value.find((p) => p.date === date)
    return { date, weekday: i, items: plan.value?.days[i] ?? [], done: (point?.workoutMin ?? 0) > 0 }
  }),
)
const selectedDay = computed(() => week.value[weekdayOf(selected.value)]!)
const plannedMinutes = computed(() => selectedDay.value.items.reduce((s, i) => s + i.minutes, 0))
const plannedKcal = computed(() => selectedDay.value.items.reduce((s, i) => s + (i.kcal ?? 0), 0))
const plannedDays = computed(() => week.value.filter((d) => d.items.length).length)
const doneDays = computed(() => week.value.filter((d) => d.done).length)
const weekKcal = computed(() => weekPoints.value.reduce((s, p) => s + p.burnedKcal, 0))
const weekMinutes = computed(() => weekPoints.value.reduce((s, p) => s + p.workoutMin, 0))

const logs = computed(() => daySummary.value?.workouts ?? [])
const doneLog = (planItemId: string) => logs.value.find((w) => w.planItemId === planItemId)
const extraLogs = computed(() => {
  const planIds = new Set(selectedDay.value.items.map((i) => i.id))
  return logs.value.filter((w) => !w.planItemId || !planIds.has(w.planItemId))
})

const isInt = (n: unknown, min: number, max: number): n is number => typeof n === 'number' && Number.isInteger(n) && n >= min && n <= max
const validRow = (r: Row) => r.name.trim().length > 0 && isInt(r.minutes, 1, 300) && (r.kcal === undefined || r.kcal === '' || isInt(r.kcal, 0, 3000))
const toActivity = (r: Row): WorkoutActivity => ({ name: r.name.trim(), minutes: r.minutes as number, ...(isInt(r.kcal, 0, 3000) ? { kcal: r.kcal } : {}) })

const loadWeek = async () => {
  weekPoints.value = await getRange(monday, addDays(monday, 6) < today ? addDays(monday, 6) : today)
}

const loadDay = async () => {
  daySummary.value = selected.value <= today ? await getDay(selected.value) : null
}

// บันทึกของวันนี้ใช้ร่วมกับหน้าวันนี้ ต้องอัปเดต store ด้วย
const applyDay = async (s: DaySummary) => {
  daySummary.value = s
  if (s.date === today) await dayStore.load(today)
  await loadWeek()
}

const run = async (fn: () => Promise<void>) => {
  busy.value = true
  try {
    await fn()
  } catch (err) {
    showError(getApiErrorMessage(err))
  } finally {
    busy.value = false
  }
}

const toggle = (item: PlanItem) =>
  run(async () => {
    const log = doneLog(item.id)
    if (log) await applyDay(await removeWorkout(selected.value, log.id))
    else {
      const { id, ...activity } = item
      await applyDay(await addWorkout(selected.value, { ...activity, planItemId: id }))
      showSuccess(`${item.name} เสร็จแล้ว เก่งมาก`)
    }
  })

const removeLog = (id: string) => run(async () => applyDay(await removeWorkout(selected.value, id)))

const extra = reactive<Row>({ name: '' })
const logExtra = () =>
  run(async () => {
    if (!validRow(extra)) return
    await applyDay(await addWorkout(selected.value, toActivity(extra)))
    showSuccess(`บันทึก ${extra.name.trim()} แล้ว`)
    Object.assign(extra, { name: '', minutes: undefined, kcal: undefined })
  })

const editorOpen = ref(false)
const draft = ref<Row[]>([])
const addRow = () => draft.value.push({ name: '' })
const openEditor = () => {
  draft.value = selectedDay.value.items.map((i) => ({ name: i.name, minutes: i.minutes, kcal: i.kcal }))
  if (!draft.value.length) addRow()
  editorOpen.value = true
}
const saveDay = () =>
  run(async () => {
    plan.value = await setPlanDay(selectedDay.value.weekday, draft.value.map(toActivity))
    editorOpen.value = false
  })

watch(selected, () => run(loadDay))

onMounted(async () => {
  try {
    const [p] = await Promise.all([getPlan(), loadWeek(), loadDay()])
    plan.value = p
  } catch (err) {
    showError(getApiErrorMessage(err))
  }
})
</script>

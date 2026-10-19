<template>
  <h1 class="text-3xl">คำนวณแคลอรี่ต่อวัน</h1>
  <p class="mb-6 mt-1 text-mute md:mb-8">กรอกข้อมูลแล้วดูผลทันที ใช้ตั้งเป็นงบของคุณได้</p>

  <div class="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-5">
    <form class="card space-y-5 lg:col-span-3" @submit.prevent>
      <div>
        <span class="text-sm font-medium">เพศ</span>
        <div class="mt-1 grid grid-cols-2 gap-2">
          <button v-for="s in SEXES" :key="s.value" type="button" class="rounded-full py-3" :class="choice(form.sex === s.value)" @click="form.sex = s.value">
            {{ s.label }}
          </button>
        </div>
      </div>
      <div class="grid grid-cols-3 gap-3">
        <label><span class="text-sm font-medium">อายุ</span><input v-model.number="form.age" type="number" inputmode="numeric" class="field" /></label>
        <label><span class="text-sm font-medium">ส่วนสูง ซม.</span><input v-model.number="form.heightCm" type="number" inputmode="numeric" class="field" /></label>
        <label><span class="text-sm font-medium">น้ำหนัก กก.</span><input v-model.number="form.weightKg" type="number" inputmode="decimal" step="0.1" class="field" /></label>
      </div>
      <div>
        <span class="text-sm font-medium">ระดับกิจกรรม</span>
        <div class="mt-1 space-y-2">
          <button
            v-for="(a, key) in ACTIVITY_LABELS"
            :key="key"
            type="button"
            class="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left"
            :class="form.activity === key ? 'border-2 border-melon bg-blush font-medium' : 'border-2 border-line'"
            @click="form.activity = key"
          >
            <span>{{ a.label }} {{ a.hint }}</span>
            <span class="text-sm" :class="form.activity === key ? 'text-melon' : 'text-mute'">× {{ a.factor }}</span>
          </button>
        </div>
      </div>
      <div>
        <span class="text-sm font-medium">เป้าหมาย</span>
        <GoalPicker v-model="form.goal" class="mt-1" />
      </div>
    </form>

    <div class="space-y-4 lg:col-span-2">
      <div class="lift rounded-[2.5rem] bg-gradient-to-br from-melon to-mango p-6 text-white md:p-7">
        <p class="text-white/90">ควรกินวันละ</p>
        <div class="font-display text-5xl">{{ targets ? formatNumber(targets.kcal) : '–' }} <span class="text-xl font-medium">kcal</span></div>
        <button class="mt-5 w-full rounded-full bg-white py-3 font-semibold text-melon active:scale-95 disabled:opacity-60" :disabled="!targets || saving" @click="useAsMine">
          ตั้งเป็นงบของฉัน
        </button>
      </div>
      <div v-if="targets" class="card">
        <div class="space-y-3 text-sm">
          <div class="flex justify-between"><span class="text-mute">BMR ร่างกายใช้ขณะพัก</span><span class="font-semibold">{{ formatNumber(targets.bmr) }} kcal</span></div>
          <div class="flex justify-between"><span class="text-mute">TDEE รวมกิจกรรม</span><span class="font-semibold">{{ formatNumber(targets.tdee) }} kcal</span></div>
          <div class="flex justify-between"><span class="text-mute">BMI</span><span class="font-semibold">{{ targets.bmi.toFixed(1) }} {{ BMI_LABELS[targets.bmiClass] }}</span></div>
          <div class="flex justify-between"><span class="text-mute">น้ำที่ควรดื่ม</span><span class="font-semibold">{{ (targets.waterMl / 1000).toFixed(1) }} ลิตร</span></div>
        </div>
        <div class="mt-5 flex h-3 overflow-hidden rounded-full">
          <span class="bg-protein" :style="{ flex: targets.proteinG * 4 }" /><span class="bg-carb" :style="{ flex: targets.carbG * 4 }" /><span class="bg-fat" :style="{ flex: targets.fatG * 9 }" />
        </div>
        <div class="mt-2 flex justify-between text-xs text-mute">
          <span>โปรตีน {{ targets.proteinG }} ก.</span><span>คาร์บ {{ targets.carbG }} ก.</span><span>ไขมัน {{ targets.fatG }} ก.</span>
        </div>
      </div>
      <p class="px-2 text-xs text-mute">ใช้สูตร Mifflin-St Jeor เป็นค่าประมาณ ไม่ใช่คำแนะนำทางการแพทย์</p>
    </div>

    <section v-if="steps" class="card lg:col-span-5">
      <h2 class="text-xl">คำนวณยังไง</h2>
      <p class="mt-1 text-sm text-mute">แทนค่าด้วยตัวเลขที่คุณกรอกด้านบน เปลี่ยนข้อมูลแล้วตัวเลขในสูตรเปลี่ยนตาม</p>
      <ol class="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        <li v-for="(s, i) in steps" :key="s.title" class="rounded-3xl bg-bg p-4">
          <div class="flex items-baseline gap-2">
            <span class="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-ink text-xs font-semibold text-white">{{ i + 1 }}</span>
            <h3 class="font-semibold">{{ s.title }}</h3>
          </div>
          <p class="mt-2 text-sm">{{ s.what }}</p>
          <p class="mt-2 rounded-2xl bg-surface px-3 py-2 font-mono text-sm">{{ s.formula }}</p>
          <p class="mt-1 rounded-2xl bg-surface px-3 py-2 font-mono text-sm"><span class="text-mute">=</span> {{ s.filled }}</p>
          <p v-if="s.note" class="mt-2 text-xs text-mute">{{ s.note }}</p>
        </li>
      </ol>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import GoalPicker from '@/components/health/GoalPicker.vue'
import { useProfileStore } from '@/stores/profile.pinia'
import { isValidBody, useCalcPreview } from '@/use/useCalcPreview'
import { useMessage } from '@/use/useMessage'
import { getApiErrorMessage } from '@/utils/apiError'
import { formatNumber } from '@/utils/date'
import { ACTIVITY_LABELS, BMI_LABELS, GOAL_LABELS } from '@/utils/labels'
import type { CalcInput, Sex } from '@/types/health.types'

const SEXES: { value: Sex; label: string }[] = [
  { value: 'female', label: 'หญิง' },
  { value: 'male', label: 'ชาย' },
]

const router = useRouter()
const profileStore = useProfileStore()
const { showError, showSuccess } = useMessage()

const form = reactive<Partial<CalcInput>>({ sex: 'female', activity: 'light', goal: 'lose' })
const choice = (on: boolean) => (on ? 'bg-ink font-semibold text-white' : 'border-2 border-line bg-surface')

// เริ่มจากข้อมูลของผู้ใช้เอง
watch(
  () => profileStore.profile,
  (p) => {
    if (p && form.age === undefined) Object.assign(form, { sex: p.sex, age: p.age, heightCm: p.heightCm, weightKg: p.weightKg, activity: p.activity, goal: p.goal })
  },
  { immediate: true },
)

const input = computed(() => (isValidBody(form) ? { ...form } : null))
const { targets } = useCalcPreview(input)

// ขั้นตอนเดียวกับ computeTargets ของ backend · แทนค่าจริงให้ผู้ใช้ตามได้ทีละขั้น
const steps = computed(() => {
  const t = targets.value
  const b = input.value
  if (!t || !b) return null
  const n = formatNumber
  const factor = ACTIVITY_LABELS[b.activity].factor
  const goal = GOAL_LABELS[b.goal]
  const sexK = b.sex === 'male' ? '+ 5' : '− 161'
  const raw = t.tdee + goal.deltaKcal
  const clamped = t.kcal > raw
  return [
    {
      title: 'BMR พลังงานที่ร่างกายใช้ขณะพัก',
      what: 'แคลอรี่ที่ใช้แค่หายใจ สูบฉีดเลือด และรักษาอุณหภูมิ แม้นอนทั้งวัน คำนวณด้วยสูตร Mifflin-St Jeor ซึ่งแม่นที่สุดในสูตรที่ใช้ทั่วไป',
      formula: `(10 × น้ำหนัก) + (6.25 × ส่วนสูง) − (5 × อายุ) ${sexK}`,
      filled: `(10 × ${b.weightKg}) + (6.25 × ${b.heightCm}) − (5 × ${b.age}) ${sexK} ≈ ${n(t.bmr)} kcal`,
      note: 'ผู้ชาย +5 ผู้หญิง −161 เพราะผู้ชายมีมวลกล้ามเนื้อเฉลี่ยมากกว่า',
    },
    {
      title: 'TDEE พลังงานที่ใช้ทั้งวัน',
      what: 'เอา BMR คูณตัวคูณตามระดับกิจกรรม ได้แคลอรี่ที่ใช้จริงทั้งวัน รวมเดิน ทำงาน และออกกำลัง',
      formula: 'BMR × ตัวคูณกิจกรรม',
      filled: `${n(t.bmr)} × ${factor} (${ACTIVITY_LABELS[b.activity].label}) ≈ ${n(t.tdee)} kcal`,
      note: 'นั่งทำงาน ×1.2 · เบา ×1.375 · ปานกลาง ×1.55 · หนัก ×1.725',
    },
    {
      title: 'งบกินต่อวัน',
      what: `ปรับจาก TDEE ตามเป้าหมาย "${goal.label}" แล้วปัดลงเป็นหลักสิบ`,
      formula: 'TDEE − 300 (ลด) · TDEE (รักษา) · TDEE + 300 (เพิ่ม)',
      filled: clamped
        ? `${n(t.tdee)} − 300 = ${n(raw)} ต่ำกว่า BMR จึงใช้ ${n(t.kcal)} kcal`
        : `${n(t.tdee)} ${goal.deltaKcal < 0 ? '−' : '+'} ${Math.abs(goal.deltaKcal)} ≈ ${n(t.kcal)} kcal`,
      note: 'ไขมัน 1 กก. ≈ 7,700 kcal ขาด 300 kcal ต่อวันจึงลดได้ราว 0.3 กก. ต่อสัปดาห์ และระบบไม่ให้งบต่ำกว่า BMR',
    },
    {
      title: 'แบ่งเป็นโปรตีน ไขมัน คาร์บ',
      what: 'โปรตีนคิดจากน้ำหนักตัว ไขมันคิดเป็น 25% ของงบ ที่เหลือเป็นคาร์บ',
      formula: 'โปรตีน 1.6 ก. × น้ำหนัก · ไขมัน (งบ × 25%) ÷ 9 · คาร์บ = ที่เหลือ ÷ 4',
      filled: `โปรตีน ${t.proteinG} ก. · ไขมัน ${t.fatG} ก. · คาร์บ ${t.carbG} ก.`,
      note: 'โปรตีนและคาร์บให้ 4 kcal ต่อกรัม ไขมันให้ 9 kcal ต่อกรัม',
    },
    {
      title: 'น้ำที่ควรดื่ม',
      what: 'คิดจากน้ำหนักตัว แล้วปัดเป็นหลัก 50 มล.',
      formula: '33 มล. × น้ำหนัก',
      filled: `33 × ${b.weightKg} ≈ ${n(t.waterMl)} มล. (${(t.waterMl / 1000).toFixed(1)} ลิตร)`,
      note: 'วันที่อากาศร้อนหรือเหงื่อออกมาก ควรดื่มเพิ่ม',
    },
    {
      title: 'BMI ดัชนีมวลกาย',
      what: 'บอกคร่าวๆ ว่าน้ำหนักเหมาะกับส่วนสูงไหม ใช้เกณฑ์สำหรับคนเอเชีย',
      formula: 'น้ำหนัก ÷ (ส่วนสูงเป็นเมตร)²',
      filled: `${b.weightKg} ÷ ${(b.heightCm / 100).toFixed(2)}² = ${t.bmi.toFixed(1)} (${BMI_LABELS[t.bmiClass]})`,
      note: 'ต่ำกว่า 18.5 น้อย · 18.5-22.9 สมส่วน · 23-24.9 เกิน · 25 ขึ้นไป อ้วน · ไม่แยกกล้ามเนื้อกับไขมัน',
    },
  ]
})

const saving = ref(false)
const useAsMine = async () => {
  if (!input.value) return
  saving.value = true
  try {
    const { age, ...body } = input.value
    const p = profileStore.profile
    await profileStore.save({ ...body, birthYear: new Date().getFullYear() - age, skinType: p?.skinType, skinConcerns: p?.skinConcerns ?? [] })
    showSuccess('ตั้งงบใหม่แล้ว')
    router.push({ name: 'today' })
  } catch (err) {
    showError(getApiErrorMessage(err))
  } finally {
    saving.value = false
  }
}
</script>


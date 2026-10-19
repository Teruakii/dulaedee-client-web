<template>
  <main class="mx-auto min-h-screen max-w-5xl p-5 md:p-10">
    <div class="mb-8 flex items-center gap-4">
      <BrandMark :with-name="false" />
      <div class="flex flex-1 gap-2">
        <span v-for="i in STEPS.length" :key="i" class="h-2.5 flex-1 rounded-full transition-colors" :class="i <= step ? 'bg-melon' : 'bg-line'" />
      </div>
      <span class="text-sm text-mute">{{ step }} / {{ STEPS.length }}</span>
    </div>

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-5">
      <form class="card md:p-8 lg:col-span-3" @submit.prevent="next">
        <div class="flex items-center gap-3"><MascotLeaf class="h-14 w-14" /><h1 class="text-2xl md:text-3xl">{{ STEPS[step - 1]!.title }}</h1></div>
        <p class="mt-1 text-mute">{{ STEPS[step - 1]!.hint }}</p>

        <div v-if="step === 1" class="mt-6 space-y-5">
          <div class="grid grid-cols-2 gap-2">
            <button v-for="s in SEXES" :key="s.value" type="button" class="rounded-full py-4 text-lg" :class="choice(form.sex === s.value)" @click="form.sex = s.value">
              {{ s.label }}
            </button>
          </div>
          <label class="block"><span class="text-sm font-medium">อายุ (ปี)</span><input v-model.number="form.age" type="number" inputmode="numeric" class="field" /></label>
        </div>

        <div v-else-if="step === 2" class="mt-6 grid grid-cols-2 gap-3">
          <label><span class="text-sm font-medium">ส่วนสูง ซม.</span><input v-model.number="form.heightCm" type="number" inputmode="numeric" class="field" /></label>
          <label><span class="text-sm font-medium">น้ำหนัก กก.</span><input v-model.number="form.weightKg" type="number" inputmode="decimal" step="0.1" class="field" /></label>
        </div>

        <div v-else-if="step === 3" class="mt-6">
          <GoalPicker v-model="form.goal" />
          <h2 class="mt-8 font-semibold">ระดับกิจกรรม</h2>
          <div class="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <button v-for="(a, key) in ACTIVITY_LABELS" :key="key" type="button" class="rounded-full px-3 py-3 text-sm" :class="choice(form.activity === key)" @click="form.activity = key">
              {{ a.label }}
            </button>
          </div>
        </div>

        <div v-else class="mt-6 space-y-6">
          <div class="flex flex-wrap gap-2">
            <button v-for="(label, key) in SKIN_TYPE_LABELS" :key="key" type="button" class="rounded-full px-4 py-2" :class="choice(form.skinType === key)" @click="form.skinType = form.skinType === key ? undefined : key">
              {{ label }}
            </button>
          </div>
          <div>
            <h2 class="font-semibold">เรื่องที่อยากดูแล</h2>
            <div class="mt-3 flex flex-wrap gap-2">
              <button v-for="(label, key) in SKIN_CONCERN_LABELS" :key="key" type="button" class="rounded-full px-4 py-2" :class="choice(form.skinConcerns.includes(key))" @click="toggleConcern(key)">
                {{ label }}
              </button>
            </div>
          </div>
        </div>

        <div class="mt-8 flex gap-3">
          <button v-if="step > 1" type="button" class="btn-soft" @click="step--">ย้อนกลับ</button>
          <button type="submit" class="btn-ink flex-1" :disabled="!stepValid || saving">
            {{ step === STEPS.length ? 'เริ่มใช้งาน' : 'ถัดไป' }}
          </button>
        </div>
      </form>

      <aside class="rounded-[2.5rem] bg-gradient-to-br from-melon to-mango p-6 text-white md:p-8 lg:col-span-2 lg:self-start">
        <p class="text-white/80">งบแคลอรี่ต่อวันของคุณ</p>
        <div class="mt-1 font-display text-5xl">{{ targets ? formatNumber(targets.kcal) : '–' }} <span class="text-xl font-medium">kcal</span></div>
        <template v-if="targets">
          <div class="mt-6 space-y-3 rounded-2xl bg-white/10 p-4 text-sm">
            <div class="flex justify-between"><span class="text-white/80">ร่างกายใช้ขณะพัก (BMR)</span><span>{{ formatNumber(targets.bmr) }}</span></div>
            <div class="flex justify-between"><span class="text-white/80">รวมกิจกรรม (× {{ ACTIVITY_LABELS[form.activity!].factor }})</span><span>{{ formatNumber(targets.tdee) }}</span></div>
            <div class="flex justify-between"><span class="text-white/80">{{ GOAL_LABELS[form.goal!].label }}</span><span>{{ signed(targets.kcal - targets.tdee) }}</span></div>
          </div>
          <div class="mt-6 grid grid-cols-3 gap-2 text-center text-sm">
            <div class="rounded-2xl bg-white/10 p-3"><div class="text-xl font-bold">{{ targets.proteinG }}</div>โปรตีน ก.</div>
            <div class="rounded-2xl bg-white/10 p-3"><div class="text-xl font-bold">{{ targets.carbG }}</div>คาร์บ ก.</div>
            <div class="rounded-2xl bg-white/10 p-3"><div class="text-xl font-bold">{{ targets.fatG }}</div>ไขมัน ก.</div>
          </div>
        </template>
        <p v-else class="mt-4 text-sm text-white/80">กรอกเพศ อายุ ส่วนสูง และน้ำหนัก แล้วงบจะขึ้นที่นี่</p>
        <p class="mt-6 text-sm text-white/70">คำนวณด้วยสูตร Mifflin-St Jeor</p>
      </aside>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BrandMark from '@/components/BrandMark.vue'
import MascotLeaf from '@/components/MascotLeaf.vue'
import GoalPicker from '@/components/health/GoalPicker.vue'
import { useProfileStore } from '@/stores/profile.pinia'
import { isValidBody, useCalcPreview } from '@/use/useCalcPreview'
import { useMessage } from '@/use/useMessage'
import { getApiErrorMessage } from '@/utils/apiError'
import { safeRedirect } from '@/utils/afterLogin'
import { formatNumber } from '@/utils/date'
import { ACTIVITY_LABELS, GOAL_LABELS, SKIN_CONCERN_LABELS, SKIN_TYPE_LABELS } from '@/utils/labels'
import type { CalcInput, Sex, SkinConcern, SkinType } from '@/types/health.types'

const STEPS = [
  { title: 'เริ่มจากตัวคุณ', hint: 'ใช้คำนวณพลังงานที่ร่างกายใช้ต่อวัน' },
  { title: 'ส่วนสูงและน้ำหนัก', hint: 'น้ำหนักอัปเดตได้ทุกวันในหน้าร่างกาย' },
  { title: 'เป้าหมายของคุณคืออะไร', hint: 'ใช้คำนวณงบแคลอรี่ต่อวัน เปลี่ยนได้ทุกเมื่อ' },
  { title: 'สภาพผิวของคุณ', hint: 'ไม่บังคับ ใช้แนะนำ routine และเตือนตามอากาศ' },
]
const SEXES: { value: Sex; label: string }[] = [
  { value: 'female', label: 'หญิง' },
  { value: 'male', label: 'ชาย' },
]

const route = useRoute()
const router = useRouter()
const profileStore = useProfileStore()
const { showError } = useMessage()

const step = ref(1)
const saving = ref(false)
const form = reactive<Partial<CalcInput> & { skinType?: SkinType; skinConcerns: SkinConcern[] }>({ activity: 'light', goal: 'lose', skinConcerns: [] })
const choice = (on: boolean) => (on ? 'bg-ink font-semibold text-white' : 'border-2 border-line bg-surface')
const signed = (n: number) => (n === 0 ? '0' : `${n > 0 ? '+' : '−'} ${formatNumber(Math.abs(n))}`)

const stepValid = computed(() => {
  if (step.value === 1) return !!form.sex && typeof form.age === 'number' && form.age >= 13 && form.age <= 120
  if (step.value === 2) return typeof form.heightCm === 'number' && form.heightCm >= 100 && form.heightCm <= 250 && typeof form.weightKg === 'number' && form.weightKg >= 25 && form.weightKg <= 300
  return isValidBody(form)
})

const input = computed(() => (isValidBody(form) ? { sex: form.sex, age: form.age, heightCm: form.heightCm, weightKg: form.weightKg, activity: form.activity, goal: form.goal } : null))
const { targets } = useCalcPreview(input)

const toggleConcern = (c: SkinConcern) => {
  form.skinConcerns = form.skinConcerns.includes(c) ? form.skinConcerns.filter((x) => x !== c) : [...form.skinConcerns, c]
}

const next = async () => {
  if (!stepValid.value) return
  if (step.value < STEPS.length) {
    step.value++
    return
  }
  if (!input.value) return
  saving.value = true
  try {
    const { age, ...body } = input.value
    await profileStore.save({ ...body, birthYear: new Date().getFullYear() - age, skinType: form.skinType, skinConcerns: form.skinConcerns })
    router.replace(safeRedirect(route.query.redirect) ?? { name: 'today' })
  } catch (err) {
    showError(getApiErrorMessage(err))
  } finally {
    saving.value = false
  }
}

// แก้ไขจากหน้าโปรไฟล์ = เติมค่าเดิมไว้ให้
onMounted(async () => {
  await profileStore.load().catch(() => undefined)
  const p = profileStore.profile
  if (p) Object.assign(form, { sex: p.sex, age: p.age, heightCm: p.heightCm, weightKg: p.weightKg, activity: p.activity, goal: p.goal, skinType: p.skinType, skinConcerns: [...p.skinConcerns] })
})
</script>


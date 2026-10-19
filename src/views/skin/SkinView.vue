<template>
  <header class="mb-6 flex flex-wrap items-center gap-3 md:mb-8">
    <h1 class="mr-auto text-3xl">ดูแลผิว</h1>
    <div class="pill-tabs">
      <button
        v-for="s in SLOTS"
        :key="s"
        class="pill-tab"
        :class="{ 'pill-tab-active': s === slot }"
        @click="slot = s"
      >
        {{ SLOT_LABELS[s] }}
      </button>
    </div>
  </header>

  <div class="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3">
    <section class="card bg-lilac lg:col-span-2">
      <div class="flex items-center justify-between">
        <h2 class="text-xl">routine {{ SLOT_LABELS[slot] }}</h2>
        <span class="rounded-full bg-white px-3 py-1 text-sm">{{ doneCount }} / {{ routine?.products.length ?? 0 }}</span>
      </div>

      <div v-for="(c, i) in routine?.clashes ?? []" :key="`c${i}`" class="mt-4 flex rounded-3xl bg-white p-4 text-sm ring-2 ring-melon/40">
        <div>
          <p class="font-semibold text-melon">{{ productName(c.productIds[0]) }} กับ {{ productName(c.productIds[1]) }} ใช้{{ SLOT_LABELS[slot] }}เดียวกัน</p>
          <p class="text-mute">{{ CLASH_LABELS[c.kind] }}</p>
        </div>
      </div>
      <div v-for="w in routine?.warnings ?? []" :key="w.productId + w.code" class="mt-4 flex rounded-3xl bg-white p-4 text-sm ring-2 ring-mango/50">
        <p class="text-ink">{{ productName(w.productId) }}: {{ SLOT_WARNING_LABELS[w.code] ?? w.code }}</p>
      </div>

      <ol class="mt-4 space-y-2">
        <li v-for="p in routine?.products ?? []" :key="p.id" class="flex items-center gap-4 rounded-3xl bg-white p-3 pl-4">
          <button
            class="grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 transition-colors active:scale-90"
            :class="isDone(p.id) ? 'border-grape bg-grape text-white' : 'border-line'"
            :aria-label="isDone(p.id) ? `ยกเลิก ${p.name}` : `ทำแล้ว ${p.name}`"
            :disabled="toggling"
            @click="toggle(p.id)"
          >
            <Check v-if="isDone(p.id)" class="h-4 w-4" :stroke-width="3" />
          </button>
          <div class="min-w-0 flex-1">
            <p class="font-medium" :class="{ 'text-mute line-through': isDone(p.id) }">{{ p.name }}</p>
            <p class="text-sm text-mute">{{ productMeta(p) }}</p>
          </div>
          <span v-if="clashIds.has(p.id)" class="rounded-full bg-blush px-2 py-0.5 text-xs text-melon">ชน</span>
          <button class="grid h-10 w-10 shrink-0 place-items-center rounded-full text-mute hover:bg-bg" :aria-label="`ลบ ${p.name}`" @click="removeProduct(p.id, p.name)">
            <Trash2 class="h-4 w-4" />
          </button>
        </li>
      </ol>
      <p v-if="routine && !routine.products.length" class="py-6 text-center text-mute">ยังไม่มีผลิตภัณฑ์ใน routine {{ SLOT_LABELS[slot] }} เริ่มจากล้างหน้า บำรุง และกันแดด</p>
      <button class="mt-3 w-full rounded-full border-[3px] border-dashed border-grape/40 py-3 font-semibold text-grape" @click="openProduct">+ เพิ่มผลิตภัณฑ์</button>
    </section>

    <div class="space-y-4 md:space-y-6">
      <WeatherCard when="tomorrow" compact plain />
      <section class="lift card bg-mint">
        <h2 class="text-lg">ต่อเนื่อง</h2>
        <div class="mt-3 grid grid-cols-7 gap-1.5 text-center text-xs text-mute">
          <span v-for="d in streak" :key="`l${d.date}`">{{ weekdayShort(d.date) }}</span>
          <span
            v-for="d in streak"
            :key="d.date"
            class="aspect-square rounded-full"
            :class="d.done ? 'bg-lime' : d.partial ? 'bg-lime/40' : 'bg-white'"
          />
        </div>
        <p class="mt-3 text-sm text-mute">ทำครบ {{ streak.filter((d) => d.done).length }} จาก 7 {{ slot === 'am' ? 'เช้า' : 'คืน' }} ข้ามบ้างไม่เป็นไร</p>
      </section>
    </div>

    <section class="card bg-ice lg:col-span-3">
      <div class="flex flex-wrap items-baseline justify-between gap-2">
        <h2 class="text-xl">ดูแล{{ SKIN_TYPE_LABELS[tipType] }}ยังไงดี</h2>
        <p v-if="profileType" class="text-sm text-mute">
          {{ tipType === profileType ? 'ตามสภาพผิวในโปรไฟล์ของคุณ' : `ผิวคุณในโปรไฟล์คือ${SKIN_TYPE_LABELS[profileType]}` }}
        </p>
      </div>
      <div class="no-scrollbar -mx-5 mt-3 flex gap-2 overflow-x-auto px-5 md:mx-0 md:flex-wrap md:px-0" role="tablist" aria-label="เลือกสภาพผิว">
        <button
          v-for="(label, key) in SKIN_TYPE_LABELS"
          :key="key"
          role="tab"
          :aria-selected="tipType === key"
          class="chip"
          :class="tipType === key ? 'bg-sky text-white' : 'bg-white text-ink'"
          @click="tipType = key"
        >
          {{ label }}
        </button>
      </div>
      <p class="mt-4 max-w-3xl">{{ tip.summary }}</p>

      <div class="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        <div v-for="s in SLOTS" :key="s" class="rounded-3xl bg-white p-4">
          <h3 class="font-semibold">ขั้นตอน{{ SLOT_LABELS[s] }}</h3>
          <ol class="mt-2 space-y-1.5 text-sm">
            <li v-for="(step, i) in tip[s]" :key="step" class="flex gap-2">
              <span class="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-ice text-xs font-semibold text-sky">{{ i + 1 }}</span>
              <span>{{ step }}</span>
            </li>
          </ol>
        </div>
      </div>

      <div class="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
        <div class="rounded-3xl bg-white p-4">
          <h3 class="font-semibold text-lime">ส่วนผสมที่ช่วยได้</h3>
          <ul class="mt-2 space-y-2 text-sm">
            <li v-for="l in tip.look" :key="l.name">
              <p class="font-medium">
                {{ l.name }}
                <span v-if="l.active && ownedActives.has(l.active)" class="ml-1 rounded-full bg-mint px-2 py-0.5 text-xs text-lime">มีใน routine แล้ว</span>
              </p>
              <p class="text-mute">{{ l.why }}</p>
            </li>
          </ul>
        </div>
        <div class="rounded-3xl bg-white p-4">
          <h3 class="font-semibold text-melon">ควรเลี่ยง</h3>
          <ul class="mt-2 list-disc space-y-1.5 pl-5 text-sm marker:text-melon">
            <li v-for="a in tip.avoid" :key="a">{{ a }}</li>
          </ul>
        </div>
        <div class="rounded-3xl bg-white p-4">
          <h3 class="font-semibold text-grape">นิสัยที่ช่วยได้</h3>
          <ul class="mt-2 list-disc space-y-1.5 pl-5 text-sm marker:text-grape">
            <li v-for="h in tip.habits" :key="h">{{ h }}</li>
          </ul>
        </div>
      </div>

      <ul v-if="concernTips.length" class="mt-3 space-y-1.5 rounded-3xl bg-white p-4 text-sm">
        <li class="font-semibold">ปัญหาผิวที่คุณเลือกไว้</li>
        <li v-for="c in concernTips" :key="c">{{ c }}</li>
      </ul>
      <p class="mt-3 text-xs text-mute">คำแนะนำทั่วไป ไม่ใช่การวินิจฉัย ถ้าผิวอักเสบ เป็นสิวหนัก หรือแพ้ต่อเนื่อง ควรพบแพทย์ผิวหนัง</p>
    </section>

  </div>

  <el-dialog v-model="productOpen" title="เพิ่มผลิตภัณฑ์" width="min(480px, 92vw)">
    <el-form label-position="top" @submit.prevent="saveProduct">
      <el-form-item label="ชื่อ"><el-input v-model="product.name" placeholder="เช่น เซรั่มวิตามินซี" /></el-form-item>
      <el-form-item label="ขั้นตอน">
        <el-select v-model="product.step" class="w-full">
          <el-option v-for="(label, key) in STEP_LABELS" :key="key" :label="label" :value="key" />
        </el-select>
      </el-form-item>
      <el-form-item label="ส่วนผสมสำคัญ">
        <el-checkbox-group v-model="product.actives">
          <el-checkbox v-for="(label, key) in ACTIVE_LABELS" :key="key" :value="key">{{ label }}</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item label="ใช้ตอน">
        <el-checkbox-group v-model="product.slots">
          <el-checkbox v-for="s in SLOTS" :key="s" :value="s">{{ SLOT_LABELS[s] }}</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <button type="submit" class="btn-ink w-full" :disabled="saving || !product.name.trim() || !product.slots.length">บันทึก</button>
    </el-form>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { ElMessageBox } from 'element-plus'
import { Check, Trash2 } from 'lucide-vue-next'
import { getRange } from '@/api/health/daylog.api'
import { createProduct, deleteProduct, getRoutine } from '@/api/health/skin.api'
import WeatherCard from '@/components/health/WeatherCard.vue'
import { useDayStore } from '@/stores/day.pinia'
import { useProfileStore } from '@/stores/profile.pinia'
import { useMessage } from '@/use/useMessage'
import { getApiErrorMessage } from '@/utils/apiError'
import { addDays, todayBangkok, weekdayShort } from '@/utils/date'
import { ACTIVE_LABELS, CLASH_LABELS, SKIN_TYPE_LABELS, SLOT_LABELS, SLOT_WARNING_LABELS, STEP_LABELS } from '@/utils/labels'
import { CONCERN_TIPS, SKIN_TIPS } from '@/utils/skinTips'
import { currentSlot } from '@/utils/timeOfDay'
import type { Active, Routine, SkinProduct, SkinProductUpsert, SkinSlot, SkinType } from '@/types/health.types'

const SLOTS: SkinSlot[] = ['am', 'pm']

const dayStore = useDayStore()
const profileStore = useProfileStore()

// เปิดที่สภาพผิวในโปรไฟล์ก่อน · ยังไม่ได้ตั้งก็เริ่มที่ผิวมัน (คนไทยเจอบ่อยในอากาศร้อนชื้น) แล้วสลับดูแบบอื่นได้
const profileType = computed(() => profileStore.profile?.skinType)
const tipType = ref<SkinType>('oily')
watch(profileType, (t) => t && (tipType.value = t), { immediate: true })
const tip = computed(() => SKIN_TIPS[tipType.value])
const concernTips = computed(() => (profileStore.profile?.skinConcerns ?? []).map((c) => CONCERN_TIPS[c]))
const ownedActives = computed(() => new Set<Active>(routine.value?.products.flatMap((p) => p.actives) ?? []))
const { showError } = useMessage()

const today = todayBangkok()
const slot = ref<SkinSlot>(currentSlot())
const routine = ref<Routine | null>(null)
const toggling = ref(false)
const saving = ref(false)

const doneIds = computed(() => new Set(dayStore.summary?.skinDone[slot.value] ?? []))
const isDone = (id: string) => doneIds.value.has(id)
const doneCount = computed(() => routine.value?.products.filter((p) => isDone(p.id)).length ?? 0)
const clashIds = computed(() => new Set(routine.value?.clashes.flatMap((c) => c.productIds) ?? []))
const productMeta = (p: SkinProduct) => [STEP_LABELS[p.step], ...p.actives.map((a) => ACTIVE_LABELS[a])].join(' · ')
const productName = (id: string) => routine.value?.products.find((p) => p.id === id)?.name ?? ''

const loadRoutine = async () => {
  try {
    routine.value = await getRoutine(slot.value)
  } catch (err) {
    showError(getApiErrorMessage(err))
  }
}

const toggle = async (id: string) => {
  toggling.value = true
  try {
    dayStore.date = today
    await dayStore.toggleSkinStep(slot.value, id)
    void loadStreak()
  } catch (err) {
    showError(getApiErrorMessage(err))
  } finally {
    toggling.value = false
  }
}

// ครบทุกขั้น = เต็ม · ทำบางขั้น = จาง
const streak = ref<{ date: string; done: boolean; partial: boolean }[]>([])
const loadStreak = async () => {
  const from = addDays(today, -6)
  const total = routine.value?.products.length ?? 0
  const got = new Map((await getRange(from, today)).map((p) => [p.date, slot.value === 'am' ? p.skinAm : p.skinPm]))
  streak.value = Array.from({ length: 7 }, (_, i) => addDays(from, i)).map((date) => {
    const n = got.get(date) ?? 0
    return { date, done: total > 0 && n >= total, partial: n > 0 && n < total }
  })
}

const productOpen = ref(false)
const product = reactive<SkinProductUpsert>({ name: '', step: 'serum', actives: [], slots: [] })
const openProduct = () => {
  Object.assign(product, { name: '', step: 'serum', actives: [], slots: [slot.value] })
  productOpen.value = true
}
const saveProduct = async () => {
  saving.value = true
  try {
    await createProduct({ ...product, name: product.name.trim() })
    productOpen.value = false
    await loadRoutine()
  } catch (err) {
    showError(getApiErrorMessage(err))
  } finally {
    saving.value = false
  }
}
const removeProduct = async (id: string, name: string) => {
  try {
    await ElMessageBox.confirm(`ลบ ${name} ออกจากทุก routine?`, 'ลบผลิตภัณฑ์', { confirmButtonText: 'ลบ', cancelButtonText: 'ยกเลิก', type: 'warning' })
  } catch {
    return
  }
  try {
    await deleteProduct(id)
    await loadRoutine()
  } catch (err) {
    showError(getApiErrorMessage(err))
  }
}

watch(slot, async () => {
  await loadRoutine()
  await loadStreak().catch(() => undefined)
})

onMounted(async () => {
  dayStore.date = today
  await Promise.all([loadRoutine(), dayStore.load(today), profileStore.load().catch(() => undefined)])
  await loadStreak().catch(() => undefined)
})
</script>

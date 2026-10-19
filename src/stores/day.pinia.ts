import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import * as daylog from '@/api/health/daylog.api'
import { todayBangkok } from '@/utils/date'
import type { DaySummary, EntryAdd, Meal, QuickItem, SkinSlot } from '@/types/health.types'

// บันทึกของวันที่เลือก ใช้ร่วมกันระหว่างหน้าวันนี้ อาหาร และผิว
// ทุกคำสั่งแก้ไขได้สรุปทั้งวันกลับมา จึงแทนค่าเดิมทั้งก้อน ไม่ต้องคำนวณซ้ำฝั่ง client
export const useDayStore = defineStore('day', () => {
  const date = ref(todayBangkok())
  const summary = ref<DaySummary | null>(null)

  const remainingKcal = computed(() => summary.value?.remaining?.kcal ?? null)
  const proteinGapG = computed(() => Math.max(0, Math.round(summary.value?.remaining?.proteinG ?? 0)))

  const apply = (s: DaySummary) => {
    if (s.date === date.value) summary.value = s
  }

  const load = async (d = date.value) => {
    date.value = d
    apply(await daylog.getDay(d))
  }

  const addEntry = async (payload: EntryAdd) => apply(await daylog.addEntry(date.value, payload))
  const copyEntries = async (meal: Meal, from: QuickItem[]) => apply(await daylog.copyEntries(date.value, meal, from))
  const removeEntry = async (entryId: string) => apply(await daylog.removeEntry(date.value, entryId))
  const addWorkout = async (payload: Parameters<typeof daylog.addWorkout>[1]) => apply(await daylog.addWorkout(date.value, payload))
  const removeWorkout = async (id: string) => apply(await daylog.removeWorkout(date.value, id))
  const addWater = async (deltaMl: number) => apply(await daylog.addWater(date.value, deltaMl))
  const setWeight = async (kg: number) => apply(await daylog.setWeight(date.value, kg))

  const toggleSkinStep = async (slot: SkinSlot, productId: string) => {
    const done = summary.value?.skinDone[slot] ?? []
    const next = done.includes(productId) ? done.filter((id) => id !== productId) : [...done, productId]
    apply(await daylog.setSkinDone(date.value, slot, next))
  }

  const reset = () => {
    date.value = todayBangkok()
    summary.value = null
  }

  return { date, summary, remainingKcal, proteinGapG, load, addEntry, copyEntries, removeEntry, addWorkout, removeWorkout, addWater, setWeight, toggleSkinStep, reset }
})

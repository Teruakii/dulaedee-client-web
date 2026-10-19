import axios from '../instance'
import type { WorkoutActivity, DaySummary, EntryAdd, Meal, QuickItem, RangePoint, SkinSlot, StreakSummary } from '@/types/health.types'

// ทุกคำสั่งแก้ไขคืนสรุปของวันนั้นทั้งก้อน หน้าจอแทนค่าเดิมได้เลย
type Day = { data: DaySummary }

export const getDay = async (date: string) => (await axios.get<Day>(`/daylogs/${date}`)).data.data

/** ย้อนหลังได้ไม่เกิน 93 วัน */
export const getRange = async (from: string, to: string) =>
  (await axios.get<{ data: RangePoint[] }>(`/daylogs`, { params: { from, to } })).data.data

export const addEntry = async (date: string, payload: EntryAdd) => (await axios.post<Day>(`/daylogs/${date}/entries`, payload)).data.data

/** มื้อเดียวกันของเมื่อวาน + เมนูที่กินบ่อยใน 30 วัน */
export const getQuick = async (date: string, meal: Meal) =>
  (await axios.get<{ data: { yesterday: QuickItem[]; frequent: QuickItem[] } }>(`/daylogs/quick`, { params: { date, meal } })).data.data

/** คัดลอกรายการเดิม (สารอาหารเท่าเดิม) มาลงมื้อของวันนี้ */
export const copyEntries = async (date: string, meal: Meal, from: Pick<QuickItem, 'date' | 'entryId'>[]) =>
  (await axios.post<Day>(`/daylogs/${date}/entries/copy`, { meal, from: from.map(({ date: d, entryId }) => ({ date: d, entryId })) })).data.data

/** วันต่อเนื่องและเหรียญ นับถึงวันนี้ */
export const getStreaks = async (date: string) => (await axios.get<{ data: StreakSummary }>(`/daylogs/streaks`, { params: { date } })).data.data

export const removeEntry = async (date: string, entryId: string) =>
  (await axios.delete<Day>(`/daylogs/${date}/entries/${entryId}`)).data.data

/** ติ๊กว่าเล่นแล้ว · planItemId ผูกกับข้อในตาราง */
export const addWorkout = async (date: string, payload: WorkoutActivity & { planItemId?: string }) =>
  (await axios.post<Day>(`/daylogs/${date}/workouts`, payload)).data.data

export const removeWorkout = async (date: string, workoutId: string) =>
  (await axios.delete<Day>(`/daylogs/${date}/workouts/${workoutId}`)).data.data

export const addWater = async (date: string, deltaMl: number) => (await axios.post<Day>(`/daylogs/${date}/water`, { deltaMl })).data.data

export const setWeight = async (date: string, weightKg: number) => (await axios.put<Day>(`/daylogs/${date}/weight`, { weightKg })).data.data

export const setSkinDone = async (date: string, slot: SkinSlot, done: string[]) =>
  (await axios.put<Day>(`/daylogs/${date}/skin/${slot}`, { done })).data.data

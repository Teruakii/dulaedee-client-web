import type { Meal, SkinSlot } from '@/types/health.types'

// ช่วงเวลาของมื้อ: ก่อน 10 โมงเช้า ก่อนบ่ายสามกลางวัน ก่อนสามทุ่มเย็น ดึกกว่านั้นของว่าง
const MEAL_UNTIL_HOUR: [number, Meal][] = [
  [10, 'breakfast'],
  [15, 'lunch'],
  [21, 'dinner'],
]

export const nextMealNow = (hour = new Date().getHours()): Meal => MEAL_UNTIL_HOUR.find(([until]) => hour < until)?.[1] ?? 'snack'

/** ก่อนบ่ายสามโมงดู routine เช้า หลังจากนั้นดูก่อนนอน */
export const currentSlot = (hour = new Date().getHours()): SkinSlot => (hour < 15 ? 'am' : 'pm')

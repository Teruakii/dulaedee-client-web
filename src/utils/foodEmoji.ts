import type { FoodTag, Meal } from '@/types/health.types'

// ยังไม่มีรูปอาหารจริง ใช้อีโมจิตามคำในชื่อเมนู · คำที่เจาะจงกว่าต้องมาก่อน (ต้มยำกุ้ง ก่อน กุ้ง)
const BY_NAME: [string, string][] = [
  ['ส้มตำ', '🥭'],
  ['สลัด', '🥗'],
  ['ต้มยำ', '🍤'],
  ['ยำ', '🥗'],
  ['สุกี้', '🍲'],
  ['แกงจืด', '🍲'],
  ['แกง', '🍛'],
  ['ก๋วยเตี๋ยว', '🍜'],
  ['ข้าวซอย', '🍜'],
  ['ผัดไทย', '🍝'],
  ['โจ๊ก', '🥣'],
  ['ข้าวมันไก่', '🍗'],
  ['ข้าวขาหมู', '🍖'],
  ['ไข่ดาว', '🍳'],
  ['ไข่', '🥚'],
  ['กุ้ง', '🦐'],
  ['ปลา', '🐟'],
  ['ไก่', '🍗'],
  ['กะเพรา', '🍛'],
  ['ข้าวผัด', '🍛'],
  ['ข้าวเหนียว', '🍙'],
  ['ข้าว', '🍚'],
  ['กล้วย', '🍌'],
  ['โยเกิร์ต', '🥛'],
  ['นม', '🥛'],
  ['ชา', '🧋'],
]

const BY_TAG: [FoodTag, string][] = [
  ['soup', '🍲'],
  ['salad', '🥗'],
  ['drink', '🥤'],
  ['snack', '🍪'],
  ['one_dish', '🍛'],
]

export const MEAL_EMOJI: Record<Meal, string> = { breakfast: '🍳', lunch: '🍱', dinner: '🍲', snack: '🍌' }

export function foodEmoji(name: string, tags: FoodTag[] = []): string {
  return BY_NAME.find(([word]) => name.includes(word))?.[1] ?? BY_TAG.find(([t]) => tags.includes(t))?.[1] ?? '🍽️'
}

// พาสเทลพื้นหลังของเมนู เลือกจากชื่อให้คงที่ทุกครั้ง
const TINTS = ['bg-peach', 'bg-lemon', 'bg-mint', 'bg-ice', 'bg-lilac', 'bg-blush'] as const
export function foodTint(name: string): (typeof TINTS)[number] {
  // djb2: ผลรวมรหัสอักษรชนกันบ่อย
  const h = [...name].reduce((acc, ch) => (acc * 33) ^ ch.charCodeAt(0), 5381)
  return TINTS[Math.abs(h) % TINTS.length]!
}

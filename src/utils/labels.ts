import type {
  Active,
  WorkoutActivity,
  Activity,
  BadgeId,
  BmiClass,
  Habit,
  ClashKind,
  FoodTag,
  Goal,
  Meal,
  SkinConcern,
  SkinSlot,
  SkinStep,
  SkinType,
  Unit,
  UvLevel,
} from '@/types/health.types'

// ป้ายภาษาไทยของทุก enum จาก backend อยู่ที่นี่ที่เดียว

export const UNIT_LABELS: Record<Unit, string> = {
  plate: 'จาน',
  bowl: 'ถ้วย',
  ladle: 'ทัพพี',
  piece: 'ชิ้น',
  glass: 'แก้ว',
  skewer: 'ไม้',
  pack: 'ห่อ',
  serving: 'ที่',
}

export const MEAL_LABELS: Record<Meal, string> = {
  breakfast: 'มื้อเช้า',
  lunch: 'มื้อกลางวัน',
  dinner: 'มื้อเย็น',
  snack: 'ของว่าง',
}

export const MEAL_SHORT: Record<Meal, string> = { breakfast: 'เช้า', lunch: 'กลางวัน', dinner: 'เย็น', snack: 'ว่าง' }

/** ชื่อชาเลนจ์และวันต่อเนื่อง · "ทำครบ" ของแต่ละอย่างนับตาม backend */
export const HABIT_LABELS: Record<Habit, { name: string; done: string; emoji: string }> = {
  log: { name: 'จดอาหาร', done: 'จดอาหารอย่างน้อย 1 อย่าง', emoji: '📝' },
  water: { name: 'ดื่มน้ำครบ', done: 'ดื่มน้ำถึงเป้าของตัวเอง', emoji: '💧' },
  workout: { name: 'ออกกำลัง', done: 'ติ๊กว่าออกกำลังแล้ว', emoji: '🏃' },
  skin: { name: 'ดูแลผิว', done: 'ทำ routine ผิวอย่างน้อย 1 ขั้น', emoji: '✨' },
}

export const BADGE_LABELS: Record<BadgeId, { name: string; how: string; emoji: string }> = {
  'first-log': { name: 'ก้าวแรก', how: 'จดอาหารครั้งแรก', emoji: '🌱' },
  'log-3': { name: 'เริ่มติดแล้ว', how: 'จดอาหาร 3 วันติด', emoji: '🔥' },
  'log-7': { name: 'ครบสัปดาห์', how: 'จดอาหาร 7 วันติด', emoji: '🏅' },
  'log-30': { name: 'นักจดตัวจริง', how: 'จดอาหาร 30 วันติด', emoji: '🏆' },
  'water-7': { name: 'ชุ่มฉ่ำ', how: 'ดื่มน้ำครบ 7 วันติด', emoji: '💧' },
  'workout-10': { name: 'ขยันขยับ', how: 'ออกกำลังรวม 10 วัน', emoji: '💪' },
  'skin-14': { name: 'ผิวดีมีวินัย', how: 'ดูแลผิว 14 วันติด', emoji: '✨' },
}

export const FOOD_TAG_LABELS: Record<FoodTag, string> = {
  one_dish: 'จานเดียว',
  side_dish: 'กับข้าว',
  soup: 'ต้ม แกง',
  salad: 'ยำ สลัด',
  high_protein: 'โปรตีนสูง',
  no_rice: 'ไม่มีข้าว',
  street_food: 'สตรีทฟู้ด',
  drink: 'เครื่องดื่ม',
  snack: 'ของว่าง',
  breakfast: 'มื้อเช้า',
}

export const ACTIVITY_LABELS: Record<Activity, { label: string; hint: string; factor: number }> = {
  sedentary: { label: 'นั่งทำงาน', hint: 'แทบไม่ออกกำลัง', factor: 1.2 },
  light: { label: 'เบา', hint: 'ออกกำลัง 1-3 วัน/สัปดาห์', factor: 1.375 },
  moderate: { label: 'ปานกลาง', hint: '3-5 วัน/สัปดาห์', factor: 1.55 },
  active: { label: 'หนัก', hint: '6-7 วัน/สัปดาห์', factor: 1.725 },
}

// delta ตรงกับ GOAL_DELTA_KCAL ของ backend
export const GOAL_LABELS: Record<Goal, { label: string; deltaKcal: number; delta: string; hint: string }> = {
  lose: {
    label: 'ลดน้ำหนัก',
    deltaKcal: -300,
    delta: 'กินน้อยกว่าที่ใช้ 300 kcal/วัน',
    hint: 'น้ำหนักลดช้าๆ ราว 0.3 กก. ต่อสัปดาห์ ไม่หิวโหย และไม่ต่ำกว่าที่ร่างกายต้องใช้ขณะพัก',
  },
  maintain: {
    label: 'รักษาน้ำหนัก',
    deltaKcal: 0,
    delta: 'กินเท่ากับที่ใช้',
    hint: 'น้ำหนักคงที่ เหมาะกับคนที่พอใจรูปร่างตอนนี้ และอยากกินให้สมดุล',
  },
  gain: {
    label: 'เพิ่มกล้ามเนื้อ',
    deltaKcal: 300,
    delta: 'กินมากกว่าที่ใช้ 300 kcal/วัน',
    hint: 'เน้นโปรตีนสูง ต้องเล่นเวทควบคู่ ไม่อย่างนั้นส่วนที่กินเกินจะกลายเป็นไขมัน',
  },
}

export const BMI_LABELS: Record<BmiClass, string> = {
  underweight: 'น้ำหนักน้อย',
  normal: 'สมส่วน',
  overweight: 'น้ำหนักเกิน',
  obese: 'อ้วน',
}

export const SKIN_TYPE_LABELS: Record<SkinType, string> = {
  normal: 'ผิวธรรมดา',
  dry: 'ผิวแห้ง',
  oily: 'ผิวมัน',
  combination: 'ผิวผสม',
  sensitive: 'ผิวแพ้ง่าย',
}

export const SKIN_CONCERN_LABELS: Record<SkinConcern, string> = {
  acne: 'เป็นสิวง่าย',
  dark_spots: 'จุดด่างดำ',
  wrinkles: 'ริ้วรอย',
  redness: 'ผิวแดง',
  dullness: 'หมองคล้ำ',
  large_pores: 'รูขุมขนกว้าง',
}

export const SLOT_LABELS: Record<SkinSlot, string> = { am: 'เช้า', pm: 'ก่อนนอน' }

export const STEP_LABELS: Record<SkinStep, string> = {
  cleanser: 'ทำความสะอาด',
  toner: 'โทนเนอร์',
  serum: 'เซรั่ม',
  treatment: 'ทรีตเมนต์',
  moisturizer: 'บำรุง',
  sunscreen: 'กันแดด',
  other: 'อื่นๆ',
}

export const ACTIVE_LABELS: Record<Active, string> = {
  retinol: 'Retinol',
  aha: 'AHA',
  bha: 'BHA',
  vitamin_c: 'Vitamin C',
  niacinamide: 'Niacinamide',
  benzoyl_peroxide: 'Benzoyl Peroxide',
  hyaluronic_acid: 'Hyaluronic Acid',
  spf: 'SPF',
}

export const CLASH_LABELS: Record<ClashKind, string> = {
  IRRITATION: 'อาจระคายเคืองได้ ลองสลับใช้คนละคืน',
  OVER_EXFOLIATION: 'ผลัดเซลล์ผิวมากเกินไป ลองสลับใช้คนละวัน',
  DEACTIVATES: 'อาจลดฤทธิ์กัน ใช้คนละช่วงเวลา',
}

export const SLOT_WARNING_LABELS: Record<string, string> = {
  RETINOL_AT_NIGHT: 'เรตินอลทำให้ผิวไวต่อแดด ควรใช้ก่อนนอน',
}

export const UV_LABELS: Record<UvLevel, string> = {
  low: 'ต่ำ',
  moderate: 'ปานกลาง',
  high: 'สูง',
  very_high: 'สูงมาก',
  extreme: 'อันตราย',
}

export const ADVICE_LABELS: Record<string, string> = {
  SUNSCREEN_SPF50: 'ทากันแดด SPF50 ก่อนออกจากบ้าน',
  REAPPLY_SUNSCREEN_2H: 'ทากันแดดซ้ำทุก 2 ชั่วโมง',
  AVOID_SUN_10_TO_16: 'เลี่ยงแดดช่วง 10 โมงถึง 4 โมงเย็น',
  DRINK_MORE_WATER: 'ดื่มน้ำเพิ่มอีก 2 แก้ว',
  GEL_MOISTURIZER: 'อากาศชื้น เลือกมอยส์เจอไรเซอร์เนื้อเจล',
  RICH_MOISTURIZER: 'อากาศแห้ง เลือกมอยส์เจอไรเซอร์เนื้อครีม',
}

export const WEEKDAY_SHORT = ['จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส', 'อา'] as const
export const WEEKDAY_LONG = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์', 'อาทิตย์'] as const

/** 30 นาที · 120 kcal (ไม่ได้ใส่ kcal ก็แสดงแค่เวลา) */
export const activityText = (a: WorkoutActivity) => (a.kcal ? `${a.minutes} นาที · ${a.kcal} kcal` : `${a.minutes} นาที`)

/** บอกทุกครั้งก่อนสร้างหรือเข้ากลุ่ม · ตรงกับนโยบายความเป็นส่วนตัว */
export const PRIVACY_NOTE = 'คนในกลุ่มเห็นแค่ชื่อเล่นของคุณ และจำนวนวันที่ทำครบในสัปดาห์นี้ ไม่เห็นน้ำหนัก อาหาร หรือข้อมูลสุขภาพอื่น ออกจากกลุ่มได้ทุกเมื่อ'

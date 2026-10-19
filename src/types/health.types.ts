// ตรงกับ response ของ dulaedee-service

export type Sex = 'female' | 'male'
export type Activity = 'sedentary' | 'light' | 'moderate' | 'active'
export type Goal = 'lose' | 'maintain' | 'gain'
export type BmiClass = 'underweight' | 'normal' | 'overweight' | 'obese'
export type SkinType = 'normal' | 'dry' | 'oily' | 'combination' | 'sensitive'
export type SkinConcern = 'acne' | 'dark_spots' | 'wrinkles' | 'redness' | 'dullness' | 'large_pores'

export interface Targets {
  bmr: number
  tdee: number
  kcal: number
  proteinG: number
  carbG: number
  fatG: number
  waterMl: number
  bmi: number
  bmiClass: BmiClass
}

export interface Notify {
  water: boolean
  uv: boolean
  skinRoutine: boolean
}

export interface Profile {
  id: string
  sex: Sex
  birthYear: number
  age: number
  heightCm: number
  weightKg: number
  activity: Activity
  goal: Goal
  skinType?: SkinType
  skinConcerns: SkinConcern[]
  notify: Notify
}

export interface ProfileWithTargets {
  profile: Profile
  targets: Targets
}

export interface ProfileUpsert {
  sex: Sex
  birthYear: number
  heightCm: number
  weightKg: number
  activity: Activity
  goal: Goal
  skinType?: SkinType
  skinConcerns: SkinConcern[]
}

export interface CalcInput {
  sex: Sex
  age: number
  heightCm: number
  weightKg: number
  activity: Activity
  goal: Goal
}

export type Unit = 'plate' | 'bowl' | 'ladle' | 'piece' | 'glass' | 'skewer' | 'pack' | 'serving'
export type FoodTag =
  | 'one_dish'
  | 'side_dish'
  | 'soup'
  | 'salad'
  | 'high_protein'
  | 'no_rice'
  | 'street_food'
  | 'drink'
  | 'snack'
  | 'breakfast'

export interface Food {
  id: string
  nameTh: string
  unit: Unit
  kcal: number
  proteinG: number
  carbG: number
  fatG: number
  tags: FoodTag[]
  verified: boolean
  /** เมนูที่ผู้ใช้เพิ่มเอง เห็นและลบได้เฉพาะเจ้าของ */
  personal: boolean
}

export type FoodUpsert = Omit<Food, 'id' | 'personal'>

export type MyFoodCreate = Pick<Food, 'nameTh' | 'kcal' | 'proteinG' | 'carbG' | 'fatG'>

export interface Paginated<T> {
  data: T[]
  pagination: { page: number; limit: number; hasMore: boolean }
}

export type Meal = 'breakfast' | 'lunch' | 'dinner' | 'snack'
export type SkinSlot = 'am' | 'pm'

export interface Macros {
  kcal: number
  proteinG: number
  carbG: number
  fatG: number
}

export interface Entry extends Macros {
  id: string
  meal: Meal
  foodId?: string
  nameTh: string
  unit?: Unit
  qty: number
  createdAt: string
}

export interface DaySummary {
  date: string
  entries: Entry[]
  totals: Macros
  byMeal: Record<Meal, Macros>
  waterMl: number
  weightKg?: number
  skinDone: Record<SkinSlot, string[]>
  workouts: WorkoutLog[]
  /** แสดงอย่างเดียว ไม่บวกกลับเข้างบ */
  burned: { kcal: number; minutes: number }
  targets: Targets | null
  remaining: Macros | null
}

export interface RangePoint {
  date: string
  kcal: number
  proteinG: number
  /** จำนวนรายการอาหารที่จดวันนั้น */
  entries: number
  waterMl: number
  weightKg?: number
  skinAm: number
  skinPm: number
  workoutMin: number
  burnedKcal: number
}

/** เมนูที่กดเพิ่มซ้ำได้ · date + entryId ชี้รายการเดิมที่จะคัดลอก */
export interface QuickItem {
  date: string
  entryId: string
  foodId?: string
  nameTh: string
  unit?: Unit
  qty: number
  kcal: number
  proteinG: number
  count: number
}

/** สิ่งที่นับวันต่อเนื่องและใช้เป็นชาเลนจ์กลุ่ม */
export type Habit = 'log' | 'water' | 'workout' | 'skin'

export interface Streak {
  current: number
  best: number
  days: number
}

export type BadgeId = 'first-log' | 'log-3' | 'log-7' | 'log-30' | 'water-7' | 'workout-10' | 'skin-14'

export interface Badge {
  id: BadgeId
  progress: number
  goal: number
  earned: boolean
}

export interface StreakSummary {
  streaks: Record<Habit, Streak>
  badges: Badge[]
}

export interface GroupSummary {
  id: string
  name: string
  challenge: Habit
  memberCount: number
  isOwner: boolean
}

export interface BoardRow {
  userId: string
  firstName: string
  isMe: boolean
  isOwner: boolean
  /** จันทร์ถึงอาทิตย์ */
  days: boolean[]
  count: number
}

export interface GroupDetail extends GroupSummary {
  inviteCode: string
  week: { from: string; to: string }
  board: BoardRow[]
}

export interface InvitePreview {
  name: string
  challenge: Habit
  memberCount: number
  alreadyMember: boolean
  full: boolean
}

/** เลือกจากฐานเมนู หรือกรอกเองเมื่อค้นไม่เจอ */
export type EntryAdd =
  | { meal: Meal; qty: number; foodId: string }
  | { meal: Meal; qty: number; nameTh: string; kcal: number; proteinG?: number; carbG?: number; fatG?: number }

export type SkinStep = 'cleanser' | 'toner' | 'serum' | 'treatment' | 'moisturizer' | 'sunscreen' | 'other'
export type Active = 'retinol' | 'aha' | 'bha' | 'vitamin_c' | 'niacinamide' | 'benzoyl_peroxide' | 'hyaluronic_acid' | 'spf'
export type ClashKind = 'IRRITATION' | 'OVER_EXFOLIATION' | 'DEACTIVATES'

export interface SkinProduct {
  id: string
  name: string
  step: SkinStep
  actives: Active[]
  slots: SkinSlot[]
  order: Record<SkinSlot, number>
}

export interface SkinProductUpsert {
  name: string
  step: SkinStep
  actives: Active[]
  slots: SkinSlot[]
}

export interface Clash {
  productIds: [string, string]
  actives: [Active, Active]
  kind: ClashKind
}

export interface SlotWarning {
  productId: string
  active: Active
  code: string
}

export interface Routine {
  slot: SkinSlot
  products: SkinProduct[]
  clashes: Clash[]
  warnings: SlotWarning[]
}

export interface Clip {
  id: string
  youtubeId: string
  title: string
  channel: string
  durationSec: number
  foodIds: string[]
  tags: FoodTag[]
  thumbnailUrl: string
  watchUrl: string
}

export interface ClipUpsert {
  youtubeId: string
  title: string
  channel: string
  durationSec: number
  foodIds: string[]
  tags: FoodTag[]
}

export type UvLevel = 'low' | 'moderate' | 'high' | 'very_high' | 'extreme'

export interface Weather {
  now: { time: string; uvIndex: number; humidityPct: number }
  today: { date: string; uvMax: number; uvMaxTime: string; uvLevel: UvLevel }
  tomorrow: { date: string; uvMax: number; uvLevel: UvLevel } | null
  advice: string[]
}

/** ผู้ใช้กรอกเองทั้งหมด · kcal ใส่เมื่อรู้ ไม่ใส่ก็ไม่นับ */
export interface WorkoutActivity {
  name: string
  minutes: number
  kcal?: number
}

export interface PlanItem extends WorkoutActivity {
  id: string
}

/** days[0] = จันทร์ ถึง days[6] = อาทิตย์ */
export interface WorkoutPlan {
  days: PlanItem[][]
}

export interface WorkoutLog extends WorkoutActivity {
  id: string
  planItemId?: string
  createdAt: string
}

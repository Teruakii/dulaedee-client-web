import axios from '../instance'
import type { WorkoutActivity, WorkoutPlan } from '@/types/health.types'

/** ยังไม่เคยกรอก = ตารางว่าง 7 วัน */
export const getPlan = async () => (await axios.get<{ data: WorkoutPlan }>(`/workouts/plan`)).data.data

/** weekday: จันทร์ 0 ถึง อาทิตย์ 6 */
export const setPlanDay = async (weekday: number, items: WorkoutActivity[]) =>
  (await axios.put<{ data: WorkoutPlan }>(`/workouts/plan/days/${weekday}`, { items })).data.data

import { ref, watch, type Ref } from 'vue'
import { calcTargets } from '@/api/health/profile.api'
import type { CalcInput, Targets } from '@/types/health.types'

// คำนวณงบจาก backend ทุกครั้งที่ฟอร์มเปลี่ยน สูตรจึงอยู่ที่เดียว
export function useCalcPreview(input: Ref<CalcInput | null>) {
  const targets = ref<Targets | null>(null)
  let timer: ReturnType<typeof setTimeout> | undefined
  let seq = 0

  watch(
    input,
    (v) => {
      clearTimeout(timer)
      if (!v) {
        targets.value = null
        return
      }
      timer = setTimeout(async () => {
        const mine = ++seq
        try {
          const t = await calcTargets(v)
          // คำตอบเก่าที่มาช้ากว่าห้ามทับค่าใหม่
          if (mine === seq) targets.value = t
        } catch {
          if (mine === seq) targets.value = null
        }
      }, 200)
    },
    { immediate: true, deep: true },
  )

  return { targets }
}

export const isValidBody = (b: Partial<CalcInput>): b is CalcInput =>
  !!b.sex &&
  !!b.activity &&
  !!b.goal &&
  typeof b.age === 'number' &&
  b.age >= 13 &&
  b.age <= 120 &&
  typeof b.heightCm === 'number' &&
  b.heightCm >= 100 &&
  b.heightCm <= 250 &&
  typeof b.weightKg === 'number' &&
  b.weightKg >= 25 &&
  b.weightKg <= 300

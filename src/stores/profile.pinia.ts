import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { getMyProfile, updateNotify, upsertMyProfile } from '@/api/health/profile.api'
import { setWeight } from '@/api/health/daylog.api'
import { apiErrorCode } from '@/utils/apiError'
import { todayBangkok } from '@/utils/date'
import type { Notify, ProfileUpsert, ProfileWithTargets } from '@/types/health.types'

// missing = login แล้วแต่ยังไม่ได้ตั้งเป้าหมาย ต้องไปหน้าตั้งเป้าก่อน
type Status = 'idle' | 'loading' | 'ready' | 'missing'

export const useProfileStore = defineStore('profile', () => {
  const data = ref<ProfileWithTargets | null>(null)
  const status = ref<Status>('idle')

  const profile = computed(() => data.value?.profile ?? null)
  const targets = computed(() => data.value?.targets ?? null)

  const load = async (force = false) => {
    if (!force && (status.value === 'ready' || status.value === 'missing')) return
    status.value = 'loading'
    try {
      data.value = await getMyProfile()
      status.value = 'ready'
    } catch (err) {
      if (apiErrorCode(err) === 'PROFILE_NOT_FOUND') {
        data.value = null
        status.value = 'missing'
        return
      }
      status.value = 'idle'
      throw err
    }
  }

  const save = async (payload: ProfileUpsert) => {
    const previousWeight = data.value?.profile.weightKg
    data.value = await upsertMyProfile(payload)
    status.value = 'ready'
    // น้ำหนักที่แก้จากหน้าตั้งเป้าหรือเครื่องคำนวณต้องลงกราฟด้วย ไม่งั้นกราฟกับโปรไฟล์ขัดกัน
    if (payload.weightKg !== previousWeight) await setWeight(todayBangkok(), payload.weightKg)
  }

  const setNotify = async (patch: Partial<Notify>) => {
    data.value = await updateNotify(patch)
  }

  const reset = () => {
    data.value = null
    status.value = 'idle'
  }

  return { data, status, profile, targets, load, save, setNotify, reset }
})

import { login, logout as postLogout, me, register } from '@/api/auth/auth.api'
import { useUserStore } from '@/stores/user.pinia'
import { useDayStore } from '@/stores/day.pinia'
import { useProfileStore } from '@/stores/profile.pinia'
import { runSessionLoadOnce, markSessionHydrated, resetSessionLoadState } from '@/utils/sessionLoadState'
import type { MeResponseBody, RegisterPayload } from '@/types/auth.types'
import type { AxiosError } from 'axios'

const applyMeUser = (body: MeResponseBody): void => {
  const u = body?.data?.user
  if (u) useUserStore().setUserProfile({ ...u })
}

/** หลัง refresh หน้า ยิง /auth/me ครั้งเดียว (ส่ง cookie refresh ได้แม้ไม่มี access ใน memory) */
export const hydrateSessionAfterRefresh = (): Promise<void> => {
  return runSessionLoadOnce(async () => {
    const store = useUserStore()
    try {
      const body = await me()
      if (body?.data?.user) applyMeUser(body)
    } catch (err) {
      if ((err as AxiosError).response?.status === 401) {
        store.clearSession()
        resetSessionLoadState()
      }
    }
  })
}

const completeLogin = async (): Promise<void> => {
  const meBody = await me()
  if (!meBody?.data?.user) throw new Error('LOGIN_ME_FAILED')
  applyMeUser(meBody)
  markSessionHydrated()
}

export const loginWithPassword = async (payload: { username: string; password: string }): Promise<void> => {
  try {
    await login(payload)
    await completeLogin()
  } catch (e) {
    useUserStore().clearSession()
    throw e
  }
}

/** สมัครสมาชิกแล้ว login ให้ทันที */
export const registerAndLogin = async (payload: RegisterPayload): Promise<void> => {
  try {
    await register(payload)
    await completeLogin()
  } catch (e) {
    useUserStore().clearSession()
    throw e
  }
}

/** หลัง Google callback: server set refresh cookie แล้ว ยิง /auth/me เพื่อรับ access token + โปรไฟล์ */
export const completeGoogleSession = async (): Promise<void> => {
  const store = useUserStore()
  store.setAccessToken(null)
  resetSessionLoadState()
  try {
    await completeLogin()
  } catch (e) {
    store.clearSession()
    throw e
  }
}

/** ลบ refresh cookie ฝั่ง server แล้วล้าง state ใน client รวมข้อมูลสุขภาพของคนก่อนหน้า */
export const performServerLogout = async (): Promise<void> => {
  try {
    await postLogout()
  } catch {
    // ยังล้าง client แม้เครือข่ายล้ม
  }
  useUserStore().logout()
  useDayStore().reset()
  useProfileStore().reset()
}

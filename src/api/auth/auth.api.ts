import axios from '../instance'
import type { LoginResponseBody, LogoutResponseBody, MeResponseBody, RegisterPayload } from '@/types/auth.types'

/** username หรืออีเมลก็ได้ */
export const login = async (payload: { username: string; password: string }) => {
  const { data } = await axios.post<LoginResponseBody>(`/auth/login`, payload)
  return data.data.accessToken
}

export const logout = async () => {
  const { data } = await axios.post<LogoutResponseBody>(`/auth/logout`)
  return data
}

export const me = async () => {
  const { data } = await axios.get<MeResponseBody>(`/auth/me`)
  return data
}

/** รหัสใหม่อย่างน้อย 8 ตัวอักษร (ตามเซิร์ฟเวอร์) */
export const changePassword = async (payload: { currentPassword: string; newPassword: string }) => {
  await axios.post(`/auth/change-password`, payload)
}

/** สร้างบัญชีสมาชิก + set refresh cookie (login ให้ทันที) */
export const register = async (payload: RegisterPayload) => {
  const { data } = await axios.post<LoginResponseBody>(`/auth/register`, payload)
  return data.data.accessToken
}

/** URL หน้า consent ของ Google (server set state cookie) */
export const getGoogleLoginUrl = async () => {
  const { data } = await axios.get<{ data: { url: string } }>(`/auth/google`)
  return data.data.url
}

/** ตอบเหมือนกันไม่ว่าอีเมลจะมีบัญชีหรือไม่ */
export const forgotPassword = async (email: string) => {
  await axios.post(`/auth/forgot-password`, { email })
}

/** token มาจากลิงก์ยืนยันในอีเมล ใช้ได้ภายใน 24 ชั่วโมง */
export const verifyEmail = async (token: string) => {
  await axios.post(`/auth/verify-email`, { token })
}

/** ส่งลิงก์ยืนยันไปที่อีเมลของบัญชีอีกครั้ง */
export const resendVerifyEmail = async () => {
  await axios.post(`/auth/verify-email/resend`)
}

/** token มาจากลิงก์ในอีเมล ใช้ได้ครั้งเดียว ภายใน 30 นาที */
export const resetPassword = async (token: string, newPassword: string) => {
  await axios.post(`/auth/reset-password`, { token, newPassword })
}

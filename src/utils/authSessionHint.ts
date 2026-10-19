/**
 * บอกว่าเคยมี session ในเบราว์เซอร์นี้ (หลัง login สำเร็จ)
 * ใช้ควบคุมว่าจะยิง /auth/me หรือไม่ — ไม่มีทางอ่าน httpOnly cookie จาก JS ได้
 */
const KEY = 'dulaedee_auth_session'

export const setAuthSessionHint = (): void => {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(KEY, '1')
  } catch {
    // quota / private mode
  }
}

export const clearAuthSessionHint = (): void => {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.removeItem(KEY)
  } catch {
    // ignore
  }
}

export const hasAuthSessionHint = (): boolean => {
  if (typeof localStorage === 'undefined') return false
  try {
    return localStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
}

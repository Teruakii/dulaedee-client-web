import axios from 'axios'

// code จาก dulaedee-service → ข้อความไทย
const KNOWN_API_MESSAGES: Record<string, string> = {
  INVALID_CREDENTIALS: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
  USERNAME_ALREADY_EXISTS: 'ชื่อผู้ใช้นี้ถูกใช้แล้ว',
  EMAIL_ALREADY_EXISTS: 'อีเมลนี้ถูกใช้แล้ว',
  RESET_TOKEN_INVALID: 'ลิงก์หมดอายุหรือถูกใช้ไปแล้ว ขอลิงก์ใหม่อีกครั้ง',
  ACCOUNT_NOT_FOUND: 'ไม่พบบัญชีนี้แล้ว',
  PUSH_NOT_CONFIGURED: 'เซิร์ฟเวอร์ยังไม่ได้ตั้งค่าการแจ้งเตือน',
  USER_NOT_FOUND: 'ไม่พบผู้ใช้',
  INVALID_USERNAME: 'ชื่อผู้ใช้ใช้ได้เฉพาะตัวอักษรอังกฤษ ตัวเลข จุด (.), ขีด (-) และ _',
  INVALID_REQUEST: 'ข้อมูลไม่ครบหรือไม่ถูกต้อง',
  INVALID_JSON: 'ข้อมูลไม่ถูกต้อง',
  GOOGLE_OAUTH_NOT_CONFIGURED: 'ระบบยังไม่ได้ตั้งค่าการเข้าสู่ระบบด้วย Google',
  GOOGLE_EMAIL_UNVERIFIED: 'อีเมล Google นี้ยังไม่ได้ยืนยัน',
  PROFILE_NOT_FOUND: 'ยังไม่ได้ตั้งเป้าหมาย',
  FOOD_NOT_FOUND: 'ไม่พบเมนูนี้',
  INVALID_FOOD_ID: 'ไม่พบเมนูนี้',
  WORKOUT_LOG_NOT_FOUND: 'รายการออกกำลังนี้ถูกลบไปแล้ว',
  ENTRY_NOT_FOUND: 'รายการนี้ถูกลบไปแล้ว',
  INVALID_DATE_RANGE: 'ช่วงวันที่ไม่ถูกต้อง',
  SKIN_PRODUCT_NOT_FOUND: 'ไม่พบผลิตภัณฑ์นี้',
  VERIFY_EMAIL_TOKEN_INVALID: 'ลิงก์ยืนยันไม่ถูกต้องหรือหมดอายุแล้ว',
  CANNOT_DELETE_SELF: 'ลบบัญชีของตัวเองจากหน้านี้ไม่ได้',
  CLIP_NOT_FOUND: 'ไม่พบคลิปนี้',
  GROUP_NOT_FOUND: 'ไม่พบกลุ่มนี้ หรือคุณไม่ได้อยู่ในกลุ่มแล้ว',
  INVITE_INVALID: 'ลิงก์ชวนนี้ใช้ไม่ได้แล้ว ขอลิงก์ใหม่จากเจ้าของกลุ่ม',
  GROUP_FULL: 'กลุ่มนี้เต็มแล้ว (20 คน)',
  GROUP_LIMIT_REACHED: 'อยู่ได้ไม่เกิน 10 กลุ่ม ออกจากกลุ่มเก่าก่อน',
  NOT_GROUP_OWNER: 'เฉพาะเจ้าของกลุ่มทำได้',
  OWNER_CANNOT_LEAVE: 'เจ้าของออกจากกลุ่มไม่ได้ ลบกลุ่มแทน',
  CLIP_ALREADY_EXISTS: 'มีคลิปนี้ในระบบแล้ว',
  WEATHER_UNAVAILABLE: 'ดึงข้อมูลอากาศไม่ได้',
  FORBIDDEN: 'ไม่มีสิทธิ์ทำรายการนี้',
  TOO_MANY_REQUESTS: 'ลองบ่อยเกินไป รอสักครู่แล้วลองใหม่',
  INTERNAL_SERVER_ERROR: 'ระบบขัดข้อง ลองใหม่อีกครั้ง',
}

export function getApiErrorMessage(err: unknown, fallback = 'เกิดข้อผิดพลาด'): string {
  if (axios.isAxiosError(err)) {
    if (!err.response) return 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้'
    const msg = (err.response.data as { message?: unknown } | undefined)?.message
    if (typeof msg === 'string' && msg.trim()) return KNOWN_API_MESSAGES[msg.trim()] ?? msg.trim()
  }
  if (err instanceof Error && err.message) return err.message
  return fallback
}

export const apiErrorCode = (err: unknown): string | undefined =>
  axios.isAxiosError(err) ? (err.response?.data as { message?: string } | undefined)?.message : undefined

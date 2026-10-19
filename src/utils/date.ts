import dayjs from 'dayjs'

// วันที่ของบันทึกเป็นเวลาไทยตาม backend (UTC+7 ไม่มี daylight saving)
export const todayBangkok = (now = new Date()): string => new Date(now.getTime() + 7 * 3600_000).toISOString().slice(0, 10)

/** จันทร์ 0 ถึง อาทิตย์ 6 ตรงกับ backend */
export const weekdayOf = (date: string): number => (new Date(`${date}T00:00:00Z`).getUTCDay() + 6) % 7

export const addDays = (date: string, n: number): string => dayjs(date).add(n, 'day').format('YYYY-MM-DD')

/** อังคาร 14 ตุลาคม */
export const longThaiDate = (date: string): string => dayjs(date).format('dddd D MMMM')

/** 14 ต.ค. */
export const shortThaiDate = (date: string): string => dayjs(date).format('D MMM')

/** อักษรย่อวัน จ อ พ พฤ ศ ส อา */
export const weekdayShort = (date: string): string => dayjs(date).format('dd')

export const greeting = (hour = new Date().getHours()): string =>
  hour < 11 ? 'สวัสดีตอนเช้า' : hour < 16 ? 'สวัสดีตอนบ่าย' : hour < 19 ? 'สวัสดีตอนเย็น' : 'สวัสดีตอนค่ำ'

export const formatNumber = (n: number): string => n.toLocaleString('th-TH')

export const formatDuration = (sec: number): string => {
  const m = Math.floor(sec / 60)
  const s = String(sec % 60).padStart(2, '0')
  return m >= 60 ? `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}:${s}` : `${m}:${s}`
}

export const daysBetween = (from: string, to: string): number => Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000)

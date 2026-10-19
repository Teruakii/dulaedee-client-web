import axios from '../instance'
import type { Weather } from '@/types/health.types'

/** ไม่ส่งพิกัด = กรุงเทพฯ · 503 เมื่อบริการอากาศล่ม (หน้าจอซ่อนการ์ด) */
export const getWeather = async (params: { lat?: number; lon?: number } = {}) =>
  (await axios.get<{ data: Weather }>(`/weather`, { params })).data.data

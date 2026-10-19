import { daysBetween } from './date'

export type WeightTrend = { perWeekKg: number; projectedKg: number; weeksAhead: number }

/**
 * เส้นตรงที่พอดีกับน้ำหนักที่ชั่ง (least squares) แล้วต่อไปข้างหน้า
 * ต้องชั่งอย่างน้อย 3 วัน ห่างกันอย่างน้อย 7 วัน ไม่งั้นแกว่งตามน้ำในตัวจนเชื่อไม่ได้
 */
export function weightTrend(points: { date: string; weightKg: number }[], today: string, weeksAhead = 4): WeightTrend | null {
  if (points.length < 3) return null
  const first = points[0]!.date
  const xs = points.map((p) => daysBetween(first, p.date))
  if (xs.at(-1)! < 7) return null
  const n = points.length
  const mx = xs.reduce((s, x) => s + x, 0) / n
  const my = points.reduce((s, p) => s + p.weightKg, 0) / n
  const sxx = xs.reduce((s, x) => s + (x - mx) ** 2, 0)
  const sxy = xs.reduce((s, x, i) => s + (x - mx) * (points[i]!.weightKg - my), 0)
  const slope = sxy / sxx
  const projectedKg = my + slope * (daysBetween(first, today) + weeksAhead * 7 - mx)
  return { perWeekKg: Math.round(slope * 7 * 10) / 10, projectedKg: Math.round(projectedKg * 10) / 10, weeksAhead }
}

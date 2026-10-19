import axios from '../instance'
import type { Clip, ClipUpsert, FoodTag, Paginated } from '@/types/health.types'

export const listClips = async (params: { foodId?: string; tag?: FoodTag; page?: number; limit?: number }) =>
  (await axios.get<Paginated<Clip>>(`/clips`, { params })).data

/** คลิปของเมนูที่ถูกแนะนำมาก่อน ไม่พอเติมด้วยคลิปล่าสุด */
export const recommendClips = async (foodIds: string[], limit = 4) =>
  (await axios.get<{ data: Clip[] }>(`/clips/recommend`, { params: { foodIds: foodIds.join(','), limit } })).data.data

export const createClip = async (payload: ClipUpsert) => (await axios.post<{ data: Clip }>(`/clips`, payload)).data.data

export const updateClip = async (id: string, payload: ClipUpsert) => (await axios.put<{ data: Clip }>(`/clips/${id}`, payload)).data.data

export const deleteClip = async (id: string) => {
  await axios.delete(`/clips/${id}`)
}

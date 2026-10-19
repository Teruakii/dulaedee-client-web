import axios from '../instance'
import type { Routine, SkinProduct, SkinProductUpsert, SkinSlot } from '@/types/health.types'

export const listProducts = async () => (await axios.get<{ data: SkinProduct[] }>(`/skin/products`)).data.data

export const createProduct = async (payload: SkinProductUpsert) =>
  (await axios.post<{ data: SkinProduct }>(`/skin/products`, payload)).data.data

export const updateProduct = async (id: string, payload: SkinProductUpsert) =>
  (await axios.put<{ data: SkinProduct }>(`/skin/products/${id}`, payload)).data.data

export const deleteProduct = async (id: string) => {
  await axios.delete(`/skin/products/${id}`)
}

/** ผลิตภัณฑ์ใน routine เรียงตามลำดับทา พร้อมคู่ส่วนผสมที่ชนกัน */
export const getRoutine = async (slot: SkinSlot) => (await axios.get<{ data: Routine }>(`/skin/routine/${slot}`)).data.data

export const reorderRoutine = async (slot: SkinSlot, productIds: string[]) =>
  (await axios.put<{ data: Routine }>(`/skin/routine/${slot}/order`, { productIds })).data.data

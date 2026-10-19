import axios from '../instance'
import type { Food, FoodTag, FoodUpsert, MyFoodCreate, Paginated } from '@/types/health.types'

export const listFoods = async (params: { q?: string; tag?: FoodTag; mine?: boolean; page?: number; limit?: number }) =>
  (await axios.get<Paginated<Food>>(`/foods`, { params })).data

/** เมนูที่พอดีงบที่เหลือ ยังขาดโปรตีนจะเรียงตามโปรตีนต่อแคลอรี่ */
export const recommendFoods = async (params: { remainingKcal: number; proteinGapG: number; limit?: number }) =>
  (await axios.get<{ data: Food[] }>(`/foods/recommend`, { params })).data.data

export const createFood = async (payload: FoodUpsert) => (await axios.post<{ data: Food }>(`/foods`, payload)).data.data

export const updateFood = async (id: string, payload: FoodUpsert) => (await axios.put<{ data: Food }>(`/foods/${id}`, payload)).data.data

export const deleteFood = async (id: string) => {
  await axios.delete(`/foods/${id}`)
}

export const createMyFood = async (payload: MyFoodCreate) => (await axios.post<{ data: Food }>(`/foods/mine`, payload)).data.data

export const deleteMyFood = async (id: string) => {
  await axios.delete(`/foods/mine/${id}`)
}

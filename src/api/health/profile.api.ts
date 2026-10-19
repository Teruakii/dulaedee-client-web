import axios from '../instance'
import type { CalcInput, Notify, ProfileUpsert, ProfileWithTargets, Targets } from '@/types/health.types'

/** 404 PROFILE_NOT_FOUND = ยังไม่ได้ตั้งเป้าหมาย */
export const getMyProfile = async () => (await axios.get<{ data: ProfileWithTargets }>(`/profile/me`)).data.data

export const upsertMyProfile = async (payload: ProfileUpsert) =>
  (await axios.put<{ data: ProfileWithTargets }>(`/profile/me`, payload)).data.data

export const updateNotify = async (payload: Partial<Notify>) =>
  (await axios.patch<{ data: ProfileWithTargets }>(`/profile/me/notify`, payload)).data.data

/** เครื่องคำนวณ ไม่ต้อง login */
export const calcTargets = async (payload: CalcInput) => (await axios.post<{ data: Targets }>(`/profile/calc`, payload)).data.data

import axios from '../instance'
import type { GroupDetail, GroupSummary, Habit, InvitePreview } from '@/types/health.types'

type GroupInput = { name: string; challenge: Habit }

export const listGroups = async () => (await axios.get<{ data: GroupSummary[] }>(`/groups`)).data.data

export const createGroup = async (payload: GroupInput) => (await axios.post<{ data: GroupSummary }>(`/groups`, payload)).data.data

/** กระดานของสัปดาห์ที่มีวันนี้ (จันทร์ถึงอาทิตย์) */
export const getGroup = async (id: string, date: string) => (await axios.get<{ data: GroupDetail }>(`/groups/${id}`, { params: { date } })).data.data

export const updateGroup = async (id: string, payload: GroupInput) => (await axios.put<{ data: GroupSummary }>(`/groups/${id}`, payload)).data.data

/** ลิงก์เดิมใช้ไม่ได้ทันที · เฉพาะเจ้าของกลุ่ม */
export const rotateInviteCode = async (id: string) => (await axios.post<{ data: { inviteCode: string } }>(`/groups/${id}/invite-code`)).data.data.inviteCode

export const previewInvite = async (code: string) => (await axios.get<{ data: InvitePreview }>(`/groups/invite/${encodeURIComponent(code)}`)).data.data

export const joinGroup = async (code: string) => (await axios.post<{ data: GroupSummary }>(`/groups/join`, { code })).data.data

/** ออกจากกลุ่มเอง (userId ของตัวเอง) หรือเจ้าของเอาคนอื่นออก */
export const removeMember = async (id: string, userId: string) => {
  await axios.delete(`/groups/${id}/members/${userId}`)
}

export const deleteGroup = async (id: string) => {
  await axios.delete(`/groups/${id}`)
}

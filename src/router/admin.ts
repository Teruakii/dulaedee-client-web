import type { RouteRecordRaw } from 'vue-router'
import { STAFF_ROLES } from '@/types/role.types'
import { page } from './page'

// หน้าของทีมโภชนาการ: ใช้ตารางของ Element Plus ตามโครงเดิม แค่รับโทเคนสีใหม่
const adminRoutes: RouteRecordRaw[] = [
  page('/admin/foods', 'admin-foods', 'ฐานเมนู', 'admin', () => import('@/views/admin/FoodsAdminView.vue'), STAFF_ROLES),
  page('/admin/clips', 'admin-clips', 'คลิปแนะนำ', 'admin', () => import('@/views/admin/ClipsAdminView.vue'), STAFF_ROLES),
]

export default adminRoutes

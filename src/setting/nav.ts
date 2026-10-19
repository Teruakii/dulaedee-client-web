import { Calculator, Dumbbell, House, Scale, Settings, Sparkles, UtensilsCrossed } from 'lucide-vue-next'
import type { Component } from 'vue'
import { STAFF_ROLES, type UserRole } from '@/types/role.types'
import type { RouteMeta } from 'vue-router'

// icon แสดงที่แถบลอยบนมือถือ
export type NavItem = { key: NonNullable<RouteMeta['nav']>; label: string; to: string; icon: Component; roles?: UserRole[] }

// เมนูหลักของสมาชิก · แถบลอยบนมือถือแสดงครบทุกอัน แทรกปุ่ม + ตรงกลาง
export const MAIN_NAV: NavItem[] = [
  { key: 'today', label: 'วันนี้', to: '/today', icon: House },
  { key: 'food', label: 'อาหาร', to: '/food', icon: UtensilsCrossed },
  { key: 'workout', label: 'ออกกำลัง', to: '/workout', icon: Dumbbell },
  { key: 'skin', label: 'ผิว', to: '/skin', icon: Sparkles },
  { key: 'body', label: 'ร่างกาย', to: '/body', icon: Scale },
  { key: 'calc', label: 'คำนวณ', to: '/calc', icon: Calculator },
]

export const STAFF_NAV: NavItem[] = [{ key: 'admin', label: 'จัดการ', to: '/admin/foods', icon: Settings, roles: STAFF_ROLES }]

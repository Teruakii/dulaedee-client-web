/// <reference types="vite/client" />

import 'vue-router'
import type { UserRole } from '@/types/role.types'

declare module 'vue-router' {
  interface RouteMeta {
    /** ถ้ากำหนด role ต้องอยู่ในรายการ (ไม่กำหนด = ทุก role ที่ login แล้ว) */
    roles?: UserRole[]
    /** หัวข้อแท็บ/หน้า */
    title?: string
    auth?: boolean
    /** เมนูที่ไฮไลต์ในแถบนำทาง */
    nav?: 'today' | 'food' | 'workout' | 'body' | 'skin' | 'calc' | 'profile' | 'admin'
  }
}

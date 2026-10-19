import type { RouteComponent, RouteMeta, RouteRecordRaw } from 'vue-router'
import type { UserRole } from '@/types/role.types'

type ViewLoader = () => Promise<{ default: RouteComponent }>

/** หน้าในแอปที่อยู่ใต้ MainLayout (แถบซ้าย + แถบล่าง) */
export const page = (
  path: string,
  name: string,
  title: string,
  nav: RouteMeta['nav'],
  view: ViewLoader,
  roles?: UserRole[],
): RouteRecordRaw => ({
  path,
  component: () => import('@/layouts/MainLayout.vue'),
  meta: { auth: true, roles },
  children: [{ path: '', name, component: view, meta: { title, nav } }],
})

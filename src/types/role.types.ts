/** Role จาก `/auth/me` ตรงกับ backend: ADMIN ผู้ดูแลระบบ | STAFF ทีมโภชนาการ | MEMBER ผู้ใช้แอป */
export type UserRole = 'ADMIN' | 'STAFF' | 'MEMBER'

export const USER_ROLES: UserRole[] = ['ADMIN', 'STAFF', 'MEMBER']

export const ALL_USER_ROLES: UserRole[] = ['ADMIN', 'STAFF', 'MEMBER']

/** ดูแลฐานเมนูและคัดคลิป */
export const STAFF_ROLES: UserRole[] = ['ADMIN', 'STAFF']

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'ผู้ดูแลระบบ',
  STAFF: 'ทีมโภชนาการ',
  MEMBER: 'สมาชิก',
}

export function normalizeUserRole(role: UserRole | undefined | null): UserRole {
  if (role && USER_ROLES.includes(role)) return role
  return 'MEMBER'
}

export function canAccessByRoles(allowed: UserRole[] | undefined, userRole: UserRole | undefined | null): boolean {
  if (!allowed?.length) return true
  return allowed.includes(normalizeUserRole(userRole))
}

import type { UserRole } from '@/types/role.types'

export interface AuthUser {
  id: string
  username: string
  firstName: string
  lastName: string
  email?: string
  emailVerified?: boolean
  role?: UserRole
  createdAt: string
  updatedAt: string
}

export interface RegisterPayload {
  username: string
  password: string
  email: string
  firstName: string
  lastName?: string
  acceptTerms: true
  acceptPrivacy: true
}

export interface LoginResponseBody {
  data: { accessToken: string }
}

export interface MeResponseBody {
  data: { user: AuthUser; accessToken?: string }
}

export const SESSION_INVALID_MESSAGE = 'SESSION_INVALID'

export interface LogoutResponseBody {
  code: number
  message: 'LOGOUT_SUCCESS' | string
}

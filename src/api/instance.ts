import axios, { type InternalAxiosRequestConfig } from 'axios'
import baseURL from '../config'
import { useUserStore } from '@/stores/user.pinia'
import { resetSessionLoadState } from '@/utils/sessionLoadState'
import { SESSION_INVALID_MESSAGE } from '@/types/auth.types'

const isAuthTokenResponse = (url: string): boolean =>
  url.includes('/auth/me') || url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/change-password')

const api = axios.create({
  baseURL,
  // 0 = ไม่จำกัดเวลา (คำขอช้าเช่น bulk import จะไม่โดน abort ที่ client)
  timeout: 0,
  withCredentials: true,
})

api.interceptors.request.use(
  (config) => {
    const token = useUserStore().accessToken
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

api.interceptors.response.use(
  (response) => {
    const url = String(response.config?.url ?? '')
    if (!isAuthTokenResponse(url)) return response

    const payload = response.data as { data?: { accessToken?: string } }
    const newToken = payload?.data?.accessToken
    if (newToken && typeof newToken === 'string') {
      useUserStore().setAccessToken(newToken)
    }
    return response
  },
  async (error) => {
    const url = String(error.config?.url ?? '')
    const skip401Clear =
      url.includes('/auth/login') || url.includes('/auth/logout') || url.includes('/auth/me')

    const original = error.config as (InternalAxiosRequestConfig & { retried?: boolean }) | undefined
    if (error.response?.status === 401 && !skip401Clear && original && !original.retried && useUserStore().accessToken) {
      original.retried = true
      if (await refreshAccess()) return api(original)
      useUserStore().clearSession()
      resetSessionLoadState()
      return Promise.reject(error)
    }

    if (error.response?.status === 401 && !skip401Clear) {
      const msg = (error.response?.data as { message?: string } | undefined)?.message
      if (msg === SESSION_INVALID_MESSAGE) {
        useUserStore().clearSession()
        resetSessionLoadState()
      }
    }
    return Promise.reject(error)
  },
)

// access token อายุ 15 นาที หมดแล้วขอใหม่ด้วย refresh cookie · หลายคำขอที่ 401 พร้อมกันรอการขอใหม่ครั้งเดียว
let refreshing: Promise<boolean> | null = null
const refreshAccess = (): Promise<boolean> =>
  (refreshing ??= api
    .get('/auth/me')
    .then(
      () => true,
      () => false,
    )
    .finally(() => {
      refreshing = null
    }))

export default api

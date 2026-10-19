import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AuthUser } from '@/types/auth.types'
import { clearAuthSessionHint, setAuthSessionHint } from '@/utils/authSessionHint'
import { resetSessionLoadState } from '@/utils/sessionLoadState'

export const useUserStore = defineStore('user', () => {
  const accessToken = ref<string | null>(null)
  const userProfile = ref<AuthUser | null>(null)
  const isAuthenticated = computed(() => !!userProfile.value)

  const displayName = computed(() => {
    const u = userProfile.value
    if (!u) return ''
    const name = [u.firstName, u.lastName].filter(Boolean).join(' ').trim()
    return name || u.username
  })

  const setAccessToken = (token: string | null) => {
    accessToken.value = token
  }

  const setUserProfile = (profile: AuthUser | null) => {
    userProfile.value = profile
    if (profile) {
      setAuthSessionHint()
    }
  }

  /** ล้าง session ทั้ง token + โปรไฟล์ */
  const clearSession = () => {
    accessToken.value = null
    userProfile.value = null
    clearAuthSessionHint()
  }

  const logout = () => {
    clearSession()
    resetSessionLoadState()
  }

  return {
    accessToken,
    userProfile,
    isAuthenticated,
    displayName,
    setAccessToken,
    setUserProfile,
    clearSession,
    logout,
  }
})

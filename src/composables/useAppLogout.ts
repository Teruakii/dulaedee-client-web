import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { performServerLogout } from '@/services/authSession'

export function useAppLogout() {
  const router = useRouter()
  const isLoggingOut = ref(false)

  const logoutAndGoLogin = async () => {
    if (isLoggingOut.value) return
    isLoggingOut.value = true
    try {
      await performServerLogout()
      await router.push({ name: 'login' })
    } finally {
      isLoggingOut.value = false
    }
  }

  return { logoutAndGoLogin, isLoggingOut }
}

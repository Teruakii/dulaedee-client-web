<template>
  <main class="grid min-h-screen place-items-center p-5 text-center">
    <div>
      <p class="text-lg font-semibold">{{ error || 'กำลังเข้าสู่ระบบ…' }}</p>
      <RouterLink v-if="error" to="/log-in" class="mt-4 inline-block font-semibold text-primary">กลับไปหน้าเข้าสู่ระบบ</RouterLink>
    </div>
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { completeGoogleSession } from '@/services/authSession'
import { takeAfterLogin } from '@/utils/afterLogin'
import { getApiErrorMessage } from '@/utils/apiError'

const router = useRouter()
const error = ref('')

// server set refresh cookie แล้ว ขอ access token ผ่าน /auth/me
onMounted(async () => {
  try {
    await completeGoogleSession()
    await router.replace(takeAfterLogin() ?? { name: 'today' })
  } catch (err) {
    error.value = getApiErrorMessage(err, 'เข้าสู่ระบบด้วย Google ไม่สำเร็จ')
  }
})
</script>

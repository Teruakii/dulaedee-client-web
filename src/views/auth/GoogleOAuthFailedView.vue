<template>
  <main class="grid min-h-screen place-items-center p-5 text-center">
    <div>
      <h1 class="text-xl font-semibold">เข้าสู่ระบบด้วย Google ไม่สำเร็จ</h1>
      <p class="mt-1 text-mute">{{ REASONS[reason] ?? 'ลองอีกครั้ง หรือเข้าสู่ระบบด้วยอีเมล' }}</p>
      <RouterLink to="/log-in" class="mt-4 inline-block font-semibold text-primary">กลับไปหน้าเข้าสู่ระบบ</RouterLink>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

// reason มาจาก backend ตอน redirect กลับ
const REASONS: Record<string, string> = {
  CANCELLED: 'คุณยกเลิกการเข้าสู่ระบบ',
  INVALID_STATE: 'หมดเวลาหรือเปิดจากหน้าอื่น ลองใหม่อีกครั้ง',
  GOOGLE_EMAIL_UNVERIFIED: 'อีเมล Google นี้ยังไม่ได้ยืนยัน',
  GOOGLE_OAUTH_NOT_CONFIGURED: 'ระบบยังไม่ได้ตั้งค่าการเข้าสู่ระบบด้วย Google',
}

const route = useRoute()
const reason = computed(() => String(route.query.reason ?? ''))
</script>

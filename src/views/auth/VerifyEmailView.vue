<template>
  <main class="flex min-h-screen items-center justify-center bg-bg p-5">
    <div class="w-full max-w-md">
      <RouterLink to="/log-in" class="mb-6 flex items-center gap-3"><MascotLeaf class="h-14 w-14" /><span class="font-display text-2xl">ดูแลดี<span class="text-melon">.</span></span></RouterLink>
      <h1 class="text-3xl">ยืนยันอีเมล</h1>
      <p v-if="state === 'busy'" class="mt-6 text-mute">กำลังยืนยัน…</p>
      <div v-else-if="state === 'done'" class="mt-6 rounded-3xl bg-mint p-5">
        <p class="font-semibold">ยืนยันอีเมลแล้ว</p>
        <RouterLink to="/today" class="btn-ink mt-4 inline-block">ไปหน้าวันนี้</RouterLink>
      </div>
      <div v-else class="mt-6 rounded-3xl bg-blush p-5">
        <p class="font-semibold text-melon">{{ error }}</p>
        <p class="mt-1 text-sm text-mute">ขอลิงก์ใหม่ได้ที่หน้าโปรไฟล์ ลิงก์ใช้ได้ 24 ชั่วโมง</p>
        <RouterLink to="/profile" class="btn-ink mt-4 inline-block">ไปหน้าโปรไฟล์</RouterLink>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { verifyEmail } from '@/api/auth/auth.api'
import MascotLeaf from '@/components/MascotLeaf.vue'
import { useUserStore } from '@/stores/user.pinia'
import { getApiErrorMessage } from '@/utils/apiError'

// เปิดจากลิงก์ในอีเมล · ไม่ต้อง login เพราะอาจเปิดจากเครื่องอื่น
const route = useRoute()
const userStore = useUserStore()
const state = ref<'busy' | 'done' | 'failed'>('busy')
const error = ref('')

onMounted(async () => {
  const token = typeof route.query.token === 'string' ? route.query.token : ''
  try {
    await verifyEmail(token)
    state.value = 'done'
    // login อยู่บนเครื่องนี้ด้วย ให้หน้าโปรไฟล์เลิกเตือนทันที
    if (userStore.userProfile) userStore.setUserProfile({ ...userStore.userProfile, emailVerified: true })
  } catch (err) {
    error.value = getApiErrorMessage(err)
    state.value = 'failed'
  }
})
</script>

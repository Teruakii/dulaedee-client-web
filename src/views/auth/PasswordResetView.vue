<template>
  <main class="flex min-h-screen items-center justify-center bg-bg p-5">
    <div class="w-full max-w-md">
      <RouterLink to="/log-in" class="mb-6 flex items-center gap-3"><MascotLeaf class="h-14 w-14" /><span class="font-display text-2xl">ดูแลดี<span class="text-melon">.</span></span></RouterLink>

      <template v-if="token">
        <h1 class="text-3xl">ตั้งรหัสผ่านใหม่</h1>
        <div v-if="done" class="mt-6 rounded-3xl bg-mint p-5">
          <p class="font-semibold">ตั้งรหัสผ่านใหม่แล้ว</p>
          <RouterLink to="/log-in" class="btn-ink mt-4 inline-block">เข้าสู่ระบบ</RouterLink>
        </div>
        <form v-else class="mt-6 space-y-4" @submit.prevent="reset">
          <label class="block"><span class="text-sm font-medium">รหัสผ่านใหม่ (อย่างน้อย 8 ตัว)</span><input v-model="password" type="password" class="field" autocomplete="new-password" required minlength="8" /></label>
          <label class="block"><span class="text-sm font-medium">พิมพ์รหัสผ่านใหม่อีกครั้ง</span><input v-model="confirm" type="password" class="field" autocomplete="new-password" required minlength="8" /></label>
          <p v-if="error" class="rounded-2xl bg-blush px-4 py-3 text-sm text-melon">{{ error }}</p>
          <button class="btn-ink w-full py-3.5" :disabled="busy">ตั้งรหัสผ่านใหม่</button>
        </form>
      </template>

      <template v-else>
        <h1 class="text-3xl">ลืมรหัสผ่าน</h1>
        <p class="mt-1 text-mute">กรอกอีเมลที่ใช้สมัคร เราจะส่งลิงก์ตั้งรหัสผ่านใหม่ไปให้ ลิงก์ใช้ได้ 30 นาที</p>
        <div v-if="done" class="mt-6 rounded-3xl bg-mint p-5">
          <p class="font-semibold">ถ้าอีเมลนี้มีบัญชีอยู่ ลิงก์จะส่งไปที่ {{ email }}</p>
          <p class="mt-1 text-sm text-mute">ไม่เห็นอีเมล ลองดูในกล่องจดหมายขยะ</p>
        </div>
        <form v-else class="mt-6 space-y-4" @submit.prevent="send">
          <label class="block"><span class="text-sm font-medium">อีเมล</span><input v-model="email" type="email" class="field" autocomplete="email" required /></label>
          <p v-if="error" class="rounded-2xl bg-blush px-4 py-3 text-sm text-melon">{{ error }}</p>
          <button class="btn-ink w-full py-3.5" :disabled="busy">ส่งลิงก์</button>
        </form>
      </template>

      <RouterLink to="/log-in" class="mt-6 inline-block text-sm font-semibold text-melon">← กลับไปเข้าสู่ระบบ</RouterLink>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { forgotPassword, resetPassword } from '@/api/auth/auth.api'
import MascotLeaf from '@/components/MascotLeaf.vue'
import { getApiErrorMessage } from '@/utils/apiError'

// หน้าเดียวสองขั้น: ไม่มี token = ขอลิงก์ · มี token จากลิงก์ในอีเมล = ตั้งรหัสใหม่
const route = useRoute()
const token = computed(() => (typeof route.query.token === 'string' ? route.query.token : ''))

const email = ref('')
const password = ref('')
const confirm = ref('')
const busy = ref(false)
const done = ref(false)
const error = ref('')

const run = async (fn: () => Promise<void>) => {
  busy.value = true
  error.value = ''
  try {
    await fn()
    done.value = true
  } catch (err) {
    error.value = getApiErrorMessage(err)
  } finally {
    busy.value = false
  }
}

const send = () => run(() => forgotPassword(email.value.trim()))
const reset = () => {
  if (password.value !== confirm.value) {
    error.value = 'รหัสผ่านสองช่องไม่ตรงกัน'
    return
  }
  return run(() => resetPassword(token.value, password.value))
}
</script>

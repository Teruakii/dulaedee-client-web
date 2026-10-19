<template>
  <main class="grid min-h-screen bg-bg lg:grid-cols-2">
    <div class="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-melon to-mango p-12 text-white lg:flex">
      <div class="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-white/15" aria-hidden="true" />
      <span class="font-display text-2xl">ดูแลดี.</span>
      <div>
        <MascotLeaf class="mb-6 h-28 w-28" />
        <h1 class="text-5xl leading-tight">กินดี ผิวดี<br />ในแอปเดียว</h1>
        <p class="mt-4 max-w-md text-lg text-white/80">นับแคลอรี่เมนูไทย แนะนำมื้อถัดไปตามงบที่เหลือ และติดตาม routine ผิวเช้าเย็น ใช้ฟรีทุกฟีเจอร์</p>
      </div>
      <div class="grid grid-cols-3 gap-3 text-sm">
        <div class="rotate-[-3deg] rounded-3xl bg-white/20 p-4"><div class="font-display text-2xl">604</div>kcal ที่เหลือ</div>
        <div class="rotate-2 rounded-3xl bg-white/20 p-4"><div class="font-display text-2xl">5/8</div>แก้วน้ำ</div>
        <div class="rotate-[-1deg] rounded-3xl bg-white/20 p-4"><div class="font-display text-2xl">3/4</div>ขั้นผิวเช้า</div>
      </div>
    </div>

    <div class="flex items-center justify-center p-5">
      <div class="w-full max-w-md">
        <div class="mb-6 flex items-center gap-3 lg:hidden"><MascotLeaf class="h-16 w-16" /><span class="font-display text-2xl">ดูแลดี<span class="text-melon">.</span></span></div>
        <h2 class="text-3xl">{{ isRegister ? 'สมัครใช้งาน' : 'เข้าสู่ระบบ' }}</h2>
        <p class="mt-1 text-mute">
          <template v-if="isRegister">มีบัญชีแล้ว? <RouterLink :to="{ name: 'login', query: route.query }" class="font-semibold text-melon">เข้าสู่ระบบ</RouterLink></template>
          <template v-else>ยังไม่มีบัญชี? <RouterLink :to="{ name: 'register', query: route.query }" class="font-semibold text-melon">สมัครใช้งาน</RouterLink></template>
        </p>

        <form class="mt-8 space-y-4" @submit.prevent="submit">
          <template v-if="isRegister">
            <label class="block"><span class="text-sm font-medium">ชื่อเล่นหรือชื่อจริง</span><input v-model="reg.firstName" class="field" autocomplete="given-name" required /></label>
            <label class="block"><span class="text-sm font-medium">ชื่อผู้ใช้ (ตัวอักษรอังกฤษ ตัวเลข . _ -)</span><input v-model="reg.username" class="field" autocomplete="username" required minlength="3" /></label>
            <label class="block"><span class="text-sm font-medium">อีเมล</span><input v-model="reg.email" type="email" class="field" autocomplete="email" required /></label>
            <label class="block"><span class="text-sm font-medium">รหัสผ่าน (อย่างน้อย 8 ตัว)</span><input v-model="reg.password" type="password" class="field" autocomplete="new-password" required minlength="8" /></label>
            <label class="flex items-start gap-3 text-sm">
              <input v-model="reg.accept" type="checkbox" class="mt-1 h-4 w-4 accent-melon" required />
              <span>ยอมรับ<RouterLink :to="{ name: 'terms' }" class="font-semibold text-melon underline" target="_blank">ข้อกำหนดการใช้งาน</RouterLink>และ<RouterLink :to="{ name: 'privacy' }" class="font-semibold text-melon underline" target="_blank">นโยบายความเป็นส่วนตัว</RouterLink> รวมถึงยินยอมให้เก็บข้อมูลสุขภาพที่ฉันบันทึก</span>
            </label>
          </template>
          <template v-else>
            <label class="block"><span class="text-sm font-medium">อีเมลหรือชื่อผู้ใช้</span><input v-model="cred.username" class="field" autocomplete="username" required /></label>
            <label class="block"><span class="text-sm font-medium">รหัสผ่าน</span><input v-model="cred.password" type="password" class="field" autocomplete="current-password" required /></label>
            <RouterLink :to="{ name: 'forgot-password' }" class="block text-right text-sm font-semibold text-melon">ลืมรหัสผ่าน?</RouterLink>
          </template>
          <p v-if="error" class="rounded-2xl bg-blush px-4 py-3 text-sm text-melon">{{ error }}</p>
          <button class="btn-ink w-full py-3.5" :disabled="busy">
            {{ isRegister ? 'สมัครและเริ่มใช้งาน' : 'เข้าสู่ระบบ' }}
          </button>
        </form>

        <div class="my-6 flex items-center gap-3 text-sm text-mute"><span class="h-px flex-1 bg-line" />หรือ<span class="h-px flex-1 bg-line" /></div>
        <button class="btn-soft w-full py-3.5" :disabled="busy" @click="google">ดำเนินการต่อด้วย Google</button>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getGoogleLoginUrl } from '@/api/auth/auth.api'
import MascotLeaf from '@/components/MascotLeaf.vue'
import { loginWithPassword, registerAndLogin } from '@/services/authSession'
import { rememberAfterLogin, safeRedirect } from '@/utils/afterLogin'
import { getApiErrorMessage } from '@/utils/apiError'

const route = useRoute()
const router = useRouter()

const isRegister = computed(() => route.name === 'register')
const cred = reactive({ username: '', password: '' })
const reg = reactive({ firstName: '', username: '', email: '', password: '', accept: false })
const busy = ref(false)
const error = ref('')

// กลับไปหน้าที่ตั้งใจจะเปิด เฉพาะ path ภายในแอป
const redirectTarget = () => safeRedirect(route.query.redirect) ?? '/today'

const submit = async () => {
  busy.value = true
  error.value = ''
  try {
    if (isRegister.value) {
      await registerAndLogin({
        firstName: reg.firstName.trim(),
        username: reg.username.trim(),
        email: reg.email.trim(),
        password: reg.password,
        acceptTerms: true,
        acceptPrivacy: true,
      })
      // บัญชีใหม่ยังไม่มีข้อมูลร่างกาย · ตั้งเสร็จแล้วค่อยไปหน้าที่ตั้งใจมา (เช่น ลิงก์ชวนเข้ากลุ่ม)
      const redirect = safeRedirect(route.query.redirect)
      await router.replace({ name: 'onboarding', query: redirect ? { redirect } : {} })
    } else {
      await loginWithPassword({ username: cred.username.trim(), password: cred.password })
      await router.replace(redirectTarget())
    }
  } catch (err) {
    error.value = getApiErrorMessage(err)
  } finally {
    busy.value = false
  }
}

const google = async () => {
  busy.value = true
  error.value = ''
  try {
    rememberAfterLogin(safeRedirect(route.query.redirect))
    window.location.href = await getGoogleLoginUrl()
  } catch (err) {
    error.value = getApiErrorMessage(err)
    busy.value = false
  }
}
</script>


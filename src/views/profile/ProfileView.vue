<template>
  <div class="mx-auto max-w-3xl">
    <div class="flex items-center gap-4 rounded-[2.5rem] bg-gradient-to-br from-melon to-mango p-6 text-white">
      <UserAvatar :name="userStore.displayName" size="lg" />
      <div class="min-w-0 flex-1">
        <h1 class="text-2xl">{{ userStore.displayName }}</h1>
        <p class="truncate text-white/85">{{ user?.email ?? user?.username }}</p>
      </div>
      <span v-if="user?.role && user.role !== 'MEMBER'" class="rounded-full bg-white/25 px-3 py-1 text-sm">{{ ROLE_LABELS[user.role] }}</span>
    </div>

    <h2 class="mb-2 mt-8 px-2 text-lg">ร่างกายและเป้าหมาย</h2>
    <div class="divide-y divide-line rounded-[2rem] bg-surface">
      <RouterLink v-for="row in bodyRows" :key="row.label" to="/onboarding" class="flex items-center justify-between gap-4 px-6 py-4">
        <span>{{ row.label }}</span><span class="truncate text-mute">{{ row.value }} ›</span>
      </RouterLink>
    </div>

    <h2 class="mb-2 mt-8 px-2 text-lg">การแจ้งเตือน</h2>
    <div class="divide-y divide-line rounded-[2rem] bg-surface">
      <div class="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
        <span>
          แจ้งเตือนบนเครื่องนี้
          <span class="block text-sm" :class="push === 'on' ? 'text-lime' : 'text-mute'">{{ PUSH_TEXT[push] }}</span>
        </span>
        <span class="flex gap-2">
          <button v-if="push === 'on'" class="btn-soft text-sm" :disabled="pushBusy" @click="testPush">ทดสอบ</button>
          <button v-if="push === 'off'" class="btn-ink text-sm" :disabled="pushBusy" @click="turnOnPush">เปิด</button>
          <button v-if="push === 'on'" class="btn-soft text-sm" :disabled="pushBusy" @click="turnOffPush">ปิด</button>
        </span>
      </div>
      <label v-for="n in NOTIFY_ROWS" :key="n.key" class="flex items-center justify-between gap-4 px-6 py-4">
        <span>{{ n.label }}</span>
        <el-switch :model-value="profile?.notify[n.key] ?? false" :disabled="!profile" @change="(v: string | number | boolean) => setNotify(n.key, Boolean(v))" />
      </label>
    </div>

    <h2 class="mb-2 mt-8 px-2 text-lg">บัญชี</h2>
    <div class="divide-y divide-line rounded-[2rem] bg-surface">
      <div v-if="user?.email && !user.emailVerified" class="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
        <span>ยังไม่ได้ยืนยันอีเมล <span class="block text-sm text-mute">กดลิงก์ที่ส่งไปที่ {{ user.email }}</span></span>
        <button class="btn-soft text-sm" :disabled="verifySending" @click="resendVerify">ส่งลิงก์อีกครั้ง</button>
      </div>
      <RouterLink to="/body" class="flex items-center justify-between px-6 py-4"><span>น้ำหนักและร่างกาย</span><span class="text-mute">›</span></RouterLink>
      <RouterLink to="/calc" class="flex items-center justify-between px-6 py-4"><span>เครื่องคำนวณแคลอรี่</span><span class="text-mute">›</span></RouterLink>
      <RouterLink to="/summary" class="flex items-center justify-between px-6 py-4"><span>สรุปและเหรียญ</span><span class="text-mute">›</span></RouterLink>
      <RouterLink to="/groups" class="flex items-center justify-between px-6 py-4"><span>กลุ่มของฉัน</span><span class="text-mute">›</span></RouterLink>
      <RouterLink v-if="isStaff" to="/admin/foods" class="flex items-center justify-between px-6 py-4"><span>จัดการเมนูและคลิป</span><span class="text-mute">›</span></RouterLink>
      <button class="flex w-full items-center justify-between px-6 py-4 text-left" @click="passwordOpen = true"><span>เปลี่ยนรหัสผ่าน</span><span class="text-mute">›</span></button>
      <RouterLink :to="{ name: 'privacy' }" class="flex items-center justify-between px-6 py-4"><span>นโยบายความเป็นส่วนตัวและข้อกำหนด</span><span class="text-mute">›</span></RouterLink>
      <button class="flex w-full items-center justify-between px-6 py-4 text-left text-melon" :disabled="isLoggingOut" @click="logoutAndGoLogin">
        <span>ออกจากระบบ</span><span>›</span>
      </button>
    </div>

    <h2 class="mb-2 mt-8 px-2 text-lg">ข้อมูลของฉัน</h2>
    <div class="divide-y divide-line rounded-[2rem] bg-surface">
      <button class="flex w-full items-center justify-between px-6 py-4 text-left text-melon" @click="deleteOpen = true">
        <span>ลบบัญชี <span class="block text-sm text-mute">ลบข้อมูลและรูปทั้งหมด ย้อนกลับไม่ได้</span></span><span>›</span>
      </button>
    </div>
  </div>

  <el-dialog v-model="deleteOpen" title="ลบบัญชีถาวร" width="min(440px, 92vw)">
    <p>ข้อมูลทั้งหมดจะถูกลบทันที ทั้งบันทึกอาหาร น้ำ น้ำหนัก routine ผิว และตารางออกกำลัง กู้คืนไม่ได้</p>
    <label class="mt-4 block">
      <span class="text-sm font-medium">พิมพ์คำว่า <b>{{ DELETE_WORD }}</b> เพื่อยืนยัน</span>
      <input v-model="deleteWord" class="field" autocomplete="off" />
    </label>
    <button class="mt-4 w-full rounded-full bg-melon py-3 font-semibold text-white disabled:opacity-50" :disabled="deleting || deleteWord.trim() !== DELETE_WORD" @click="removeAccount">
      ลบบัญชีของฉัน
    </button>
  </el-dialog>

  <el-dialog v-model="passwordOpen" title="เปลี่ยนรหัสผ่าน" width="min(420px, 92vw)">
    <el-form label-position="top" @submit.prevent="savePassword">
      <el-form-item label="รหัสผ่านปัจจุบัน"><el-input v-model="pw.currentPassword" type="password" show-password autocomplete="current-password" /></el-form-item>
      <el-form-item label="รหัสผ่านใหม่ (อย่างน้อย 8 ตัว)"><el-input v-model="pw.newPassword" type="password" show-password autocomplete="new-password" /></el-form-item>
      <button type="submit" class="btn-ink w-full" :disabled="saving || !pw.currentPassword || pw.newPassword.length < 8">บันทึก</button>
    </el-form>
    <p class="mt-4 text-sm text-mute">
      สมัครด้วย Google หรือจำรหัสผ่านเดิมไม่ได้?
      <RouterLink :to="{ name: 'forgot-password' }" class="font-semibold text-melon" @click="passwordOpen = false">ตั้งรหัสผ่านผ่านอีเมล</RouterLink>
    </p>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { changePassword, resendVerifyEmail } from '@/api/auth/auth.api'
import { deleteAccount } from '@/api/health/account.api'
import { disablePush, enablePush, pushState, sendTestPush, type PushState } from '@/services/push'
import UserAvatar from '@/components/UserAvatar.vue'
import { useAppLogout } from '@/composables/useAppLogout'
import { useProfileStore } from '@/stores/profile.pinia'
import { useUserStore } from '@/stores/user.pinia'
import { canAccessByRoles, ROLE_LABELS, STAFF_ROLES } from '@/types/role.types'
import { useMessage } from '@/use/useMessage'
import { getApiErrorMessage } from '@/utils/apiError'
import { formatNumber } from '@/utils/date'
import { GOAL_LABELS, SKIN_CONCERN_LABELS, SKIN_TYPE_LABELS } from '@/utils/labels'
import type { Notify } from '@/types/health.types'

const NOTIFY_ROWS: { key: keyof Notify; label: string }[] = [
  { key: 'water', label: 'เตือนดื่มน้ำทุก 2 ชั่วโมง' },
  { key: 'uv', label: 'เตือนทากันแดดเมื่อ UV สูง' },
  { key: 'skinRoutine', label: 'เตือน routine ก่อนนอน 22:00' },
]

const userStore = useUserStore()
const profileStore = useProfileStore()
const { logoutAndGoLogin, isLoggingOut } = useAppLogout()
const DELETE_WORD = 'ลบบัญชี'
const { showError, showSuccess } = useMessage()

const user = computed(() => userStore.userProfile)
const profile = computed(() => profileStore.profile)
const isStaff = computed(() => canAccessByRoles(STAFF_ROLES, user.value?.role))

const bodyRows = computed(() => {
  const p = profile.value
  const t = profileStore.targets
  if (!p || !t) return [{ label: 'ข้อมูลร่างกาย', value: 'ยังไม่ได้ตั้ง' }]
  const skin = [p.skinType && SKIN_TYPE_LABELS[p.skinType], ...p.skinConcerns.map((c) => SKIN_CONCERN_LABELS[c])].filter(Boolean).join(' · ')
  return [
    { label: 'เป้าหมาย', value: GOAL_LABELS[p.goal].label },
    { label: 'อายุ · ส่วนสูง · น้ำหนัก', value: `${p.age} · ${p.heightCm} · ${p.weightKg}` },
    { label: 'งบแคลอรี่ต่อวัน', value: `${formatNumber(t.kcal)} kcal` },
    { label: 'สภาพผิว', value: skin || 'ยังไม่ได้ระบุ' },
  ]
})

const setNotify = async (key: keyof Notify, value: boolean) => {
  try {
    await profileStore.setNotify({ [key]: value })
    // เปิดการเตือนแต่เครื่องนี้ยังไม่ได้อนุญาต ขออนุญาตเลย
    if (value && push.value === 'off') await turnOnPush()
  } catch (err) {
    showError(getApiErrorMessage(err))
  }
}

const passwordOpen = ref(false)
const saving = ref(false)
const pw = reactive({ currentPassword: '', newPassword: '' })
const savePassword = async () => {
  saving.value = true
  try {
    await changePassword(pw)
    Object.assign(pw, { currentPassword: '', newPassword: '' })
    passwordOpen.value = false
    showSuccess('เปลี่ยนรหัสผ่านแล้ว')
  } catch (err) {
    showError(getApiErrorMessage(err))
  } finally {
    saving.value = false
  }
}

const verifySending = ref(false)
const resendVerify = async () => {
  verifySending.value = true
  try {
    await resendVerifyEmail()
    showSuccess('ส่งลิงก์ยืนยันแล้ว ดูที่กล่องอีเมล')
  } catch (err) {
    showError(getApiErrorMessage(err))
  } finally {
    verifySending.value = false
  }
}

const deleteOpen = ref(false)
const deleteWord = ref('')
const deleting = ref(false)
const removeAccount = async () => {
  deleting.value = true
  try {
    await deleteAccount(deleteWord.value.trim())
    deleteOpen.value = false
    showSuccess('ลบบัญชีแล้ว')
    await logoutAndGoLogin()
  } catch (err) {
    showError(getApiErrorMessage(err))
  } finally {
    deleting.value = false
  }
}

const PUSH_TEXT: Record<PushState, string> = {
  on: 'เปิดอยู่ จะเตือนตามที่เลือกด้านล่าง',
  off: 'ยังไม่ได้เปิด กดเปิดแล้วอนุญาตในเบราว์เซอร์',
  blocked: 'เบราว์เซอร์บล็อกไว้ เปิดได้ที่ตั้งค่าเว็บไซต์ของเบราว์เซอร์',
  unsupported: 'เบราว์เซอร์นี้ไม่รองรับ (บน iPhone ต้องเพิ่มแอปลงหน้าจอโฮมก่อน)',
}
const push = ref<PushState>('off')
const pushBusy = ref(false)
const pushRun = async (fn: () => Promise<void>) => {
  pushBusy.value = true
  try {
    await fn()
  } catch (err) {
    showError(getApiErrorMessage(err))
  } finally {
    pushBusy.value = false
  }
}
const turnOnPush = () => pushRun(async () => {
  push.value = await enablePush()
  if (push.value === 'on') showSuccess('เปิดการแจ้งเตือนแล้ว')
})
const turnOffPush = () => pushRun(async () => {
  push.value = await disablePush()
})
const testPush = () => pushRun(async () => {
  const n = await sendTestPush()
  if (n) showSuccess('ส่งแล้ว ดูการแจ้งเตือนของเครื่อง')
  else showError('ส่งไม่ถึงเครื่องไหนเลย ลองปิดแล้วเปิดใหม่')
})
onMounted(async () => {
  push.value = await pushState().catch((): PushState => 'unsupported')
})
</script>

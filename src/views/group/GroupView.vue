<template>
  <RouterLink to="/groups" class="text-sm font-semibold text-mute">← กลุ่มของฉัน</RouterLink>

  <EmptyState v-if="loadError" class="mt-4" title="เปิดกลุ่มนี้ไม่ได้" :text="loadError">
    <RouterLink to="/groups" class="btn-soft">กลับไปกลุ่มของฉัน</RouterLink>
  </EmptyState>
  <div v-else-if="!group" class="mt-4 h-96 animate-pulse rounded-[2.5rem] bg-surface" />

  <template v-else>
    <header class="mt-2 flex flex-wrap items-center gap-3">
      <h1 class="mr-auto text-3xl">{{ group.name }}</h1>
      <button v-if="group.isOwner" class="btn-soft text-sm" @click="openSettings">ตั้งค่ากลุ่ม</button>
    </header>
    <p class="mt-1 text-mute">
      {{ HABIT_LABELS[group.challenge].emoji }} {{ HABIT_LABELS[group.challenge].name }} · {{ HABIT_LABELS[group.challenge].done }} · สัปดาห์ {{ shortThaiDate(group.week.from) }} ถึง {{ shortThaiDate(group.week.to) }}
    </p>

    <div class="mt-6 grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3">
      <section class="card lg:col-span-2">
        <ol class="space-y-3">
          <li v-for="(r, i) in group.board" :key="r.userId" class="flex items-center gap-3 rounded-3xl p-3" :class="r.isMe ? 'bg-peach' : 'bg-bg'">
            <span class="w-6 text-center font-display text-lg" :class="i === 0 && r.count ? 'text-melon' : 'text-mute'">{{ i === 0 && r.count ? '👑' : i + 1 }}</span>
            <div class="min-w-0 flex-1">
              <p class="truncate font-medium">{{ r.firstName }}{{ r.isMe ? ' (คุณ)' : '' }}{{ r.isOwner ? ' · เจ้าของ' : '' }}</p>
              <div class="mt-1.5 flex gap-1" :aria-label="`ทำครบ ${r.count} จาก 7 วัน`">
                <span
                  v-for="(done, d) in r.days"
                  :key="d"
                  class="grid h-6 flex-1 place-items-center rounded-full text-[10px]"
                  :class="done ? 'bg-lime text-white' : weekDates[d]! > today ? 'bg-surface text-mute/50' : 'bg-surface text-mute'"
                  >{{ weekdayShort(weekDates[d]!) }}</span
                >
              </div>
            </div>
            <span class="font-display text-xl">{{ r.count }}<span class="text-sm text-mute">/7</span></span>
            <button
              v-if="group.isOwner && !r.isMe"
              class="grid h-8 w-8 place-items-center rounded-full text-mute hover:bg-surface hover:text-melon"
              :aria-label="`เอา ${r.firstName} ออกจากกลุ่ม`"
              @click="kick(r)"
            >
              <X class="h-4 w-4" />
            </button>
          </li>
        </ol>
      </section>

      <div class="space-y-4 md:space-y-6">
        <section class="lift card bg-mint">
          <h2 class="text-lg">ชวนเพื่อน</h2>
          <p class="mt-1 text-sm">ใครมีลิงก์นี้เข้ากลุ่มได้ ส่งให้เฉพาะคนที่ชวน · {{ group.memberCount }}/{{ MAX_MEMBERS }} คน</p>
          <p class="mt-3 break-all rounded-2xl bg-white p-3 text-sm">{{ inviteUrl }}</p>
          <div class="mt-3 flex flex-wrap gap-2">
            <button class="btn-ink text-sm" @click="share">{{ canShare ? 'แชร์ลิงก์' : 'คัดลอกลิงก์' }}</button>
            <button v-if="group.isOwner" class="btn-soft text-sm" :disabled="busy" @click="rotate">เปลี่ยนลิงก์ใหม่</button>
          </div>
        </section>
        <p class="rounded-3xl bg-surface p-4 text-sm text-mute">{{ PRIVACY_NOTE }}</p>
        <button v-if="!group.isOwner" class="w-full rounded-full px-4 py-3 font-semibold text-melon hover:bg-blush" :disabled="busy" @click="leave">ออกจากกลุ่ม</button>
      </div>
    </div>
  </template>

  <el-dialog v-model="settingsOpen" title="ตั้งค่ากลุ่ม" width="min(460px, 92vw)">
    <form class="space-y-4" @submit.prevent="saveSettings">
      <label class="block"><span class="text-sm font-medium">ชื่อกลุ่ม</span><input v-model="form.name" class="field" maxlength="40" required /></label>
      <HabitPicker v-model="form.challenge" />
      <button class="btn-ink w-full" :disabled="busy || !form.name.trim()">บันทึก</button>
    </form>
    <button class="mt-4 w-full rounded-full px-4 py-3 font-semibold text-melon hover:bg-blush" :disabled="busy" @click="remove">ลบกลุ่มนี้</button>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { X } from 'lucide-vue-next'
import { deleteGroup, getGroup, removeMember, rotateInviteCode, updateGroup } from '@/api/health/group.api'
import HabitPicker from '@/components/health/HabitPicker.vue'
import EmptyState from '@/components/page/EmptyState.vue'
import { useMessage } from '@/use/useMessage'
import { getApiErrorMessage } from '@/utils/apiError'
import { addDays, shortThaiDate, todayBangkok, weekdayShort } from '@/utils/date'
import { HABIT_LABELS, PRIVACY_NOTE } from '@/utils/labels'
import type { BoardRow, GroupDetail, Habit } from '@/types/health.types'

// ตรงกับ backend
const MAX_MEMBERS = 20

const route = useRoute()
const router = useRouter()
const { showError, showSuccess } = useMessage()
const today = todayBangkok()
const id = computed(() => String(route.params.id))

const group = ref<GroupDetail | null>(null)
const loadError = ref('')
const busy = ref(false)

const weekDates = computed(() => Array.from({ length: 7 }, (_, i) => addDays(group.value!.week.from, i)))
const inviteUrl = computed(() => `${window.location.origin}/join/${group.value?.inviteCode ?? ''}`)
const canShare = typeof navigator !== 'undefined' && 'share' in navigator

const load = async () => {
  try {
    group.value = await getGroup(id.value, today)
  } catch (err) {
    loadError.value = getApiErrorMessage(err)
  }
}

// ทุกคำสั่งแก้ไข: ทำแล้วโหลดกระดานใหม่ · ผิดพลาดแสดงข้อความ
const run = async (fn: () => Promise<unknown>, done?: string) => {
  busy.value = true
  try {
    await fn()
    if (done) showSuccess(done)
    return true
  } catch (err) {
    showError(getApiErrorMessage(err))
    return false
  } finally {
    busy.value = false
  }
}

const confirm = async (text: string, title: string, ok: string) => {
  try {
    await ElMessageBox.confirm(text, title, { confirmButtonText: ok, cancelButtonText: 'ยกเลิก', type: 'warning' })
    return true
  } catch {
    return false
  }
}

const share = async () => {
  const text = `มาแข่ง${HABIT_LABELS[group.value!.challenge].name}กันในกลุ่ม ${group.value!.name} บนดูแลดี`
  if (canShare) {
    // ผู้ใช้กดปิดหน้าแชร์ ไม่ต้องแจ้ง error
    await navigator.share({ title: 'ดูแลดี', text, url: inviteUrl.value }).catch(() => undefined)
    return
  }
  try {
    await navigator.clipboard.writeText(inviteUrl.value)
    showSuccess('คัดลอกลิงก์แล้ว')
  } catch {
    showError('คัดลอกไม่ได้ ลองกดค้างที่ลิงก์แล้วคัดลอกเอง')
  }
}

const rotate = async () => {
  if (!(await confirm('ลิงก์เดิมจะใช้ไม่ได้ทันที คนที่อยู่ในกลุ่มแล้วไม่หลุด', 'เปลี่ยนลิงก์ชวน', 'เปลี่ยน'))) return
  await run(async () => {
    group.value!.inviteCode = await rotateInviteCode(id.value)
  }, 'เปลี่ยนลิงก์แล้ว')
}

const kick = async (r: BoardRow) => {
  if (!(await confirm(`เอา ${r.firstName} ออกจากกลุ่ม? ถ้ายังมีลิงก์อยู่จะกลับเข้ามาได้ ควรเปลี่ยนลิงก์ใหม่ด้วย`, 'เอาออกจากกลุ่ม', 'เอาออก'))) return
  if (await run(() => removeMember(id.value, r.userId), `เอา ${r.firstName} ออกแล้ว`)) await load()
}

const leave = async () => {
  if (!(await confirm('ชื่อของคุณจะหายจากกระดานของกลุ่มนี้', 'ออกจากกลุ่ม', 'ออก'))) return
  const me = group.value!.board.find((r) => r.isMe)!.userId
  if (await run(() => removeMember(id.value, me), 'ออกจากกลุ่มแล้ว')) router.replace('/groups')
}

const settingsOpen = ref(false)
const form = reactive<{ name: string; challenge: Habit }>({ name: '', challenge: 'log' })
const openSettings = () => {
  Object.assign(form, { name: group.value!.name, challenge: group.value!.challenge })
  settingsOpen.value = true
}
const saveSettings = async () => {
  if (await run(() => updateGroup(id.value, { name: form.name.trim(), challenge: form.challenge }), 'บันทึกแล้ว')) {
    settingsOpen.value = false
    await load()
  }
}

const remove = async () => {
  if (!(await confirm(`ลบกลุ่ม ${group.value!.name}? สมาชิกทุกคนจะออกจากกลุ่ม บันทึกสุขภาพของแต่ละคนยังอยู่ครบ`, 'ลบกลุ่ม', 'ลบ'))) return
  if (await run(() => deleteGroup(id.value), 'ลบกลุ่มแล้ว')) router.replace('/groups')
}

onMounted(load)
</script>

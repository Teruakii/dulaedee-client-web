<template>
  <h1 class="text-3xl">กลุ่มของฉัน</h1>
  <p class="mt-1 text-mute">แข่งกันทำให้ครบในแต่ละสัปดาห์ (จันทร์ถึงอาทิตย์) กับเพื่อนหรือครอบครัว</p>

  <div class="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
    <div class="space-y-3">
      <div v-if="loading" class="h-24 animate-pulse rounded-[2rem] bg-surface" />
      <EmptyState v-else-if="!groups.length" title="ยังไม่มีกลุ่ม" text="สร้างกลุ่มแล้วส่งลิงก์ชวนให้เพื่อน หรือกดลิงก์ที่เพื่อนส่งมา" />
      <RouterLink
        v-for="g in groups"
        :key="g.id"
        :to="{ name: 'group', params: { id: g.id } }"
        class="lift flex items-center gap-4 rounded-[2rem] bg-surface p-5 soft-shadow"
      >
        <span class="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-mint text-3xl" aria-hidden="true">{{ HABIT_LABELS[g.challenge].emoji }}</span>
        <div class="min-w-0 flex-1">
          <p class="truncate font-display text-lg">{{ g.name }}</p>
          <p class="text-sm text-mute">{{ HABIT_LABELS[g.challenge].name }} · {{ g.memberCount }} คน{{ g.isOwner ? ' · เจ้าของกลุ่ม' : '' }}</p>
        </div>
        <span class="text-mute" aria-hidden="true">›</span>
      </RouterLink>
    </div>

    <form class="card space-y-4" @submit.prevent="create">
      <h2 class="text-xl">สร้างกลุ่มใหม่</h2>
      <label class="block"><span class="text-sm font-medium">ชื่อกลุ่ม</span><input v-model="name" class="field" maxlength="40" placeholder="เช่น บ้านเรา, ทีมออฟฟิศ" required /></label>
      <HabitPicker v-model="challenge" />
      <p class="rounded-2xl bg-bg p-4 text-sm text-mute">{{ PRIVACY_NOTE }}</p>
      <button class="btn-ink w-full" :disabled="saving || !name.trim()">สร้างกลุ่ม</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { createGroup, listGroups } from '@/api/health/group.api'
import HabitPicker from '@/components/health/HabitPicker.vue'
import EmptyState from '@/components/page/EmptyState.vue'
import { useMessage } from '@/use/useMessage'
import { getApiErrorMessage } from '@/utils/apiError'
import { HABIT_LABELS, PRIVACY_NOTE } from '@/utils/labels'
import type { GroupSummary, Habit } from '@/types/health.types'

const router = useRouter()
const { showError } = useMessage()

const groups = ref<GroupSummary[]>([])
const loading = ref(true)
const name = ref('')
const challenge = ref<Habit>('log')
const saving = ref(false)

const create = async () => {
  saving.value = true
  try {
    const g = await createGroup({ name: name.value.trim(), challenge: challenge.value })
    router.push({ name: 'group', params: { id: g.id } })
  } catch (err) {
    showError(getApiErrorMessage(err))
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  try {
    groups.value = await listGroups()
  } catch (err) {
    showError(getApiErrorMessage(err))
  } finally {
    loading.value = false
  }
})
</script>

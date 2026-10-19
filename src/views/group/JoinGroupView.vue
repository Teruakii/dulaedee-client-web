<template>
  <div class="mx-auto max-w-md">
    <EmptyState v-if="loadError" title="ลิงก์ชวนใช้ไม่ได้" :text="loadError">
      <RouterLink to="/groups" class="btn-soft">ไปกลุ่มของฉัน</RouterLink>
    </EmptyState>
    <div v-else-if="!preview" class="h-72 animate-pulse rounded-[2.5rem] bg-surface" />

    <section v-else class="card text-center">
      <p class="text-5xl" aria-hidden="true">{{ HABIT_LABELS[preview.challenge].emoji }}</p>
      <p class="mt-3 text-mute">คุณได้รับคำชวนเข้ากลุ่ม</p>
      <h1 class="text-3xl">{{ preview.name }}</h1>
      <p class="mt-1 text-mute">แข่ง{{ HABIT_LABELS[preview.challenge].name }} · สมาชิก {{ preview.memberCount }} คน</p>
      <p class="mt-5 rounded-2xl bg-bg p-4 text-left text-sm text-mute">{{ PRIVACY_NOTE }}</p>
      <RouterLink v-if="preview.alreadyMember" :to="{ name: 'groups' }" class="btn-ink mt-5 inline-block">คุณอยู่ในกลุ่มนี้แล้ว ไปที่กลุ่ม</RouterLink>
      <p v-else-if="preview.full" class="mt-5 font-semibold text-melon">กลุ่มนี้เต็มแล้ว</p>
      <button v-else class="btn-ink mt-5 w-full" :disabled="joining" @click="join">เข้าร่วมกลุ่ม</button>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { joinGroup, previewInvite } from '@/api/health/group.api'
import EmptyState from '@/components/page/EmptyState.vue'
import { useMessage } from '@/use/useMessage'
import { getApiErrorMessage } from '@/utils/apiError'
import { HABIT_LABELS, PRIVACY_NOTE } from '@/utils/labels'
import type { InvitePreview } from '@/types/health.types'

// เปิดจากลิงก์ที่เพื่อนส่งมา · ยังไม่ login จะถูกพาไป login แล้วกลับมาหน้านี้
const route = useRoute()
const router = useRouter()
const { showError, showSuccess } = useMessage()
const code = String(route.params.code)

const preview = ref<InvitePreview | null>(null)
const loadError = ref('')
const joining = ref(false)

const join = async () => {
  joining.value = true
  try {
    const g = await joinGroup(code)
    showSuccess(`เข้ากลุ่ม ${g.name} แล้ว 🎉`)
    router.replace({ name: 'group', params: { id: g.id } })
  } catch (err) {
    showError(getApiErrorMessage(err))
  } finally {
    joining.value = false
  }
}

onMounted(async () => {
  try {
    preview.value = await previewInvite(code)
  } catch (err) {
    loadError.value = getApiErrorMessage(err)
  }
})
</script>

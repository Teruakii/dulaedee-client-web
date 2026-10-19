<template>
  <!-- โหลดไม่ได้ก็ไม่แสดง หน้าวันนี้ยังใช้ได้ -->
  <RouterLink v-if="data" to="/summary" class="lift flex items-center gap-4 rounded-[2rem] bg-peach p-5">
    <span class="font-display text-4xl" aria-hidden="true">🔥</span>
    <div class="min-w-0 flex-1">
      <p class="font-display text-xl">จดต่อเนื่อง {{ data.streaks.log.current }} วัน</p>
      <p class="truncate text-sm text-mute">
        <template v-if="next">อีก {{ next.goal - next.progress }} {{ next.id === 'workout-10' ? 'ครั้ง' : 'วัน' }} ได้เหรียญ {{ BADGE_LABELS[next.id].name }} {{ BADGE_LABELS[next.id].emoji }}</template>
        <template v-else>ได้เหรียญครบทุกอันแล้ว 🏆</template>
      </p>
    </div>
    <span class="text-sm font-semibold text-melon">สรุป →</span>
  </RouterLink>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { getStreaks } from '@/api/health/daylog.api'
import { todayBangkok } from '@/utils/date'
import { BADGE_LABELS } from '@/utils/labels'
import type { StreakSummary } from '@/types/health.types'

const data = ref<StreakSummary | null>(null)

// เหรียญที่ใกล้ได้ที่สุด
const next = computed(() =>
  [...(data.value?.badges ?? [])].filter((b) => !b.earned).sort((a, b) => b.progress / b.goal - a.progress / a.goal)[0] ?? null,
)

onMounted(async () => {
  try {
    data.value = await getStreaks(todayBangkok())
  } catch {
    data.value = null
  }
})
</script>

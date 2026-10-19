<template>
  <fieldset>
    <legend class="text-sm font-medium">แข่งเรื่องอะไร</legend>
    <div class="mt-2 grid grid-cols-2 gap-2">
      <button
        v-for="h in HABITS"
        :key="h"
        type="button"
        class="rounded-2xl p-3 text-left transition-colors"
        :class="model === h ? 'bg-ink text-white' : 'bg-bg'"
        :aria-pressed="model === h"
        @click="model = h"
      >
        <span aria-hidden="true">{{ HABIT_LABELS[h].emoji }}</span> {{ HABIT_LABELS[h].name }}
        <span class="block text-xs" :class="model === h ? 'text-white/70' : 'text-mute'">{{ HABIT_LABELS[h].done }}</span>
      </button>
    </div>
  </fieldset>
</template>

<script setup lang="ts">
import { HABIT_LABELS } from '@/utils/labels'
import type { Habit } from '@/types/health.types'

const HABITS: Habit[] = ['log', 'water', 'workout', 'skin']
const model = defineModel<Habit>({ required: true })
</script>

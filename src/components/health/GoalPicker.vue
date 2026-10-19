<template>
  <div class="space-y-2" role="radiogroup" aria-label="เป้าหมาย">
    <button
      v-for="(g, key) in GOAL_LABELS"
      :key="key"
      type="button"
      role="radio"
      :aria-checked="model === key"
      class="flex w-full items-start gap-3 rounded-3xl border-2 p-4 text-left transition-colors"
      :class="model === key ? 'border-melon bg-blush' : 'border-line bg-surface'"
      @click="model = key"
    >
      <span class="min-w-0 flex-1">
        <span class="flex flex-wrap items-baseline gap-x-2">
          <span class="font-display text-lg">{{ g.label }}</span>
          <span class="text-sm" :class="model === key ? 'text-melon' : 'text-mute'">{{ g.delta }}</span>
        </span>
        <span class="mt-0.5 block text-sm text-mute">{{ g.hint }}</span>
      </span>
      <span class="mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full border-2" :class="model === key ? 'border-melon' : 'border-line'">
        <span v-if="model === key" class="h-3 w-3 rounded-full bg-melon" />
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { GOAL_LABELS } from '@/utils/labels'
import type { Goal } from '@/types/health.types'

const model = defineModel<Goal | undefined>()
</script>

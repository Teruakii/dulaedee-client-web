<template>
  <span class="grid shrink-0 place-items-center" :class="[foodTint(name), SIZE[size]]" aria-hidden="true">{{ emoji ?? foodEmoji(name, tags) }}</span>
</template>

<script setup lang="ts">
import { foodEmoji, foodTint } from '@/utils/foodEmoji'
import type { FoodTag } from '@/types/health.types'

const SIZE = {
  sm: 'h-12 w-12 rounded-2xl text-2xl',
  md: 'h-14 w-14 rounded-2xl text-3xl',
  lg: 'h-20 w-20 rounded-3xl text-5xl',
} as const

withDefaults(defineProps<{ name: string; tags?: FoodTag[]; emoji?: string; size?: keyof typeof SIZE }>(), { tags: () => [], size: 'md' })
</script>

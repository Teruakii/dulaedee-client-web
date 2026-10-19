<template>
  <span class="grid shrink-0 place-items-center rounded-full bg-peach font-display text-melon" :class="sizeClass">{{ initial }}</span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{ name: string; size?: 'sm' | 'md' | 'lg' }>(), { size: 'md' })

const initial = computed(() => props.name.trim().charAt(0) || '🙂')
const sizeClass = computed(() => ({ sm: 'h-9 w-9 text-sm', md: 'h-11 w-11 text-lg', lg: 'h-16 w-16 text-2xl' })[props.size])
</script>

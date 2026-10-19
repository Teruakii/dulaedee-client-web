<template>
  <div class="rounded-[2rem] bg-surface p-8 text-center">
    <p v-if="eyebrow" class="text-sm font-semibold text-mute">{{ eyebrow }}</p>
    <h2 class="mt-2 text-xl font-semibold">{{ title }}</h2>
    <p v-if="text" class="mt-1 text-mute">{{ text }}</p>
    <div v-if="$slots.default" class="mt-5 flex flex-wrap justify-center gap-3"><slot /></div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ title: string; eyebrow?: string; text?: string }>()
</script>

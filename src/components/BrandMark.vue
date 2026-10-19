<template>
  <RouterLink to="/today" class="flex items-center gap-2">
    <span class="grid h-10 w-10 place-items-center rounded-2xl bg-melon font-display text-lg text-white">ด</span>
    <span v-if="withName" class="font-display text-xl">ดูแลดี<span class="text-melon">.</span></span>
  </RouterLink>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ withName?: boolean }>(), { withName: true })
</script>

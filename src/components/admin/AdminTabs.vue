<template>
  <div class="mb-6 flex flex-wrap items-center gap-3">
    <h1 class="mr-auto text-3xl">{{ route.meta.title }}</h1>
    <div class="pill-tabs">
      <RouterLink
        v-for="t in TABS"
        :key="t.name"
        :to="{ name: t.name }"
        class="pill-tab"
        :class="{ 'pill-tab-active': route.name === t.name }"
        >{{ t.label }}</RouterLink
      >
    </div>
    <slot />
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

const TABS = [
  { name: 'admin-foods', label: 'ฐานเมนู' },
  { name: 'admin-clips', label: 'คลิปแนะนำ' },
]

const route = useRoute()
</script>

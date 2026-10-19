<template>
  <!-- น้องใบเตย มาสคอตของแอป -->
  <svg class="animate-bob shrink-0" viewBox="0 0 100 100" role="img" aria-label="น้องใบเตย">
    <path d="M50 8 C78 18 90 48 74 74 C62 92 38 92 26 74 C10 48 22 18 50 8Z" class="fill-lime" />
    <path d="M50 14 C50 40 50 60 50 86" class="stroke-ink/15" stroke-width="3" fill="none" stroke-linecap="round" />
    <template v-if="mood === 'happy'">
      <circle cx="39" cy="48" r="5" class="fill-ink" /><circle cx="61" cy="48" r="5" class="fill-ink" />
      <circle cx="41" cy="46" r="1.6" class="fill-white" /><circle cx="63" cy="46" r="1.6" class="fill-white" />
      <path d="M42 60 Q50 67 58 60" class="stroke-ink" stroke-width="3" fill="none" stroke-linecap="round" />
    </template>
    <template v-else>
      <path d="M34 48 Q39 43 44 48 M56 48 Q61 43 66 48" class="stroke-ink" stroke-width="3" fill="none" stroke-linecap="round" />
      <ellipse cx="50" cy="62" rx="5" ry="4" class="fill-ink" />
    </template>
    <circle cx="32" cy="58" r="4" class="fill-melon/50" /><circle cx="68" cy="58" r="4" class="fill-melon/50" />
  </svg>
</template>

<script setup lang="ts">
// wow = กินเกินงบหรือทำครบ ทำหน้าตกใจแทนการดุ
withDefaults(defineProps<{ mood?: 'happy' | 'wow' }>(), { mood: 'happy' })
</script>

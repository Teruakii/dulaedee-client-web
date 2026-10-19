<template>
  <main class="grid min-h-screen place-items-center p-5 text-center">
    <div>
      <MascotLeaf mood="wow" class="mx-auto h-24 w-24" />
      <h1 class="mt-4 text-3xl">อ๊ะ ไม่พบหน้านี้</h1>
      <p class="mt-1 text-mute">หน้าอาจถูกย้าย หรือคุณไม่มีสิทธิ์เปิด</p>
      <RouterLink to="/today" class="btn-ink mt-6 inline-block">กลับหน้าวันนี้</RouterLink>
    </div>
  </main>
</template>

<script setup lang="ts">
import MascotLeaf from '@/components/MascotLeaf.vue'
</script>

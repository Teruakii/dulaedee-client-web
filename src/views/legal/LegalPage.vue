<template>
  <main class="min-h-screen bg-bg px-5 py-8">
    <article class="legal mx-auto max-w-2xl">
      <RouterLink to="/" class="mb-6 flex items-center gap-3"><MascotLeaf class="h-12 w-12" /><span class="font-display text-2xl">ดูแลดี<span class="text-melon">.</span></span></RouterLink>
      <!-- ร่าง: เอาออกเมื่อเจ้าของแอปอ่านและเติมช่องว่างครบแล้ว -->
      <p v-if="LEGAL_DRAFT" class="mb-6 rounded-2xl bg-lemon px-4 py-3 text-sm">ฉบับร่าง ยังรอผู้ดูแลแอปตรวจทาน</p>
      <h1 class="text-3xl">{{ title }}</h1>
      <p class="mt-1 text-sm text-mute">ปรับปรุงล่าสุด {{ LEGAL_UPDATED }}</p>
      <slot />
      <button class="btn-soft mt-10" @click="back">กลับ</button>
    </article>
  </main>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import MascotLeaf from '@/components/MascotLeaf.vue'
import { LEGAL_DRAFT, LEGAL_UPDATED } from './legal'

defineProps<{ title: string }>()

// เปิดในแท็บใหม่จากช่องติ๊กตอนสมัคร (ไม่มีหน้าก่อนหน้า) → ไปหน้าแรกแทน
const router = useRouter()
const back = () => (window.history.state?.back ? router.back() : router.push('/'))
</script>

<style scoped>
.legal :slotted(h2) {
  margin-top: 2rem;
  font-size: 1.25rem;
}
.legal :slotted(p),
.legal :slotted(ul) {
  margin-top: 0.75rem;
  line-height: 1.75;
}
.legal :slotted(ul) {
  list-style: disc;
  padding-left: 1.25rem;
}
.legal :slotted(li) {
  margin-top: 0.25rem;
}
</style>

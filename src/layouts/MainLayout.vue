<template>
  <div class="relative min-h-screen overflow-x-clip bg-bg">
    <!-- วงสีลอยด้านหลัง ให้พื้นไม่เรียบเกินไป -->
    <div class="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-mango/25" aria-hidden="true" />
    <div class="pointer-events-none absolute -left-20 top-96 h-56 w-56 rounded-full bg-melon/15" aria-hidden="true" />
    <AppTopNav />
    <main class="relative mx-auto max-w-6xl px-5 pb-32 pt-6 md:px-6 md:pb-12 md:pt-10">
      <RouterView />
    </main>
    <AppDock />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProfileStore } from '@/stores/profile.pinia'
import AppDock from './main/AppDock.vue'
import AppTopNav from './main/AppTopNav.vue'

const route = useRoute()
const router = useRouter()
const profileStore = useProfileStore()

// ทุกหน้าในแอปต้องมีข้อมูลร่างกายก่อน ยังไม่ตั้ง = ส่งไปหน้าตั้งเป้าหมาย
onMounted(async () => {
  await profileStore.load()
  if (profileStore.status === 'missing') router.replace({ name: 'onboarding', query: route.fullPath === '/today' ? {} : { redirect: route.fullPath } })
})
</script>

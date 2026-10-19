<template>
  <nav class="relative mx-auto hidden max-w-6xl items-center gap-1 px-6 pt-6 md:flex">
    <RouterLink to="/today" class="mr-5 font-display text-2xl">ดูแลดี<span class="text-melon">.</span></RouterLink>
    <RouterLink
      v-for="item in items"
      :key="item.key"
      :to="item.to"
      class="rounded-full px-4 py-2.5 font-medium transition-colors lg:px-5"
      :class="item.key === route.meta.nav ? 'bg-ink text-white' : 'text-mute hover:bg-surface'"
    >
      {{ item.label }}
    </RouterLink>
    <RouterLink to="/profile" class="ml-auto rounded-full transition-transform hover:scale-105" :class="{ 'ring-4 ring-melon/30': route.meta.nav === 'profile' }" aria-label="โปรไฟล์">
      <UserAvatar :name="userStore.displayName" />
    </RouterLink>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import UserAvatar from '@/components/UserAvatar.vue'
import { MAIN_NAV, STAFF_NAV } from '@/setting/nav'
import { useUserStore } from '@/stores/user.pinia'
import { canAccessByRoles } from '@/types/role.types'

const route = useRoute()
const userStore = useUserStore()

const items = computed(() => [...MAIN_NAV, ...STAFF_NAV.filter((i) => canAccessByRoles(i.roles, userStore.userProfile?.role))])
</script>

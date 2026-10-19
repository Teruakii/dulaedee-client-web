<template>
  <nav class="fixed inset-x-2 bottom-[max(1rem,env(safe-area-inset-bottom))] z-20 flex items-center rounded-full bg-ink px-1 py-1.5 text-white shadow-2xl min-[360px]:inset-x-3 min-[360px]:px-2 md:hidden">
    <DockLink v-for="item in MAIN_NAV.slice(0, 3)" :key="item.key" :item="item" />
    <!-- ปุ่มหลัก: บันทึกมื้อถัดไป -->
    <RouterLink
      :to="{ name: 'food', query: { meal: nextMealNow() } }"
      class="-mt-9 grid h-12 w-12 shrink-0 min-[360px]:h-14 min-[360px]:w-14 place-items-center rounded-full bg-melon text-3xl shadow-lg ring-4 ring-bg transition-transform active:scale-90"
      aria-label="บันทึกอาหาร"
      >+</RouterLink
    >
    <DockLink v-for="item in MAIN_NAV.slice(3)" :key="item.key" :item="item" />
  </nav>
</template>

<script setup lang="ts">
import { defineComponent, h } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { MAIN_NAV, type NavItem } from '@/setting/nav'
import { nextMealNow } from '@/utils/timeOfDay'

const route = useRoute()

const DockLink = defineComponent({
  props: { item: { type: Object as () => NavItem, required: true } },
  setup(props) {
    return () =>
      h(
        RouterLink,
        {
          to: props.item.to,
          class: [
            'flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-2xl py-1.5 transition-colors',
            props.item.key === route.meta.nav ? 'bg-white text-ink' : 'opacity-75',
          ],
        },
        () => [h(props.item.icon, { size: 20, 'aria-hidden': 'true' }), h('span', { class: 'whitespace-nowrap text-[9px] leading-none min-[360px]:text-[10px]' }, props.item.label)],
      )
  },
})
</script>

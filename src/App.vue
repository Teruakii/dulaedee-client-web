<template>
  <el-config-provider :message="elMessageDefaults" :locale="th" size="large" :z-index="3000">
    <RouterView />
  </el-config-provider>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import 'dayjs/locale/th'
import buddhistEra from 'dayjs/plugin/buddhistEra'
import th from 'element-plus/es/locale/lang/th'
// คอมโพเนนต์ใน template ได้ CSS จาก unplugin อัตโนมัติ · ตัวที่เรียกจากโค้ด (ElMessage, ElMessageBox) ต้องนำเข้า CSS เอง
import 'element-plus/es/components/message/style/css'
import 'element-plus/es/components/message-box/style/css'
import 'element-plus/es/components/notification/style/css'

dayjs.extend(buddhistEra)
dayjs.locale('th')

// มือถือเป็นหลัก ข้อความแจ้งเตือนอยู่กลางล่าง ไม่ทับแถบเมนูล่าง
const elMessageDefaults = { placement: 'bottom' as const, offset: 96 }
</script>

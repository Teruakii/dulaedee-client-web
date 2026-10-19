import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    // นำเข้าเฉพาะคอมโพเนนต์ Element Plus ที่ template ใช้ พร้อม CSS ของมัน แทนการโหลดทั้งชุด
    Components({ resolvers: [ElementPlusResolver({ importStyle: 'css' })], dts: 'src/components.d.ts' }),
  ],
  // port ตายตัวให้ตรงกับ CORS_ORIGINS/CLIENT_URL ของ service · ถูกใช้อยู่ให้ล้มแทนการย้ายเงียบๆ
  server: { port: 5190, strictPort: true },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})

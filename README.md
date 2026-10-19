# dulaedee-client-web

หน้าเว็บของแอป "ดูแลดี" (Vue 3 + Vite + TypeScript + Pinia + Element Plus + Tailwind v4) ตามดีไซน์แนว A ใน `../design/mockups/`
คุยกับ `../dulaedee-service`

## เริ่มใช้งาน

```bash
npm install
cp .env.example .env     # baseURL ชี้ API ที่ port 3200
npm run dev
```

ลองแบบไม่ต้องมี MongoDB: ใน `dulaedee-service` สั่ง `npm run dev:demo` แล้วเข้าด้วย `mind@example.com` / `password1`
(admin: `admin` / `admin-demo-pass`)

## ตรวจ

```bash
npm run type-check
npm run build-only
node ../design/verify-flow.mjs http://localhost:5190   # ขับเบราว์เซอร์จริง: เพิ่มเมนู น้ำ ขั้นผิว แล้วเช็กตัวเลข
```

## โครง

- `src/api/health/*.api.ts` หนึ่งฟังก์ชันต่อ endpoint คืน `data`
- `src/stores/day.pinia.ts` บันทึกของวันที่เลือก ใช้ร่วมกันทุกหน้า · `profile.pinia.ts` ข้อมูลร่างกายและงบ
- `src/utils/labels.ts` ป้ายไทยของทุก enum จาก backend
- `src/assets/css/main.css` โทเคนสีและฟอนต์ (view ใช้ชื่อโทเคน ไม่ใส่ hex)
- หน้า `/admin/foods` และ `/admin/clips` สำหรับ ADMIN/STAFF ดูแลฐานเมนูและคัดคลิป

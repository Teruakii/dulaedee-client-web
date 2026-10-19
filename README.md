# ดูแลดี · dulaedee-client-web

หน้าเว็บของแอป "ดูแลดี" แอปดูแลสุขภาพสำหรับเพื่อนและครอบครัว ใช้นับแคลอรี่เมนูไทย จดน้ำและน้ำหนัก ทำ routine ผิว และออกกำลังกาย มีวันต่อเนื่อง เหรียญ และชาเลนจ์กลุ่มให้อยากกลับมาใช้ทุกวัน

Vue 3 · Vite · TypeScript · Pinia · Element Plus · Tailwind v4 ทำงานคู่กับ API [`dulaedee-service`](https://github.com/Teruakii/dulaedee-service)

## เริ่มใช้งาน

```bash
npm install
cp .env.example .env     # baseURL ชี้ API ที่ port 3200
npm run dev              # http://localhost:5190
```

ลองแบบไม่ต้องมี MongoDB: ใน `dulaedee-service` สั่ง `npm run dev:demo` แล้วเข้าด้วย `mind@example.com` / `password1`
(admin: `admin` / `admin-demo-pass`)

## ตรวจ

```bash
npm run type-check
npm run build-only
```

## โครง

- `src/api/health/*.api.ts` หนึ่งฟังก์ชันต่อ endpoint คืน `data`
- `src/stores/day.pinia.ts` บันทึกของวันที่เลือก ใช้ร่วมกันทุกหน้า · `profile.pinia.ts` ข้อมูลร่างกายและงบ
- `src/utils/labels.ts` ป้ายไทยของทุก enum จาก backend
- `src/assets/css/main.css` โทเคนสีและฟอนต์ (view ใช้ชื่อโทเคน ไม่ใส่ hex)
- `src/views/legal/` ข้อกำหนดการใช้งานและนโยบายความเป็นส่วนตัว (ฉบับร่าง เติมชื่อผู้ดูแลและอีเมลติดต่อใน `legal.ts` ก่อนเปิดใช้จริง)
- หน้า `/admin/foods` และ `/admin/clips` สำหรับ ADMIN/STAFF ดูแลฐานเมนูและคัดคลิป

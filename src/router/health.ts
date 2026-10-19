import type { RouteRecordRaw } from 'vue-router'
import { page } from './page'

const healthRoutes: RouteRecordRaw[] = [
  page('/today', 'today', 'วันนี้', 'today', () => import('@/views/today/TodayView.vue')),
  page('/food', 'food', 'อาหาร', 'food', () => import('@/views/food/FoodView.vue')),
  page('/workout', 'workout', 'ตารางออกกำลังกาย', 'workout', () => import('@/views/workout/WorkoutView.vue')),
  page('/body', 'body', 'ร่างกาย', 'body', () => import('@/views/body/BodyView.vue')),
  page('/skin', 'skin', 'ดูแลผิว', 'skin', () => import('@/views/skin/SkinView.vue')),
  page('/summary', 'summary', 'สรุปและเหรียญ', 'body', () => import('@/views/summary/SummaryView.vue')),
  page('/groups', 'groups', 'กลุ่มของฉัน', 'profile', () => import('@/views/group/GroupsView.vue')),
  page('/groups/:id', 'group', 'กลุ่ม', 'profile', () => import('@/views/group/GroupView.vue')),
  // ลิงก์ชวนจากเพื่อน · ยังไม่ login จะถูกพาไป login แล้วกลับมา
  page('/join/:code', 'join-group', 'เข้าร่วมกลุ่ม', 'profile', () => import('@/views/group/JoinGroupView.vue')),
  page('/calc', 'calc', 'คำนวณแคลอรี่', 'calc', () => import('@/views/calc/CalcView.vue')),
  page('/profile', 'profile', 'โปรไฟล์', 'profile', () => import('@/views/profile/ProfileView.vue')),
  // ตั้งเป้าหมายเต็มจอ ไม่มีเมนู
  {
    path: '/onboarding',
    name: 'onboarding',
    component: () => import('@/views/onboarding/OnboardingView.vue'),
    meta: { auth: true, title: 'ตั้งเป้าหมาย' },
  },
]

export default healthRoutes

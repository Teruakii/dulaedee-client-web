import type { RouteRecordRaw } from 'vue-router'

const authenticationRoutes: RouteRecordRaw[] = [
  { path: '/log-in', name: 'login', component: () => import('../views/auth/LoginView.vue'), meta: { auth: false } },
  { path: '/sign-up', name: 'register', component: () => import('../views/auth/LoginView.vue'), meta: { auth: false } },
  { path: '/forgot-password', name: 'forgot-password', component: () => import('../views/auth/PasswordResetView.vue'), meta: { auth: false, title: 'ลืมรหัสผ่าน' } },
  { path: '/verify-email', name: 'verify-email', component: () => import('../views/auth/VerifyEmailView.vue'), meta: { auth: false, title: 'ยืนยันอีเมล' } },
  { path: '/reset-password', name: 'reset-password', component: () => import('../views/auth/PasswordResetView.vue'), meta: { auth: false, title: 'ตั้งรหัสผ่านใหม่' } },
  { path: '/terms', name: 'terms', component: () => import('../views/legal/TermsView.vue'), meta: { auth: false, title: 'ข้อกำหนดการใช้งาน' } },
  { path: '/privacy', name: 'privacy', component: () => import('../views/legal/PrivacyView.vue'), meta: { auth: false, title: 'นโยบายความเป็นส่วนตัว' } },
  {
    path: '/auth/google/success',
    name: 'google-oauth-success',
    component: () => import('../views/auth/GoogleOAuthSuccessView.vue'),
    meta: { auth: false },
  },
  {
    path: '/auth/google/failed',
    name: 'google-oauth-failed',
    component: () => import('../views/auth/GoogleOAuthFailedView.vue'),
    meta: { auth: false },
  },
]

export default authenticationRoutes

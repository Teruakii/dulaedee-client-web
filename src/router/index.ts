import { createRouter, createWebHistory } from 'vue-router'
import authenticationRoutes from './authentication'
import healthRoutes from './health'
import adminRoutes from './admin'
import { useUserStore } from '@/stores/user.pinia'
import { canAccessByRoles } from '@/types/role.types'
import { hydrateSessionAfterRefresh } from '@/services/authSession'
import { hasAuthSessionHint } from '@/utils/authSessionHint'

const routes = [
  { path: '/', redirect: '/today' },
  ...authenticationRoutes,
  ...healthRoutes,
  ...adminRoutes,
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
    meta: { title: 'ไม่พบหน้านี้' },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

router.beforeEach(async (to) => {
  const store = useUserStore()
  // หน้า Google callback จัดการ session เอง
  const isGoogleCallback = to.name === 'google-oauth-success' || to.name === 'google-oauth-failed'
  const requiresAuth = to.matched.some((record) => record.meta.auth === true)
  if (!isGoogleCallback && (requiresAuth || !!store.accessToken || hasAuthSessionHint())) {
    await hydrateSessionAfterRefresh()
  }

  if (requiresAuth && !store.isAuthenticated) {
    return { name: 'login', query: to.fullPath === '/today' ? {} : { redirect: to.fullPath } }
  }

  if (requiresAuth) {
    for (const record of to.matched) {
      if (!canAccessByRoles(record.meta.roles, store.userProfile?.role)) return { name: 'not-found', replace: true }
    }
  }

  if ((to.name === 'login' || to.name === 'register') && store.isAuthenticated) {
    const redirect = typeof to.query.redirect === 'string' ? to.query.redirect : ''
    return redirect.startsWith('/') && !redirect.startsWith('//') ? { path: redirect } : { name: 'today' }
  }
})

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} · ดูแลดี` : 'ดูแลดี'
})

export default router

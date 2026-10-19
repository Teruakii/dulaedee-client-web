let loadPromise: Promise<void> | null = null

export const resetSessionLoadState = (): void => {
  loadPromise = null
}

/** หลัง login สำเร็จ — ไม่ยิง /auth/me ซ้ำใน navigation ถัดไป (router ใช้ promise เดิม) */
export const markSessionHydrated = (): void => {
  loadPromise = Promise.resolve()
}

export const runSessionLoadOnce = (loader: () => Promise<void>): Promise<void> => {
  if (!loadPromise) loadPromise = loader()
  return loadPromise
}

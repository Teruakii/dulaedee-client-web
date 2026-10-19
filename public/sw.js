// service worker สำหรับการแจ้งเตือนเท่านั้น ไม่ cache หน้าเว็บ
self.addEventListener('push', (event) => {
  let data = { title: 'ดูแลดี', body: '', url: '/today' }
  try {
    data = { ...data, ...event.data.json() }
  } catch {
    // payload ไม่ใช่ JSON ใช้ค่าตั้งต้น
  }
  event.waitUntil(self.registration.showNotification(data.title, { body: data.body, icon: '/favicon.svg', badge: '/favicon.svg', data: { url: data.url }, lang: 'th' }))
})

// กดแจ้งเตือน: ใช้แท็บแอปที่เปิดอยู่ถ้ามี ไม่มีก็เปิดใหม่
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url ?? '/today'
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((tabs) => {
      const tab = tabs.find((t) => new URL(t.url).origin === self.location.origin)
      return tab ? tab.focus().then((t) => t.navigate(url)) : self.clients.openWindow(url)
    }),
  )
})

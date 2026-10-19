import axios from '@/api/instance'

// สถานะการแจ้งเตือนของเบราว์เซอร์เครื่องนี้ (ไม่ใช่ของบัญชี)
export type PushState = 'unsupported' | 'blocked' | 'off' | 'on'

export const pushSupported = () => 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window

const registration = () => navigator.serviceWorker.register('/sw.js')

const toUint8 = (b64url: string) => {
  const raw = atob((b64url + '='.repeat((4 - (b64url.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/'))
  return Uint8Array.from(raw, (c) => c.charCodeAt(0))
}

export async function pushState(): Promise<PushState> {
  if (!pushSupported()) return 'unsupported'
  if (Notification.permission === 'denied') return 'blocked'
  const sub = await (await registration()).pushManager.getSubscription()
  return sub && Notification.permission === 'granted' ? 'on' : 'off'
}

/** ขออนุญาต สมัครกับ push service ของเบราว์เซอร์ แล้วบอก server · ส่งซ้ำได้ */
export async function enablePush(): Promise<PushState> {
  if (!pushSupported()) return 'unsupported'
  if ((await Notification.requestPermission()) !== 'granted') return Notification.permission === 'denied' ? 'blocked' : 'off'
  const reg = await registration()
  const { publicKey } = (await axios.get<{ data: { publicKey: string } }>(`/push/key`)).data.data
  const sub = (await reg.pushManager.getSubscription()) ?? (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: toUint8(publicKey) }))
  await axios.post(`/push/subscriptions`, sub.toJSON())
  return 'on'
}

export async function disablePush(): Promise<PushState> {
  if (!pushSupported()) return 'unsupported'
  const sub = await (await registration()).pushManager.getSubscription()
  if (sub) {
    await axios.delete(`/push/subscriptions`, { data: { endpoint: sub.endpoint } })
    await sub.unsubscribe()
  }
  return 'off'
}

/** คืนจำนวนเครื่องที่ส่งถึง */
export const sendTestPush = async () => (await axios.post<{ data: { delivered: number } }>(`/push/test`)).data.data.delivered

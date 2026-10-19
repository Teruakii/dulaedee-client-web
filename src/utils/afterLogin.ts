// หน้าที่จะพากลับไปหลัง login หรือตั้งเป้าหมายเสร็จ เช่น ลิงก์ชวนเข้ากลุ่ม
// รับเฉพาะ path ในแอป กันลิงก์พาออกไปเว็บอื่น
export const safeRedirect = (r: unknown): string | null => (typeof r === 'string' && r.startsWith('/') && !r.startsWith('//') ? r : null)

const KEY = 'dulaedee.afterLogin'

// login ด้วย Google ออกไปนอกแอปแล้วกลับมา query หาย จึงจำไว้ใน sessionStorage · เปิดแบบส่วนตัวแล้วจำไม่ได้ก็แค่ไปหน้าวันนี้
export const rememberAfterLogin = (path: string | null) => {
  try {
    if (path) sessionStorage.setItem(KEY, path)
    else sessionStorage.removeItem(KEY)
  } catch {
    /* ใช้ storage ไม่ได้ */
  }
}

export const takeAfterLogin = (): string | null => {
  try {
    const path = sessionStorage.getItem(KEY)
    sessionStorage.removeItem(KEY)
    return safeRedirect(path)
  } catch {
    return null
  }
}

import axios from '../instance'

/** ต้องส่งคำยืนยัน "ลบบัญชี" ตรงตัว · ลบข้อมูลและรูปทั้งหมด ย้อนกลับไม่ได้ */
export const deleteAccount = async (confirm: string) => {
  await axios.delete(`/account`, { data: { confirm } })
}

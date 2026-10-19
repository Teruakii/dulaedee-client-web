import { ElMessage } from 'element-plus'
import type { MessagePlacement, MessageType } from 'element-plus'

export function useMessage() {
  const showMessage = (
    message: string,
    type: MessageType = 'info',
    duration: number = 3000,
    showClose: boolean = false,
    placement: MessagePlacement = 'bottom',
  ) => {
    ElMessage({
      message,
      type,
      duration,
      showClose,
      customClass: 'app-message',
      placement,
    })
  }

  const showSuccess = (message: string, placement?: MessagePlacement) => {
    showMessage(message, 'success', 3000, false, placement)
  }

  const showError = (message: string, placement?: MessagePlacement) => {
    showMessage(message, 'error', 3000, false, placement)
  }

  const showInfo = (message: string, placement?: MessagePlacement) => {
    showMessage(message, 'info', 3000, false, placement)
  }

  const showWarning = (message: string, placement?: MessagePlacement) => {
    showMessage(message, 'warning', 3000, false, placement)
  }

  return {
    showMessage,
    showSuccess,
    showError,
    showInfo,
    showWarning,
  }
}

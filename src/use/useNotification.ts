import { ElNotification } from 'element-plus'

export function useNotification() {
  const showNotification = (
    title: string,
    message: string,
    type: 'success' | 'warning' | 'info' | 'error' = 'info',
    duration: number = 3000,
  ) => {
    ElNotification({
      title,
      message,
      type,
      duration,
      customClass: 'app-notification',
    })
  }

  const showSuccess = (message: string, title: string = 'Success') => {
    showNotification(title, message, 'success')
  }

  const showError = (message: string, title: string = 'Error') => {
    showNotification(title, message, 'error')
  }

  const showInfo = (message: string, title: string = 'Information') => {
    showNotification(title, message, 'info')
  }

  const showWarning = (message: string, title: string = 'Warning') => {
    showNotification(title, message, 'warning')
  }

  return {
    showNotification,
    showSuccess,
    showError,
    showInfo,
    showWarning,
  }
}

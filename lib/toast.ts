export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastItem {
  id: string
  message: string
  type: ToastType
  duration: number
}

type ToastListener = (toast: ToastItem) => void

const listeners = new Set<ToastListener>()

export const toast = {
  show: (message: string, type: ToastType = 'info', duration = 3500) => {
    const id = Math.random().toString(36).substring(2, 9)
    listeners.forEach((listener) => {
      try {
        listener({ id, message, type, duration })
      } catch (err) {
        console.error('Toast listener error:', err)
      }
    })
  },
  success: (message: string, duration = 3500) => {
    toast.show(message, 'success', duration)
  },
  error: (message: string, duration = 4000) => {
    toast.show(message, 'error', duration)
  },
  warning: (message: string, duration = 4000) => {
    toast.show(message, 'warning', duration)
  },
  info: (message: string, duration = 3500) => {
    toast.show(message, 'info', duration)
  },
  subscribe: (listener: ToastListener) => {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },
}

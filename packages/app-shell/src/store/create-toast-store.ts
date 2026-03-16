import { create } from 'zustand'

import type { Toast, ToastOptions } from '../types'

export interface ToastStore {
  toasts: Toast[]
  addToast: (message: string, options?: ToastOptions) => string
  removeToast: (id: string) => void
}

/**
 * 创建 Toast store（平台无关）
 *
 * 自动定时移除，支持手动移除和自定义 action。
 */
export function createToastStore() {
  let nextId = 0
  const timerMap = new Map<string, ReturnType<typeof setTimeout>>()

  return create<ToastStore>((set) => ({
    toasts: [],

    addToast: (message, options) => {
      const id = String(++nextId)
      const duration = options?.duration ?? 5000

      set((state) => ({
        toasts: [
          ...state.toasts,
          { id, message, ...(options?.action !== undefined ? { action: options.action } : {}) },
        ],
      }))

      const timerId = setTimeout(() => {
        timerMap.delete(id)
        set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
      }, duration)

      timerMap.set(id, timerId)

      return id
    },

    removeToast: (id) => {
      const timerId = timerMap.get(id)
      if (timerId !== undefined) {
        clearTimeout(timerId)
        timerMap.delete(id)
      }
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
    },
  }))
}

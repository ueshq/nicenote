import { create } from 'zustand'

import type { SidebarState } from '../types'

const MIN_WIDTH = 260
const MAX_WIDTH = 560
const DEFAULT_WIDTH = 320

export type SidebarStore = SidebarState

export interface CreateSidebarStoreOptions {
  /** localStorage key 前缀，如 'nicenote' 或 'nicenote-desktop' */
  storageKeyPrefix: string
}

/**
 * 创建 Sidebar store（平台无关）
 *
 * 自动持久化折叠状态和宽度到 localStorage。
 */
export function createSidebarStore({ storageKeyPrefix }: CreateSidebarStoreOptions) {
  const widthKey = `${storageKeyPrefix}-sidebar-width`
  const openKey = `${storageKeyPrefix}-sidebar-open`

  function loadWidth(): number {
    try {
      const stored = localStorage.getItem(widthKey)
      if (stored) {
        const parsed = Number(stored)
        if (parsed >= MIN_WIDTH && parsed <= MAX_WIDTH) return parsed
      }
    } catch {
      // ignore
    }
    return DEFAULT_WIDTH
  }

  function loadIsOpen(): boolean {
    try {
      return localStorage.getItem(openKey) !== 'false'
    } catch {
      return true
    }
  }

  function saveIsOpen(value: boolean) {
    try {
      localStorage.setItem(openKey, String(value))
    } catch {
      // ignore
    }
  }

  return create<SidebarStore>((set) => ({
    isOpen: loadIsOpen(),
    width: loadWidth(),
    isResizing: false,

    open: () => {
      saveIsOpen(true)
      set({ isOpen: true })
    },

    close: () => {
      saveIsOpen(false)
      set({ isOpen: false })
    },

    toggle: () =>
      set((s) => {
        saveIsOpen(!s.isOpen)
        return { isOpen: !s.isOpen }
      }),

    setWidth: (width: number) => {
      const clamped = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, width))
      set({ width: clamped })
      try {
        localStorage.setItem(widthKey, String(clamped))
      } catch {
        // ignore
      }
    },

    startResize: () => set({ isResizing: true }),
    stopResize: () => set({ isResizing: false }),
  }))
}

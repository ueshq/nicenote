import { create } from 'zustand'

const MIN_WIDTH = 260
const MAX_WIDTH = 560
const DEFAULT_WIDTH = 320
const STORAGE_KEY = 'nicenote-sidebar-width'

function loadWidth(): number {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = Number(stored)
      if (parsed >= MIN_WIDTH && parsed <= MAX_WIDTH) return parsed
    }
  } catch {
    // ignore
  }
  return DEFAULT_WIDTH
}

interface SidebarStore {
  isOpen: boolean
  width: number
  isResizing: boolean
  open: () => void
  close: () => void
  toggle: () => void
  setWidth: (width: number) => void
  startResize: () => void
  stopResize: () => void
}

export const useSidebarStore = create<SidebarStore>((set) => ({
  isOpen: true,
  width: loadWidth(),
  isResizing: false,

  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),

  setWidth: (width: number) => {
    const clamped = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, width))
    set({ width: clamped })
    try {
      localStorage.setItem(STORAGE_KEY, String(clamped))
    } catch {
      // ignore
    }
  },

  startResize: () => set({ isResizing: true }),
  stopResize: () => set({ isResizing: false }),
}))

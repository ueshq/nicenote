import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

export type Theme = 'light' | 'dark' | 'system'

export interface UIStoreState {
  theme: Theme
  sidebarOpen: boolean
  // TODO: Add search query, command palette state, etc.
}

export interface UIStoreActions {
  setTheme: (theme: Theme) => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  // TODO: Add persistence middleware for theme preference
}

export type UIStore = UIStoreState & UIStoreActions

export const useUIStore = create<UIStore>()(
  immer((set) => ({
    theme: 'system',
    sidebarOpen: true,

    setTheme: (theme) =>
      set((state) => {
        state.theme = theme
      }),

    toggleSidebar: () =>
      set((state) => {
        state.sidebarOpen = !state.sidebarOpen
      }),

    setSidebarOpen: (open) =>
      set((state) => {
        state.sidebarOpen = open
      }),
  }))
)

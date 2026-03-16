import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

export type Theme = 'light' | 'dark' | 'system'
export type Language = 'en' | 'zh'

export interface SettingsStoreState {
  theme: Theme
  language: Language
}

export interface SettingsStoreActions {
  setTheme: (theme: Theme) => void
  setLanguage: (language: Language) => void
}

export type SettingsStore = SettingsStoreState & SettingsStoreActions

export const useSettingsStore = create<SettingsStore>()(
  immer((set) => ({
    theme: 'system',
    language: 'zh',

    setTheme: (theme) =>
      set((state) => {
        state.theme = theme
      }),

    setLanguage: (language) =>
      set((state) => {
        state.language = language
      }),
  }))
)

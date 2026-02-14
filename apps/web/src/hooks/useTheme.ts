import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

function getThemeStorageKey(): string | null {
  if (typeof document === 'undefined') return null

  return document.documentElement.getAttribute('data-theme-storage-key')
}

/**
 * Theme management hook
 *
 * - Default theme: light mode
 * - Reads initial state from DOM (set by index.html script)
 * - Saves user preference to localStorage when changed
 * - Persists across sessions
 */
export function useTheme() {
  // Initialize state from current DOM state
  // This matches what index.html already set, preventing any flash
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
    }
    return 'light'
  })

  // Update DOM and localStorage when theme changes
  useEffect(() => {
    const root = document.documentElement
    const shouldBeDark = theme === 'dark'
    const storageKey = getThemeStorageKey()

    if (shouldBeDark) {
      root.classList.add('dark')
      root.setAttribute('data-theme', 'dark')
    } else {
      root.classList.remove('dark')
      root.setAttribute('data-theme', 'light')
    }

    if (storageKey) {
      localStorage.setItem(storageKey, theme)
    }
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  return { theme, setTheme, toggleTheme }
}

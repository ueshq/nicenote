import { useEffect } from 'react'

interface GlobalShortcutActions {
  onSearch: () => void
  onNewNote: () => void
  onToggleSidebar: () => void
  onShowHelp: () => void
}

function isInputElement(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false
  const tag = target.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable
}

export function useGlobalShortcuts(actions: GlobalShortcutActions) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey

      // Cmd+K — Search (works even in input)
      if (mod && e.key === 'k') {
        e.preventDefault()
        actions.onSearch()
        return
      }

      // Cmd+N — New note
      if (mod && e.key === 'n') {
        e.preventDefault()
        actions.onNewNote()
        return
      }

      // Cmd+\ — Toggle sidebar
      if (mod && e.key === '\\') {
        e.preventDefault()
        actions.onToggleSidebar()
        return
      }

      // / — Show shortcuts help (only when not in an input)
      if (e.key === '/' && !mod && !e.shiftKey && !isInputElement(e.target)) {
        e.preventDefault()
        actions.onShowHelp()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [actions])
}

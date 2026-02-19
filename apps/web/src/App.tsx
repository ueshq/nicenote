import { lazy, Suspense, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { useIsBreakpoint } from '@nicenote/ui'

import { NotesSidebar } from './components/NotesSidebar'
import { Toasts } from './components/Toasts'
import { useDebouncedNoteSave } from './hooks/useDebouncedNoteSave'
import { useNoteStore } from './store/useNoteStore'
import { useSidebarStore } from './store/useSidebarStore'

const NoteEditorPane = lazy(() =>
  import('./components/NoteEditorPane').then((m) => ({ default: m.NoteEditorPane }))
)

export default function App() {
  const { t } = useTranslation()
  const fetchNotes = useNoteStore((state) => state.fetchNotes)
  const saveNote = useNoteStore((state) => state.saveNote)
  const { scheduleSave, cancelPendingSave, saveStatus } = useDebouncedNoteSave({ saveNote })

  const isMobile = useIsBreakpoint('max', 768)
  const isOpen = useSidebarStore((s) => s.isOpen)
  const width = useSidebarStore((s) => s.width)
  const closeSidebar = useSidebarStore((s) => s.close)

  useEffect(() => {
    fetchNotes()
  }, [fetchNotes])

  const mobileOverlayOpen = isMobile && isOpen

  const gridColumns = isMobile ? '0px 1fr' : isOpen ? `${width}px 1fr` : '48px 1fr'

  return (
    <div
      className="grid h-screen"
      style={{
        gridTemplateColumns: gridColumns,
        transition: 'grid-template-columns 300ms ease-in-out',
      }}
    >
      <NotesSidebar isMobile={isMobile} cancelPendingSave={cancelPendingSave} />

      <Suspense
        fallback={
          <div className="flex flex-1 items-center justify-center text-muted-foreground">
            {t('editor.loadingEditor')}
          </div>
        }
      >
        <NoteEditorPane
          scheduleSave={scheduleSave}
          saveStatus={saveStatus}
          inert={mobileOverlayOpen}
        />
      </Suspense>

      {mobileOverlayOpen && (
        <div className="fixed inset-0 z-30 bg-black/20" onClick={closeSidebar} aria-hidden="true" />
      )}

      <Toasts />
    </div>
  )
}

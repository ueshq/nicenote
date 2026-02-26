import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

// TODO: Import NoteListItem from @nicenote/shared once types are aligned

export interface NoteStoreState {
  selectedNoteId: string | null
  // TODO: Add notes map, loading states, optimistic update queue
}

export interface NoteStoreActions {
  selectNote: (id: string | null) => void
  // TODO: Add CRUD actions (fetchNotes, createNote, updateNote, deleteNote)
  // TODO: Add auto-save with debounce
}

export type NoteStore = NoteStoreState & NoteStoreActions

export const useNoteStore = create<NoteStore>()(
  immer((set) => ({
    selectedNoteId: null,

    selectNote: (id) =>
      set((state) => {
        state.selectedNoteId = id
      }),
  }))
)

import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

export interface TagStoreState {
  selectedTagId: string | null
  // TODO: Add tags map, loading states
}

export interface TagStoreActions {
  selectTag: (id: string | null) => void
  // TODO: Add CRUD actions (fetchTags, createTag, updateTag, deleteTag)
  // TODO: Add note-tag association actions (addTagToNote, removeTagFromNote)
}

export type TagStore = TagStoreState & TagStoreActions

export const useTagStore = create<TagStore>()(
  immer((set) => ({
    selectedTagId: null,

    selectTag: (id) =>
      set((state) => {
        state.selectedTagId = id
      }),
  }))
)

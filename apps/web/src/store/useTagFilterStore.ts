import { create } from 'zustand'

interface TagFilterState {
  selectedTagId: string | null
  selectTag: (id: string | null) => void
}

export const useTagFilterStore = create<TagFilterState>((set) => ({
  selectedTagId: null,
  selectTag: (id) => set({ selectedTagId: id }),
}))

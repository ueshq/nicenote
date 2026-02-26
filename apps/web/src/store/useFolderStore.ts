import { create } from 'zustand'

interface FolderStoreState {
  selectedFolderId: string | null
  expandedFolderIds: Set<string>
  selectFolder: (id: string | null) => void
  toggleExpand: (id: string) => void
  expandAll: (ids: string[]) => void
  collapseAll: () => void
}

export const useFolderStore = create<FolderStoreState>((set) => ({
  selectedFolderId: null,
  expandedFolderIds: new Set<string>(),

  selectFolder: (id) => set({ selectedFolderId: id }),

  toggleExpand: (id) =>
    set((state) => {
      const next = new Set(state.expandedFolderIds)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return { expandedFolderIds: next }
    }),

  expandAll: (ids) => set({ expandedFolderIds: new Set(ids) }),

  collapseAll: () => set({ expandedFolderIds: new Set() }),
}))

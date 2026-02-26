import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

export interface FolderStoreState {
  selectedFolderId: string | null
  expandedFolderIds: Set<string>
  // TODO: Add folders map, loading states
}

export interface FolderStoreActions {
  selectFolder: (id: string | null) => void
  toggleFolderExpanded: (id: string) => void
  // TODO: Add CRUD actions (fetchFolders, createFolder, updateFolder, deleteFolder)
}

export type FolderStore = FolderStoreState & FolderStoreActions

export const useFolderStore = create<FolderStore>()(
  immer((set) => ({
    selectedFolderId: null,
    expandedFolderIds: new Set<string>(),

    selectFolder: (id) =>
      set((state) => {
        state.selectedFolderId = id
      }),

    toggleFolderExpanded: (id) =>
      set((state) => {
        if (state.expandedFolderIds.has(id)) {
          state.expandedFolderIds.delete(id)
        } else {
          state.expandedFolderIds.add(id)
        }
      }),
  }))
)

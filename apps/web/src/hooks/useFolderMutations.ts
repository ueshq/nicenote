import type { QueryClient } from '@tanstack/react-query'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { FolderCreateInput, FolderSelect, FolderUpdateInput } from '@nicenote/shared'
import { folderSelectSchema } from '@nicenote/shared'

import i18n from '../i18n'
import { api, throwApiError } from '../lib/api'
import { useToastStore } from '../store/useToastStore'

import { FOLDERS_QUERY_KEY } from './useFoldersQuery'

function updateFoldersCache(
  queryClient: QueryClient,
  updater: (folders: FolderSelect[]) => FolderSelect[]
) {
  queryClient.setQueryData<FolderSelect[]>(FOLDERS_QUERY_KEY, (old) => {
    if (!old) return old
    return updater(old)
  })
}

export function useCreateFolder() {
  const queryClient = useQueryClient()
  const addToast = useToastStore((s) => s.addToast)

  return useMutation({
    mutationFn: async (input: FolderCreateInput) => {
      const res = await api.folders.$post({ json: input })
      if (!res.ok) await throwApiError(res, `Create folder failed: ${res.status}`)
      const json = await res.json()
      const parsed = folderSelectSchema.safeParse(json)
      if (!parsed.success) throw new Error('Invalid folder data')
      return parsed.data
    },
    onSuccess: (newFolder) => {
      updateFoldersCache(queryClient, (folders) => [...folders, newFolder])
    },
    onError: () => {
      addToast(i18n.t('store.networkErrorCreateNote'))
    },
  })
}

export function useUpdateFolder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: FolderUpdateInput }) => {
      const res = await api.folders[':id'].$patch({ param: { id }, json: input })
      if (!res.ok) await throwApiError(res, `Update folder failed: ${res.status}`)
      const json = await res.json()
      const parsed = folderSelectSchema.safeParse(json)
      if (!parsed.success) throw new Error('Invalid folder data')
      return parsed.data
    },
    onSuccess: (updated) => {
      updateFoldersCache(queryClient, (folders) =>
        folders.map((f) => (f.id === updated.id ? updated : f))
      )
    },
  })
}

export function useDeleteFolder() {
  const queryClient = useQueryClient()
  const addToast = useToastStore((s) => s.addToast)

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.folders[':id'].$delete({ param: { id } })
      if (!res.ok) await throwApiError(res, `Delete folder failed: ${res.status}`)
      return id
    },
    onSuccess: (id) => {
      updateFoldersCache(queryClient, (folders) => folders.filter((f) => f.id !== id))
      addToast(i18n.t('folder.deleted'))
    },
  })
}

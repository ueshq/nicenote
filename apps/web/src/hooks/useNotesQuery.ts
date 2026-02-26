import { useInfiniteQuery } from '@tanstack/react-query'

import { noteListItemSchema } from '@nicenote/shared'

import { api, throwApiError } from '../lib/api'
import { useFolderStore } from '../store/useFolderStore'
import { useTagFilterStore } from '../store/useTagFilterStore'

export const NOTES_QUERY_KEY = ['notes'] as const

export function notesQueryKey(folderId: string | null, tagId?: string | null) {
  const filters: Record<string, string> = {}
  if (folderId) filters.folderId = folderId
  if (tagId) filters.tagId = tagId
  return Object.keys(filters).length > 0
    ? ([...NOTES_QUERY_KEY, filters] as const)
    : NOTES_QUERY_KEY
}

export function useNotesQuery() {
  const selectedFolderId = useFolderStore((s) => s.selectedFolderId)
  const selectedTagId = useTagFilterStore((s) => s.selectedTagId)

  return useInfiniteQuery({
    queryKey: notesQueryKey(selectedFolderId, selectedTagId),
    queryFn: async ({ pageParam }) => {
      const query: Record<string, string> = {}
      if (pageParam) {
        query.cursor = pageParam.cursor
        query.cursorId = pageParam.cursorId
      }
      if (selectedFolderId) {
        query.folderId = selectedFolderId
      }
      if (selectedTagId) {
        query.tagId = selectedTagId
      }
      const res = await api.notes.$get({ query })
      if (!res.ok) await throwApiError(res, `Failed to fetch notes: ${res.status}`)
      const json = await res.json()
      const parsed = noteListItemSchema.array().safeParse(json.data)
      if (!parsed.success) throw new Error('Invalid notes data')
      return {
        data: parsed.data,
        nextCursor: json.nextCursor,
        nextCursorId: json.nextCursorId,
      }
    },
    initialPageParam: null as { cursor: string; cursorId: string } | null,
    getNextPageParam: (lastPage) =>
      lastPage.nextCursor && lastPage.nextCursorId
        ? { cursor: lastPage.nextCursor, cursorId: lastPage.nextCursorId }
        : undefined,
  })
}

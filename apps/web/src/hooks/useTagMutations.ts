import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { TagSelect } from '@nicenote/shared'
import { tagSelectSchema } from '@nicenote/shared'

import i18n from '../i18n'
import { api, throwApiError } from '../lib/api'
import { useToastStore } from '../store/useToastStore'

import { noteTagsQueryKey } from './useNoteTagsQuery'
import { TAGS_QUERY_KEY } from './useTagsQuery'

function updateTagsCache(
  queryClient: ReturnType<typeof useQueryClient>,
  updater: (tags: TagSelect[]) => TagSelect[]
) {
  queryClient.setQueryData<TagSelect[]>(TAGS_QUERY_KEY, (old) => {
    if (!old) return old
    return updater(old)
  })
}

export function useCreateTag() {
  const queryClient = useQueryClient()
  const addToast = useToastStore((s) => s.addToast)

  return useMutation({
    mutationFn: async (input: { name: string; color?: string | null }) => {
      const res = await api.tags.$post({ json: input })
      if (!res.ok) await throwApiError(res, `Create tag failed: ${res.status}`)
      const json = await res.json()
      const parsed = tagSelectSchema.safeParse(json)
      if (!parsed.success) throw new Error('Invalid tag data')
      return parsed.data
    },
    onSuccess: (newTag) => {
      updateTagsCache(queryClient, (tags) =>
        [...tags, newTag].sort((a, b) => a.name.localeCompare(b.name))
      )
    },
    onError: () => {
      addToast(i18n.t('tag.createError'))
    },
  })
}

export function useUpdateTag() {
  const queryClient = useQueryClient()
  const addToast = useToastStore((s) => s.addToast)

  return useMutation({
    mutationFn: async ({ id, ...body }: { id: string; name?: string; color?: string | null }) => {
      const res = await api.tags[':id'].$patch({ param: { id }, json: body })
      if (!res.ok) await throwApiError(res, `Update tag failed: ${res.status}`)
      const json = await res.json()
      const parsed = tagSelectSchema.safeParse(json)
      if (!parsed.success) throw new Error('Invalid tag data')
      return parsed.data
    },
    onSuccess: (updated) => {
      updateTagsCache(queryClient, (tags) =>
        tags
          .map((t) => (t.id === updated.id ? updated : t))
          .sort((a, b) => a.name.localeCompare(b.name))
      )
    },
    onError: () => {
      addToast(i18n.t('tag.updateError'))
    },
  })
}

export function useDeleteTag() {
  const queryClient = useQueryClient()
  const addToast = useToastStore((s) => s.addToast)

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.tags[':id'].$delete({ param: { id } })
      if (!res.ok) await throwApiError(res, `Delete tag failed: ${res.status}`)
    },
    onSuccess: (_, id) => {
      updateTagsCache(queryClient, (tags) => tags.filter((t) => t.id !== id))
    },
    onError: () => {
      addToast(i18n.t('tag.deleteError'))
    },
  })
}

export function useAddTagToNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ noteId, tagId }: { noteId: string; tagId: string }) => {
      const res = await api.notes[':id'].tags[':tagId'].$post({ param: { id: noteId, tagId } })
      if (!res.ok) await throwApiError(res, `Add tag failed: ${res.status}`)
      return { noteId }
    },
    onSuccess: (_, { noteId }) => {
      queryClient.invalidateQueries({ queryKey: noteTagsQueryKey(noteId) })
    },
  })
}

export function useRemoveTagFromNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ noteId, tagId }: { noteId: string; tagId: string }) => {
      const res = await api.notes[':id'].tags[':tagId'].$delete({ param: { id: noteId, tagId } })
      if (!res.ok) await throwApiError(res, `Remove tag failed: ${res.status}`)
      return { noteId }
    },
    onSuccess: (_, { noteId }) => {
      queryClient.invalidateQueries({ queryKey: noteTagsQueryKey(noteId) })
    },
  })
}

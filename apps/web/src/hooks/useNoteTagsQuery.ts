import { useQuery } from '@tanstack/react-query'

import type { TagSelect } from '@nicenote/shared'
import { tagSelectSchema } from '@nicenote/shared'

import { api, throwApiError } from '../lib/api'

export function noteTagsQueryKey(noteId: string) {
  return ['noteTags', noteId] as const
}

export function useNoteTagsQuery(noteId: string | null) {
  return useQuery({
    queryKey: noteTagsQueryKey(noteId!),
    queryFn: async (): Promise<TagSelect[]> => {
      const res = await api.notes[':id'].tags.$get({ param: { id: noteId! } })
      if (!res.ok) await throwApiError(res, `Failed to fetch note tags: ${res.status}`)
      const json = await res.json()
      const parsed = tagSelectSchema.array().safeParse(json.data)
      if (!parsed.success) throw new Error('Invalid note tags data')
      return parsed.data
    },
    enabled: !!noteId,
  })
}

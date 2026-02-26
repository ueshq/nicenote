import { useQuery } from '@tanstack/react-query'

import type { TagSelect } from '@nicenote/shared'
import { tagSelectSchema } from '@nicenote/shared'

import { api, throwApiError } from '../lib/api'

export const TAGS_QUERY_KEY = ['tags'] as const

export function useTagsQuery() {
  return useQuery({
    queryKey: TAGS_QUERY_KEY,
    queryFn: async (): Promise<TagSelect[]> => {
      const res = await api.tags.$get({})
      if (!res.ok) await throwApiError(res, `Failed to fetch tags: ${res.status}`)
      const json = await res.json()
      const parsed = tagSelectSchema.array().safeParse(json.data)
      if (!parsed.success) throw new Error('Invalid tags data')
      return parsed.data
    },
  })
}

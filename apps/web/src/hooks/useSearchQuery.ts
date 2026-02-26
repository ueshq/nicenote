import { useQuery } from '@tanstack/react-query'

import { noteSearchResultSchema } from '@nicenote/shared'

import { api, throwApiError } from '../lib/api'

export const SEARCH_QUERY_KEY = ['notes', 'search'] as const

export function useSearchQuery(query: string) {
  const trimmed = query.trim()

  return useQuery({
    queryKey: [...SEARCH_QUERY_KEY, trimmed],
    queryFn: async () => {
      const res = await api.notes.search.$get({ query: { q: trimmed } })
      if (!res.ok) await throwApiError(res, `Search failed: ${res.status}`)
      const json = await res.json()
      const parsed = noteSearchResultSchema.array().safeParse(json.data)
      if (!parsed.success) throw new Error('Invalid search data')
      return parsed.data
    },
    enabled: trimmed.length > 0,
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  })
}

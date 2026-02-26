import { useQuery } from '@tanstack/react-query'

import type { FolderSelect } from '@nicenote/shared'
import { folderSelectSchema } from '@nicenote/shared'

import { api, throwApiError } from '../lib/api'

export const FOLDERS_QUERY_KEY = ['folders'] as const

export function useFoldersQuery() {
  return useQuery({
    queryKey: FOLDERS_QUERY_KEY,
    queryFn: async () => {
      const res = await api.folders.$get({})
      if (!res.ok) await throwApiError(res, `Failed to fetch folders: ${res.status}`)
      const json = await res.json()
      const parsed = folderSelectSchema.array().safeParse(json.data)
      if (!parsed.success) throw new Error('Invalid folders data')
      return parsed.data
    },
  })
}

export interface FolderTreeNode extends FolderSelect {
  children: FolderTreeNode[]
}

export function buildFolderTree(folders: FolderSelect[]): FolderTreeNode[] {
  const map = new Map<string, FolderTreeNode>()
  const roots: FolderTreeNode[] = []

  for (const folder of folders) {
    map.set(folder.id, { ...folder, children: [] })
  }

  for (const folder of folders) {
    const node = map.get(folder.id)!
    if (folder.parentId && map.has(folder.parentId)) {
      map.get(folder.parentId)!.children.push(node)
    } else {
      roots.push(node)
    }
  }

  return roots
}

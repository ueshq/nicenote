import JSZip from 'jszip'

import type { NoteSelect } from '@nicenote/shared'

interface FolderInfo {
  id: string
  name: string
  parentId: string | null
}

function sanitizeFilename(name: string): string {
  return name.replace(/[/\\?%*:|"<>]/g, '-').trim() || 'Untitled'
}

export function noteToMarkdown(note: NoteSelect): string {
  const lines: string[] = []
  lines.push(`# ${note.title || 'Untitled'}`)
  lines.push('')
  if (note.content) {
    lines.push(note.content)
  }
  return lines.join('\n')
}

export function exportNoteAsMarkdown(note: NoteSelect): Blob {
  const md = noteToMarkdown(note)
  return new Blob([md], { type: 'text/markdown;charset=utf-8' })
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function buildFolderPath(folderId: string, foldersById: Map<string, FolderInfo>): string {
  const parts: string[] = []
  let current = foldersById.get(folderId)
  while (current) {
    parts.unshift(sanitizeFilename(current.name))
    current = current.parentId ? foldersById.get(current.parentId) : undefined
  }
  return parts.join('/')
}

export async function exportAllNotes(notes: NoteSelect[], folders: FolderInfo[]): Promise<Blob> {
  const zip = new JSZip()

  const foldersById = new Map(folders.map((f) => [f.id, f]))
  const usedNames = new Map<string, number>()

  for (const note of notes) {
    const md = noteToMarkdown(note)
    let baseName = sanitizeFilename(note.title || 'Untitled')

    let dir = ''
    if (note.folderId && foldersById.has(note.folderId)) {
      dir = buildFolderPath(note.folderId, foldersById) + '/'
    }

    const fullKey = dir + baseName
    const count = usedNames.get(fullKey) ?? 0
    usedNames.set(fullKey, count + 1)
    if (count > 0) {
      baseName = `${baseName} (${count})`
    }

    zip.file(`${dir}${baseName}.md`, md)
  }

  return zip.generateAsync({ type: 'blob' })
}

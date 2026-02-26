export interface ParsedNote {
  title: string
  content: string
}

export async function parseMarkdownFile(file: File): Promise<ParsedNote> {
  const text = await file.text()
  const lines = text.split('\n')

  // Try to extract title from first H1
  let title = ''
  let contentStart = 0

  if (lines[0]?.startsWith('# ')) {
    title = lines[0].slice(2).trim()
    // Skip the H1 and any immediately following blank line
    contentStart = 1
    while (contentStart < lines.length && lines[contentStart]?.trim() === '') {
      contentStart++
    }
  } else {
    // Use filename as title (strip .md extension)
    title = file.name.replace(/\.md$/i, '')
  }

  const content = lines.slice(contentStart).join('\n').trimEnd()

  return { title, content }
}

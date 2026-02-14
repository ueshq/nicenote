import { describe, expect, it, vi } from 'vitest'

import {
  hasEditorMarkdownChanged,
  normalizeMarkdownContent,
  readEditorMarkdown,
  writeEditorMarkdown,
} from './serialization'

describe('editor core serialization', () => {
  it('normalizes unknown markdown payload to empty string', () => {
    expect(normalizeMarkdownContent('# title')).toBe('# title')
    expect(normalizeMarkdownContent({ text: 'invalid' })).toBe('')
    expect(normalizeMarkdownContent(null)).toBe('')
  })

  it('reads markdown from active editor only', () => {
    const editor = {
      isDestroyed: false,
      getMarkdown: vi.fn(() => 'hello'),
    }

    expect(readEditorMarkdown(editor as never)).toBe('hello')
    expect(readEditorMarkdown(null)).toBe('')
    expect(readEditorMarkdown({ isDestroyed: true } as never)).toBe('')
  })

  it('writes markdown using markdown content type', () => {
    const setContent = vi.fn()
    const editor = {
      isDestroyed: false,
      commands: { setContent },
    }

    writeEditorMarkdown(editor as never, '# test')
    expect(setContent).toHaveBeenCalledWith('# test', { contentType: 'markdown' })
  })

  it('detects markdown changes', () => {
    const editor = {
      isDestroyed: false,
      getMarkdown: vi.fn(() => 'new'),
    }

    expect(hasEditorMarkdownChanged(editor as never, 'old')).toBe(true)
    expect(hasEditorMarkdownChanged(editor as never, 'new')).toBe(false)
  })
})

import { describe, expect, it, vi } from 'vitest'

import { createEmptyEditorStateSnapshot, getNoteEditorStateSnapshot } from './state'

function createCanChain(canUndo: boolean, canRedo: boolean) {
  return {
    focus: vi.fn(() => ({
      undo: () => ({ run: () => canUndo }),
      redo: () => ({ run: () => canRedo }),
    })),
  }
}

describe('editor core state', () => {
  it('creates empty snapshot defaults', () => {
    expect(createEmptyEditorStateSnapshot()).toEqual({
      canUndo: false,
      canRedo: false,
      marks: {
        bold: false,
        italic: false,
        strike: false,
        code: false,
        link: false,
      },
      nodes: {
        heading1: false,
        heading2: false,
        heading3: false,
        bulletList: false,
        orderedList: false,
        blockquote: false,
      },
    })
  })

  it('returns empty snapshot when editor is missing or destroyed', () => {
    expect(getNoteEditorStateSnapshot(null)).toEqual(createEmptyEditorStateSnapshot())
    expect(getNoteEditorStateSnapshot({ isDestroyed: true } as never)).toEqual(
      createEmptyEditorStateSnapshot()
    )
  })

  it('builds state snapshot from active editor', () => {
    const editor = {
      isDestroyed: false,
      can: () => ({ chain: () => createCanChain(true, false) }),
      isActive: (name: string, attrs?: { level?: number }) => {
        if (name === 'bold') return true
        if (name === 'italic') return false
        if (name === 'strike') return true
        if (name === 'code') return false
        if (name === 'link') return true
        if (name === 'heading' && attrs?.level === 2) return true
        if (name === 'bulletList') return true
        return false
      },
    }

    expect(getNoteEditorStateSnapshot(editor as never)).toEqual({
      canUndo: true,
      canRedo: false,
      marks: {
        bold: true,
        italic: false,
        strike: true,
        code: false,
        link: true,
      },
      nodes: {
        heading1: false,
        heading2: true,
        heading3: false,
        bulletList: true,
        orderedList: false,
        blockquote: false,
      },
    })
  })

  it('falls back to false can-state when capability chain throws', () => {
    const editor = {
      isDestroyed: false,
      can: () => {
        throw new Error('broken can')
      },
      isActive: () => false,
    }

    const snapshot = getNoteEditorStateSnapshot(editor as never)
    expect(snapshot.canUndo).toBe(false)
    expect(snapshot.canRedo).toBe(false)
  })
})

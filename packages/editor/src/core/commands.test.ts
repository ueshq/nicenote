import { describe, expect, it, vi } from 'vitest'

import {
  clearLink,
  isNoteCommandId,
  NOTE_COMMAND_IDS,
  runNoteCommand,
  setLinkHref,
} from './commands'

function createChain(runResult = true) {
  const chain = {
    focus: vi.fn(() => chain),
    undo: vi.fn(() => chain),
    redo: vi.fn(() => chain),
    toggleBold: vi.fn(() => chain),
    toggleItalic: vi.fn(() => chain),
    toggleStrike: vi.fn(() => chain),
    toggleCode: vi.fn(() => chain),
    toggleHeading: vi.fn(() => chain),
    toggleBulletList: vi.fn(() => chain),
    toggleOrderedList: vi.fn(() => chain),
    toggleBlockquote: vi.fn(() => chain),
    extendMarkRange: vi.fn(() => chain),
    setLink: vi.fn(() => chain),
    unsetLink: vi.fn(() => chain),
    run: vi.fn(() => runResult),
  }

  return chain
}

function createEditor(chain = createChain()) {
  return {
    isDestroyed: false,
    chain: vi.fn(() => chain),
  }
}

describe('editor core commands', () => {
  it('checks note command id', () => {
    for (const command of NOTE_COMMAND_IDS) {
      expect(isNoteCommandId(command)).toBe(true)
    }

    expect(isNoteCommandId('heading4')).toBe(false)
    expect(isNoteCommandId(123)).toBe(false)
  })

  it('returns false when editor is null or destroyed', () => {
    expect(runNoteCommand(null, 'bold')).toBe(false)

    const destroyedEditor = { isDestroyed: true }
    expect(runNoteCommand(destroyedEditor as never, 'bold')).toBe(false)
    expect(setLinkHref(destroyedEditor as never, 'https://nicenote.app')).toBe(false)
    expect(clearLink(destroyedEditor as never)).toBe(false)
  })

  it('runs each registered command through chain API', () => {
    const chain = createChain(true)
    const editor = createEditor(chain)

    expect(runNoteCommand(editor as never, 'heading2')).toBe(true)
    expect(chain.focus).toHaveBeenCalledOnce()
    expect(chain.toggleHeading).toHaveBeenCalledWith({ level: 2 })
    expect(chain.run).toHaveBeenCalledOnce()
  })

  it('sets and clears link mark', () => {
    const chain = createChain(true)
    const editor = createEditor(chain)

    expect(setLinkHref(editor as never, '  https://example.com  ')).toBe(true)
    expect(chain.extendMarkRange).toHaveBeenCalledWith('link')
    expect(chain.setLink).toHaveBeenCalledWith({ href: 'https://example.com' })

    expect(clearLink(editor as never)).toBe(true)
    expect(chain.unsetLink).toHaveBeenCalledOnce()
  })

  it('rejects empty link href', () => {
    const chain = createChain(true)
    const editor = createEditor(chain)

    expect(setLinkHref(editor as never, '   ')).toBe(false)
    expect(chain.setLink).not.toHaveBeenCalled()
  })
})

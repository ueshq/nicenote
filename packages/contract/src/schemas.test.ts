import { describe, expect, it } from 'vitest'

import { noteIdParamSchema, noteSelectSchema, noteUpdateSchema } from './schemas'

describe('contract schemas', () => {
  it('validates note select payload with strict ISO datetime', () => {
    const result = noteSelectSchema.safeParse({
      id: 'n1',
      title: 'Title',
      content: 'Hello',
      createdAt: '2026-02-14T01:02:03.000Z',
      updatedAt: '2026-02-14T01:02:03+08:00',
    })

    expect(result.success).toBe(true)
  })

  it('rejects invalid datetime format', () => {
    const result = noteSelectSchema.safeParse({
      id: 'n1',
      title: 'Title',
      content: null,
      createdAt: '2026-02-14',
      updatedAt: '2026-02-14',
    })

    expect(result.success).toBe(false)
  })

  it('requires at least one field for note update and forbids unknown keys', () => {
    expect(noteUpdateSchema.safeParse({}).success).toBe(false)
    expect(noteUpdateSchema.safeParse({ title: 'Next' }).success).toBe(true)
    expect(noteUpdateSchema.safeParse({ content: null }).success).toBe(true)
    expect(noteUpdateSchema.safeParse({ title: 'Next', extra: true }).success).toBe(false)
  })

  it('validates note id route param', () => {
    expect(noteIdParamSchema.safeParse({ id: 'abc' }).success).toBe(true)
    expect(noteIdParamSchema.safeParse({ id: '' }).success).toBe(false)
  })
})

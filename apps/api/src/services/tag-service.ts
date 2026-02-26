import { drizzle } from 'drizzle-orm/d1'
import { and, eq } from 'drizzle-orm/sql/expressions/conditions'
import { asc } from 'drizzle-orm/sql/expressions/select'

import type { TagContractService } from '@nicenote/shared'

import { noteTags, tags } from '../db/schema'

import type { NoteServiceBindings } from './note-service'

const TAG_SELECT_COLUMNS = {
  id: tags.id,
  name: tags.name,
  color: tags.color,
  createdAt: tags.createdAt,
} as const

export function createTagService(bindings: NoteServiceBindings): TagContractService {
  const db = drizzle(bindings.DB)

  return {
    list: async () => {
      return db.select(TAG_SELECT_COLUMNS).from(tags).orderBy(asc(tags.name)).all()
    },

    getById: async (id) => {
      const result = await db.select(TAG_SELECT_COLUMNS).from(tags).where(eq(tags.id, id)).get()
      return result ?? null
    },

    create: async (body) => {
      const values = {
        name: body.name,
        color: body.color ?? null,
      }
      return db.insert(tags).values(values).returning(TAG_SELECT_COLUMNS).get()
    },

    update: async (id, body) => {
      const updates: Record<string, unknown> = {}

      if (body.name !== undefined) updates.name = body.name
      if (body.color !== undefined) updates.color = body.color

      const result = await db
        .update(tags)
        .set(updates)
        .where(eq(tags.id, id))
        .returning(TAG_SELECT_COLUMNS)
        .get()
      return result ?? null
    },

    remove: async (id) => {
      const deleted = await db.delete(tags).where(eq(tags.id, id)).returning({ id: tags.id }).get()
      return !!deleted
    },

    addTagToNote: async (noteId, tagId) => {
      try {
        await db.insert(noteTags).values({ noteId, tagId }).run()
        return true
      } catch {
        // Duplicate or FK violation
        return false
      }
    },

    removeTagFromNote: async (noteId, tagId) => {
      const deleted = await db
        .delete(noteTags)
        .where(and(eq(noteTags.noteId, noteId), eq(noteTags.tagId, tagId)))
        .returning({ noteId: noteTags.noteId })
        .get()
      return !!deleted
    },

    getTagsForNote: async (noteId) => {
      const rows = await db
        .select(TAG_SELECT_COLUMNS)
        .from(noteTags)
        .innerJoin(tags, eq(noteTags.tagId, tags.id))
        .where(eq(noteTags.noteId, noteId))
        .orderBy(asc(tags.name))
        .all()
      return rows
    },
  }
}

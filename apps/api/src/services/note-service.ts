import { drizzle } from 'drizzle-orm/d1'
import { sql } from 'drizzle-orm/sql'
import { and, eq, inArray, lt, or } from 'drizzle-orm/sql/expressions/conditions'
import { desc } from 'drizzle-orm/sql/expressions/select'

import {
  DEFAULT_NOTE_TITLE,
  generateSummary,
  type NoteContractService,
  type NoteSearchResult,
  sanitizeContent,
} from '@nicenote/shared'

import { notes, noteTags } from '../db/schema'

export type NoteServiceBindings = {
  DB: Parameters<typeof drizzle>[0]
}

type DrizzleNoteInsert = typeof notes.$inferInsert

// Columns returned for single-note endpoints (matches NoteSelect contract)
const NOTE_SELECT_COLUMNS = {
  id: notes.id,
  title: notes.title,
  content: notes.content,
  folderId: notes.folderId,
  createdAt: notes.createdAt,
  updatedAt: notes.updatedAt,
} as const

export function createNoteService(bindings: NoteServiceBindings): NoteContractService {
  const db = drizzle(bindings.DB)

  return {
    list: async ({ cursor, cursorId, limit, folderId, tagId }) => {
      const conditions = []

      // Cursor pagination
      if (cursor && cursorId) {
        conditions.push(
          or(lt(notes.updatedAt, cursor), and(eq(notes.updatedAt, cursor), lt(notes.id, cursorId)))!
        )
      } else if (cursor) {
        conditions.push(lt(notes.updatedAt, cursor))
      }

      // Folder filter
      if (folderId) {
        conditions.push(eq(notes.folderId, folderId))
      }

      // Tag filter: find note IDs that have this tag, then filter
      if (tagId) {
        const taggedNoteIds = await db
          .select({ noteId: noteTags.noteId })
          .from(noteTags)
          .where(eq(noteTags.tagId, tagId))
          .all()
        const ids = taggedNoteIds.map((r) => r.noteId)
        if (ids.length === 0) return { data: [], nextCursor: null, nextCursorId: null }
        conditions.push(inArray(notes.id, ids))
      }

      const where = conditions.length > 0 ? and(...conditions) : undefined

      const rows = await db
        .select({
          id: notes.id,
          title: notes.title,
          summary: notes.summary,
          folderId: notes.folderId,
          createdAt: notes.createdAt,
          updatedAt: notes.updatedAt,
        })
        .from(notes)
        .where(where)
        .orderBy(desc(notes.updatedAt), desc(notes.id))
        .limit(limit + 1)
        .all()
      const hasMore = rows.length > limit
      const data = hasMore ? rows.slice(0, limit) : rows
      const last = data[data.length - 1]
      const nextCursor = hasMore && last ? last.updatedAt : null
      const nextCursorId = hasMore && last ? last.id : null
      return { data, nextCursor, nextCursorId }
    },

    getById: async (id) => {
      const result = await db.select(NOTE_SELECT_COLUMNS).from(notes).where(eq(notes.id, id)).get()
      return result ?? null
    },

    create: async (body) => {
      const sanitized = sanitizeContent(body.content ?? '')
      const values: Pick<DrizzleNoteInsert, 'title' | 'content' | 'summary' | 'folderId'> = {
        title: body.title || DEFAULT_NOTE_TITLE,
        content: sanitized,
        summary: generateSummary(sanitized),
        folderId: body.folderId ?? null,
      }
      const result = await db.insert(notes).values(values).returning(NOTE_SELECT_COLUMNS).get()

      // Sync FTS
      await db.run(
        sql`INSERT INTO notes_fts (id, title, content, summary) VALUES (${result.id}, ${values.title}, ${values.content}, ${values.summary})`
      )

      return result
    },

    update: async (id, body) => {
      const updates: Pick<DrizzleNoteInsert, 'updatedAt'> &
        Partial<Pick<DrizzleNoteInsert, 'title' | 'content' | 'summary' | 'folderId'>> = {
        updatedAt: new Date().toISOString(),
      }

      if (body.title !== undefined) {
        updates.title = body.title
      }

      if (body.content !== undefined && body.content !== null) {
        const sanitized = sanitizeContent(body.content)
        updates.content = sanitized
        updates.summary = generateSummary(sanitized)
      }

      if (body.folderId !== undefined) {
        updates.folderId = body.folderId
      }

      const result = await db
        .update(notes)
        .set(updates)
        .where(eq(notes.id, id))
        .returning(NOTE_SELECT_COLUMNS)
        .get()

      // Sync FTS
      if (result) {
        const ftsUpdates: string[] = []
        if (updates.title !== undefined) ftsUpdates.push('title')
        if (updates.content !== undefined) ftsUpdates.push('content')
        if (updates.summary !== undefined) ftsUpdates.push('summary')
        if (ftsUpdates.length > 0) {
          await db.run(
            sql`UPDATE notes_fts SET title = ${result.title}, content = ${result.content ?? ''}, summary = ${updates.summary ?? ''} WHERE id = ${id}`
          )
        }
      }

      return result ?? null
    },

    remove: async (id) => {
      const deleted = await db
        .delete(notes)
        .where(eq(notes.id, id))
        .returning({ id: notes.id })
        .get()

      // Sync FTS
      if (deleted) {
        await db.run(sql`DELETE FROM notes_fts WHERE id = ${id}`)
      }

      return !!deleted
    },

    search: async ({ q, limit }) => {
      const ftsQuery = q.replace(/['"]/g, '').trim() + '*'
      const rows = await db.all<NoteSearchResult>(
        sql`SELECT n.id, n.title, n.folder_id AS folderId, n.created_at AS createdAt, n.updated_at AS updatedAt, n.summary, snippet(notes_fts, 2, '<mark>', '</mark>', '...', 32) AS snippet FROM notes_fts fts INNER JOIN notes n ON n.id = fts.id WHERE notes_fts MATCH ${ftsQuery} ORDER BY rank LIMIT ${limit}`
      )
      return rows
    },
  }
}

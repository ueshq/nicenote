import type { AnySQLiteColumn } from 'drizzle-orm/sqlite-core'
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

import { DEFAULT_NOTE_TITLE } from '@nicenote/shared'

// ──────────────────────────────────────────────────────────────────────────────
// Folders
// ──────────────────────────────────────────────────────────────────────────────

export const folders = sqliteTable(
  'folders',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    parentId: text('parent_id').references((): AnySQLiteColumn => folders.id, {
      onDelete: 'cascade',
    }),
    position: integer('position').default(0).notNull(),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [index('idx_folders_parent').on(table.parentId)]
)

// ──────────────────────────────────────────────────────────────────────────────
// Notes
// ──────────────────────────────────────────────────────────────────────────────

export const notes = sqliteTable(
  'notes',
  {
    id: text('id').primaryKey(),
    title: text('title').default(DEFAULT_NOTE_TITLE).notNull(),
    content: text('content'),
    summary: text('summary'),
    folderId: text('folder_id').references(() => folders.id, { onDelete: 'set null' }),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [
    index('idx_notes_cursor').on(table.updatedAt, table.id),
    index('idx_notes_folder').on(table.folderId),
  ]
)

// ──────────────────────────────────────────────────────────────────────────────
// Tags
// ──────────────────────────────────────────────────────────────────────────────

export const tags = sqliteTable('tags', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  color: text('color'),
  createdAt: text('created_at').notNull(),
})

// ──────────────────────────────────────────────────────────────────────────────
// Note-Tags junction
// ──────────────────────────────────────────────────────────────────────────────

export const noteTags = sqliteTable(
  'note_tags',
  {
    noteId: text('note_id')
      .notNull()
      .references(() => notes.id, { onDelete: 'cascade' }),
    tagId: text('tag_id')
      .notNull()
      .references(() => tags.id, { onDelete: 'cascade' }),
  },
  (table) => [
    index('idx_note_tags_note').on(table.noteId),
    index('idx_note_tags_tag').on(table.tagId),
  ]
)

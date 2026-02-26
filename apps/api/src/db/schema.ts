import type { AnySQLiteColumn } from 'drizzle-orm/sqlite-core'
import { index, integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { nanoid } from 'nanoid'

import { DEFAULT_NOTE_TITLE } from '@nicenote/shared'

export const folders = sqliteTable(
  'folders',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => nanoid()),
    name: text('name').notNull(),
    parentId: text('parent_id').references((): AnySQLiteColumn => folders.id, {
      onDelete: 'cascade',
    }),
    position: integer('position').default(0).notNull(),
    createdAt: text('created_at')
      .$defaultFn(() => new Date().toISOString())
      .notNull(),
    updatedAt: text('updated_at')
      .$defaultFn(() => new Date().toISOString())
      .notNull(),
  },
  (table) => [index('idx_folders_parent').on(table.parentId)]
)

export const notes = sqliteTable(
  'notes',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => nanoid()),
    title: text('title').default(DEFAULT_NOTE_TITLE).notNull(),
    content: text('content'), // Markdown
    summary: text('summary'),
    folderId: text('folder_id').references(() => folders.id, { onDelete: 'set null' }),
    createdAt: text('created_at')
      .$defaultFn(() => new Date().toISOString())
      .notNull(),
    updatedAt: text('updated_at')
      .$defaultFn(() => new Date().toISOString())
      .notNull(),
  },
  (table) => [
    index('idx_notes_cursor').on(table.updatedAt, table.id),
    index('idx_notes_folder').on(table.folderId),
  ]
)

export const tags = sqliteTable('tags', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => nanoid()),
  name: text('name').notNull().unique(),
  color: text('color'),
  createdAt: text('created_at')
    .$defaultFn(() => new Date().toISOString())
    .notNull(),
})

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
    primaryKey({ columns: [table.noteId, table.tagId] }),
    index('idx_note_tags_note').on(table.noteId),
    index('idx_note_tags_tag').on(table.tagId),
  ]
)

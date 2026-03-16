import type { NoteService } from '@nicenote/database'
import { getDatabase } from '@nicenote/database'
import { NoteService as NoteServiceImpl } from '@nicenote/database'
import type { NoteRepository } from '@nicenote/domain'
import type {
  NoteCreateInput,
  NoteListQuery,
  NoteListResult,
  NoteSearchQuery,
  NoteSearchResult,
  NoteSelect,
  NoteUpdateInput,
} from '@nicenote/shared'
import { generateSummary } from '@nicenote/shared'

function svc(): NoteService {
  return new NoteServiceImpl(getDatabase())
}

/**
 * 基于 op-sqlite 的 NoteRepository 实现（Mobile 端）
 */
export class SqliteNoteRepository implements NoteRepository {
  async list(query: NoteListQuery): Promise<NoteListResult> {
    const limit = query.limit ?? 50
    const cursor =
      query.cursor && query.cursorId ? { updatedAt: query.cursor, id: query.cursorId } : undefined

    const result = svc().list({
      folderId: query.folderId,
      cursor,
      limit,
    })

    return {
      data: result.data.map((n) => ({
        id: n.id,
        title: n.title,
        summary: n.summary ?? null,
        folderId: n.folderId,
        createdAt: n.createdAt,
        updatedAt: n.updatedAt,
        tags: [] as string[],
      })),
      nextCursor: result.nextCursor?.split('__')[0] ?? null,
      nextCursorId: result.nextCursor?.split('__')[1] ?? null,
    }
  }

  async get(id: string): Promise<NoteSelect | null> {
    const row = svc().getById(id)
    if (!row) return null
    return {
      id: row.id,
      title: row.title,
      content: row.content,
      folderId: row.folderId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }
  }

  async create(input: NoteCreateInput): Promise<NoteSelect> {
    const row = svc().create({
      title: input.title,
      content: input.content,
      folderId: input.folderId,
    })
    return {
      id: row.id,
      title: row.title,
      content: row.content,
      folderId: row.folderId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }
  }

  async update(id: string, input: NoteUpdateInput): Promise<NoteSelect> {
    const row = svc().update(id, {
      title: input.title,
      content: input.content,
      folderId: input.folderId,
    })
    if (!row) throw new Error(`笔记不存在: ${id}`)
    return {
      id: row.id,
      title: row.title,
      content: row.content,
      folderId: row.folderId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }
  }

  async delete(id: string): Promise<void> {
    svc().delete(id)
  }

  async search(query: NoteSearchQuery): Promise<NoteSearchResult[]> {
    const rows = svc().search({ query: query.q, limit: query.limit })
    return rows.map((n) => ({
      id: n.id,
      title: n.title,
      summary: n.summary ?? generateSummary(n.title) ?? null,
      folderId: n.folderId,
      createdAt: n.createdAt,
      updatedAt: n.updatedAt,
      tags: [] as string[],
      snippet: '',
    }))
  }
}

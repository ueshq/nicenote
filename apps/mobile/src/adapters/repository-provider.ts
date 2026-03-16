import { createRepositoryProvider } from '@nicenote/app-shell'

import { SqliteNoteRepository } from './sqlite-note-repository'

const provider = createRepositoryProvider<SqliteNoteRepository>()

/** 初始化 Mobile 端 NoteRepository 单例 */
export function initRepository(): void {
  provider.set(new SqliteNoteRepository())
}

/** 获取 Mobile 端 NoteRepository 单例 */
export function getRepository(): SqliteNoteRepository {
  const repo = provider.get()
  if (!repo) throw new Error('NoteRepository 未初始化')
  return repo
}

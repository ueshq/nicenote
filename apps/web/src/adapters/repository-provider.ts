import { createRepositoryProvider } from '@nicenote/app-shell'

import { LocalStorageNoteRepository } from './local-storage-note-repository'

const provider = createRepositoryProvider<LocalStorageNoteRepository>()

// Web 端启动时初始化单例
provider.set(new LocalStorageNoteRepository())

/** 获取 Web 端 NoteRepository 单例 */
export function getRepository(): LocalStorageNoteRepository {
  const repo = provider.get()
  if (!repo) throw new Error('NoteRepository 未初始化')
  return repo
}

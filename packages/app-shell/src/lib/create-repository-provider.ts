import type { NoteRepository } from '@nicenote/domain'

/**
 * 创建 NoteRepository 单例 provider 工厂
 *
 * 各端传入自己的 Repository 构造逻辑，工厂返回标准的 get/reset 函数。
 * Web 端在初始化时 create 一次，Desktop 端在切换文件夹时 create 新实例。
 */
export function createRepositoryProvider<T extends NoteRepository>() {
  let current: T | null = null

  return {
    /** 设置（或替换）当前 Repository 实例 */
    set(repo: T): T {
      current = repo
      return repo
    },

    /** 获取当前 Repository 实例（未初始化时为 null） */
    get(): T | null {
      return current
    },

    /** 重置为 null */
    reset(): void {
      current = null
    },
  }
}

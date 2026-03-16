import { describe, expect, it } from 'vitest'

import type { NoteRepository } from '../note-repository'

/**
 * NoteRepository 契约测试
 *
 * 各端的 Repository 实现可调用此函数来验证是否满足接口约定。
 * 用法:
 *   testNoteRepositoryContract(() => new MyNoteRepository())
 */
export function testNoteRepositoryContract(factory: () => NoteRepository) {
  describe('NoteRepository contract', () => {
    it('create → get 返回一致数据', async () => {
      const repo = factory()
      const created = await repo.create({ title: '测试笔记' })

      expect(created.id).toBeTruthy()
      expect(created.title).toBe('测试笔记')
      expect(created.createdAt).toBeTruthy()
      expect(created.updatedAt).toBeTruthy()

      const fetched = await repo.get(created.id)
      expect(fetched).not.toBeNull()
      expect(fetched!.id).toBe(created.id)
      expect(fetched!.title).toBe('测试笔记')
    })

    it('update 修改标题后 get 返回新标题', async () => {
      const repo = factory()
      const created = await repo.create({ title: '原始标题' })
      const updated = await repo.update(created.id, { title: '新标题' })

      expect(updated.title).toBe('新标题')

      const fetched = await repo.get(created.id)
      expect(fetched!.title).toBe('新标题')
    })

    it('delete 后 get 返回 null', async () => {
      const repo = factory()
      const created = await repo.create({ title: '待删除' })

      await repo.delete(created.id)

      const fetched = await repo.get(created.id)
      expect(fetched).toBeNull()
    })

    it('list 返回 data 数组和分页游标', async () => {
      const repo = factory()
      await repo.create({ title: '笔记 A' })
      await repo.create({ title: '笔记 B' })

      const result = await repo.list({ limit: 10 })
      expect(Array.isArray(result.data)).toBe(true)
      expect(result.data.length).toBeGreaterThanOrEqual(2)
    })

    it('search 返回匹配结果', async () => {
      const repo = factory()
      await repo.create({ title: '搜索目标', content: '这是一段特殊内容用于搜索测试' })

      const results = await repo.search({ q: '特殊内容', limit: 10 })
      expect(results.length).toBeGreaterThanOrEqual(1)
      expect(results[0]!.title).toBe('搜索目标')
    })
  })
}

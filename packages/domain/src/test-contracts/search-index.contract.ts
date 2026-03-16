import { describe, expect, it } from 'vitest'

import type { SearchIndex } from '../search-index'

/**
 * SearchIndex 契约测试
 *
 * 各端的搜索索引实现可调用此函数来验证是否满足接口约定。
 * 用法:
 *   testSearchIndexContract({
 *     factory: () => new MySearchIndex(),
 *     seed: async (index) => { ... }, // 可选：向索引注入测试数据
 *   })
 */
export function testSearchIndexContract(opts: {
  factory: () => SearchIndex
  seed?: (index: SearchIndex) => Promise<void>
}) {
  describe('SearchIndex contract', () => {
    it('search 返回数组', async () => {
      const index = opts.factory()
      if (opts.seed) await opts.seed(index)

      const results = await index.search({ q: 'test', limit: 10 })
      expect(Array.isArray(results)).toBe(true)
    })

    it('空查询返回空数组', async () => {
      const index = opts.factory()
      if (opts.seed) await opts.seed(index)

      const results = await index.search({ q: '', limit: 10 })
      expect(results).toEqual([])
    })

    it('结果包含必需字段', async () => {
      const index = opts.factory()
      if (opts.seed) await opts.seed(index)

      const results = await index.search({ q: 'test', limit: 10 })
      for (const r of results) {
        expect(r.id).toBeTruthy()
        expect(typeof r.title).toBe('string')
        expect(r.createdAt).toBeTruthy()
        expect(r.updatedAt).toBeTruthy()
      }
    })

    it('limit 参数限制结果数量', async () => {
      const index = opts.factory()
      if (opts.seed) await opts.seed(index)

      const results = await index.search({ q: 'test', limit: 1 })
      expect(results.length).toBeLessThanOrEqual(1)
    })
  })
}

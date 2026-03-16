import { describe, expect, it } from 'vitest'

import type { SettingsRepository } from '../settings-repository'

/**
 * SettingsRepository 契约测试
 *
 * 各端的设置仓储实现可调用此函数来验证是否满足接口约定。
 * 用法:
 *   testSettingsRepositoryContract(() => new MySettingsRepository())
 */
export function testSettingsRepositoryContract(factory: () => SettingsRepository) {
  describe('SettingsRepository contract', () => {
    it('get 返回包含 theme 和 language 的对象', async () => {
      const repo = factory()
      const settings = await repo.get()

      expect(typeof settings.theme).toBe('string')
      expect(typeof settings.language).toBe('string')
    })

    it('save 后 get 返回更新后的值', async () => {
      const repo = factory()

      await repo.save({ theme: 'dark', language: 'en' })
      const settings = await repo.get()

      expect(settings.theme).toBe('dark')
      expect(settings.language).toBe('en')
    })

    it('多次 save 以最后一次为准', async () => {
      const repo = factory()

      await repo.save({ theme: 'light', language: 'zh' })
      await repo.save({ theme: 'dark', language: 'en' })

      const settings = await repo.get()
      expect(settings.theme).toBe('dark')
      expect(settings.language).toBe('en')
    })
  })
}

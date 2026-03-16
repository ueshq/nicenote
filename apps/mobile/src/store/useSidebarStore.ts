import { createSidebarStore } from '@nicenote/app-shell'

/**
 * Mobile 侧边栏 store（复用 app-shell 工厂）
 *
 * React Native 中 localStorage 不可用，工厂内部的 try/catch 会静默跳过持久化，
 * 侧边栏状态仅保留在内存中。
 */
export const useSidebarStore = createSidebarStore({ storageKeyPrefix: 'nicenote-mobile' })

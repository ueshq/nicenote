import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  'packages/app-shell',
  'packages/editor',
  'packages/shared',
  'apps/web',
])

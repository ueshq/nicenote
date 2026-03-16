import { exec } from 'node:child_process'

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

/** 监听 tokens 源文件变化，自动重新生成 CSS */
function tokensHotReload(): Plugin {
  let pending: ReturnType<typeof setTimeout> | null = null

  return {
    name: 'nicenote:tokens-hot-reload',
    configureServer(server) {
      server.watcher.add('../../packages/tokens/src')
      server.watcher.on('change', (path) => {
        if (!path.includes('packages/tokens/src')) return
        if (pending) clearTimeout(pending)
        pending = setTimeout(() => {
          pending = null
          exec('pnpm --filter @nicenote/tokens build', { cwd: server.config.root }, (err) => {
            if (err) {
              server.config.logger.error(`[tokens] rebuild failed: ${err.message}`)
            } else {
              server.config.logger.info('[tokens] rebuilt successfully')
            }
          })
        }, 200)
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), tokensHotReload()],
  server: {
    port: 5173,
    strictPort: true,
  },
})

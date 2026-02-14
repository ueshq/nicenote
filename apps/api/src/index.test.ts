import { describe, expect, it } from 'vitest'

import app from './index'

describe('api cors', () => {
  it('returns CORS header for browser requests', async () => {
    const res = await app.request('/', {
      method: 'GET',
      headers: {
        Origin: 'https://nicenote.app',
      },
    })

    expect(res.status).toBe(200)
    expect(res.headers.get('access-control-allow-origin')).toBe('*')
  })
})

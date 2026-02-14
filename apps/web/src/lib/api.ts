import type { AppType } from 'api'
import { hc } from 'hono/client'

const apiBaseUrl = import.meta.env.VITE_API_URL?.trim() || '/api'

const client = hc<AppType>(apiBaseUrl)

export const api = client

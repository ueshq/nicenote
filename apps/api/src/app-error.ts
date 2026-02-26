import type { Context } from 'hono'
import type { ContentfulStatusCode } from 'hono/utils/http-status'

import type { ApiMessageKey } from './i18n'
import { resolveLocale, t } from './i18n'

export class AppError extends Error {
  readonly messageKey: ApiMessageKey
  readonly status: ContentfulStatusCode

  constructor(messageKey: ApiMessageKey, status: ContentfulStatusCode = 500, cause?: unknown) {
    super(messageKey, { cause })
    this.messageKey = messageKey
    this.status = status
  }
}

export function handleAppError(err: Error, c: Context) {
  const locale = resolveLocale(c.req.header('accept-language'))

  if (err instanceof AppError) {
    console.error(`[${c.req.method} ${c.req.path}] ${err.messageKey}`, err.cause ?? '')
    return c.json({ error: t(err.messageKey, locale) }, err.status)
  }

  console.error(`[${c.req.method} ${c.req.path}] Unhandled:`, err)
  return c.json({ error: t('internalServerError', locale) }, 500)
}

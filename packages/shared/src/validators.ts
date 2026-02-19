/**
 * validators.ts — link validation
 */

const LINK_ALLOWED_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:'])

export type LinkValidationErrorKey =
  | 'validation.linkEmpty'
  | 'validation.linkTooLong'
  | 'validation.linkInvalidFormat'
  | 'validation.linkUnsupportedProtocol'

/**
 * Validate a link URL.
 * Returns a translation key on error, null on success.
 */
export function getLinkValidationError(rawHref: string): LinkValidationErrorKey | null {
  const href = rawHref.trim()

  if (!href) return 'validation.linkEmpty'
  if (href.length > 2048) return 'validation.linkTooLong'

  let parsedUrl: URL
  try {
    parsedUrl = new URL(href)
  } catch {
    return 'validation.linkInvalidFormat'
  }

  if (!LINK_ALLOWED_PROTOCOLS.has(parsedUrl.protocol)) {
    return 'validation.linkUnsupportedProtocol'
  }

  return null
}

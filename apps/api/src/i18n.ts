export type ApiMessageKey = 'notFound' | 'tooManyRequests' | 'internalServerError'

const translations: Record<string, Record<ApiMessageKey, string>> = {
  en: {
    notFound: 'Not found',
    tooManyRequests: 'Too Many Requests',
    internalServerError: 'Internal Server Error',
  },
  zh: {
    notFound: '\u672a\u627e\u5230',
    tooManyRequests: '\u8bf7\u6c42\u8fc7\u4e8e\u9891\u7e41',
    internalServerError: '\u670d\u52a1\u5668\u5185\u90e8\u9519\u8bef',
  },
}

export function resolveLocale(acceptLanguage: string | undefined): string {
  if (!acceptLanguage) return 'en'
  const primary = acceptLanguage.split(',')[0]?.trim().split(';')[0]?.trim() ?? ''
  if (primary.startsWith('zh')) return 'zh'
  return 'en'
}

export function t(key: ApiMessageKey, locale: string): string {
  return translations[locale]?.[key] ?? translations.en[key]
}

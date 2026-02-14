/**
 * @nicenote/shared — 入口
 *
 * 所有工具函数和通用类型的统一出口
 * 消费者只需要: import { request, storage, ... } from '@nicenote/shared'
 */

// ============================================================
// 工具函数
// ============================================================
export { debounce, throttle } from './debounce'
export { deepClone } from './deepClone'
export {
  diffDays,
  format,
  formatDate,
  formatDateCN,
  formatDateTime,
  formatDateUS,
  formatTime,
  isToday,
  isValidDate,
  timeAgo,
} from './formatDate'
export type { ParsedUrl } from './parsers'
export {
  parseQuery,
  parseUrl,
  safeJsonParse,
  toCamelCase,
  toConstantCase,
  toKebabCase,
  toPascalCase,
  toQuery,
  truncate,
} from './parsers'
export {
  randomFloat,
  randomId,
  randomInt,
  randomPick,
  randomSample,
  shuffle,
  weightedRandom,
} from './random'
export type { RequestConfig, ApiResponse as RequestResponse } from './request'
export { ApiError, Request, request } from './request'
export { sleep, SleepAbortError } from './sleep'
export type { StorageAdapter } from './storage'
export { createAsyncStorageAdapter, Storage, storage, WebStorageAdapter } from './storage'
export type { PasswordStrength, ValidationResult } from './validators'
export {
  email,
  getLinkValidationError,
  lengthRange,
  maxLength,
  minLength,
  numeric,
  password,
  phone,
  positiveInteger,
  required,
  url,
  validate,
} from './validators'

// ============================================================
// 平台 & 快捷键
// ============================================================
export { formatShortcutKey, isMac, MAC_SYMBOLS, parseShortcutKeys } from './platform'

// ============================================================
// 领域 Schema & 类型
// ============================================================
export type {
  NoteContractService,
  NoteCreateInput,
  NoteInsert,
  NoteSelect,
  NoteUpdateInput,
} from './schemas'
export {
  noteCreateSchema,
  noteIdParamSchema,
  noteInsertSchema,
  noteSelectSchema,
  noteUpdateSchema,
} from './schemas'

// ============================================================
// 常量
// ============================================================
export {
  API_RETRIES,
  API_RETRY_DELAY,
  API_TIMEOUT,
  CACHE_TTL,
  HTTP_STATUS_MESSAGES,
  INPUT_LIMITS,
  PAGE_SIZE_DEFAULT,
  PAGE_SIZE_MAX,
  PAGE_SIZE_OPTIONS,
  REGEX,
  STORAGE_KEYS,
  TOKEN_REFRESH_THRESHOLD,
} from './constants'

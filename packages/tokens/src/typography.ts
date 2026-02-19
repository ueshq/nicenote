/**
 * Design Tokens — Typography
 */

export const FONT_SANS_STACK =
  "'DM Sans', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Noto Sans SC', 'Noto Sans CJK SC', 'Source Han Sans SC', 'Helvetica Neue', Arial, sans-serif"

export const FONT_MONO_STACK =
  "'JetBrainsMono', 'SFMono-Regular', 'SF Mono', 'Cascadia Mono', 'Segoe UI Mono', 'Roboto Mono', 'Noto Sans Mono CJK SC', 'Source Han Mono SC', Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"

export const fontSize = {
  caption: { size: 10, lineHeight: 14 },
  meta: { size: 11, lineHeight: 16 },
  xs: { size: 12, lineHeight: 16 },
  sm: { size: 14, lineHeight: 20 },
  button: { size: 15, lineHeight: 20 },
  base: { size: 16, lineHeight: 24 },
  md: { size: 18, lineHeight: 24 },
  lg: { size: 20, lineHeight: 28 },
  xl: { size: 24, lineHeight: 32 },
} as const

export const fontWeight = {
  regular: 400,
  medium: 500,
  semiBold: 600,
  bold: 700,
} as const

export type FontSize = typeof fontSize
export type FontWeight = typeof fontWeight

/**
 * Design Tokens — Z-Index
 */

export const zIndex = {
  dropdown: 70,
  popover: 80,
  modal: 90,
} as const

export type ZIndex = typeof zIndex
export type ZIndexKey = keyof ZIndex

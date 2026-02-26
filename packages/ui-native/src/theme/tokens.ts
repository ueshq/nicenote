// TODO: Map design tokens from @nicenote/tokens to React Native compatible values
//
// Design tokens are defined in packages/tokens and compiled to CSS variables
// for the web app. For React Native, we need to map them to plain JS objects
// that can be used with NativeWind or StyleSheet.create().
//
// This module will:
//   1. Import raw token values from @nicenote/tokens
//   2. Convert CSS-oriented values to RN-compatible formats
//      (e.g., rem -> number, CSS shadows -> RN shadow props)
//   3. Export themed color palettes for light/dark modes
//   4. Export spacing, typography, and border radius scales

export const colors = {
  light: {
    background: '#ffffff',
    foreground: '#0a0a0a',
    primary: '#171717',
    primaryForeground: '#fafafa',
    muted: '#f5f5f5',
    mutedForeground: '#737373',
    border: '#e5e5e5',
    destructive: '#ef4444',
    // TODO: Complete color mapping from design tokens
  },
  dark: {
    background: '#0a0a0a',
    foreground: '#fafafa',
    primary: '#fafafa',
    primaryForeground: '#171717',
    muted: '#262626',
    mutedForeground: '#a3a3a3',
    border: '#262626',
    destructive: '#dc2626',
    // TODO: Complete color mapping from design tokens
  },
} as const

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  // TODO: Align with design token spacing scale
} as const

export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  // TODO: Align with design token typography scale
} as const

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  full: 9999,
  // TODO: Align with design token border radius scale
} as const

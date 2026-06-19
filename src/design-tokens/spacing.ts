/**
 * MiniMax Design System — Spacing Tokens
 *
 * 8px base grid. All margins, padding, and gaps align to this system.
 * Border radius scale: 8px (small) → 24px (extra large) → 9999px (pill).
 */

export const spacing = {
  xxxs: 4,
  xxs: 8,
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 28,
  xxl: 32,
  xxxl: 40,
  huge: 48,
  massive: 64,
} as const

export const radii = {
  sm: 8,
  md: 13,
  lg: 16,
  xl: 20,
  xxl: 24,
  pill: 9999,
} as const

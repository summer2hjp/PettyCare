/**
 * 8pt Grid Spacing System
 *
 * Apple HIG recommends an 8px base grid.
 * All margins, padding, and gaps align to this system.
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
  md: 10,
  lg: 12,
  xl: 16,
  xxl: 20,
  full: 9999,
} as const

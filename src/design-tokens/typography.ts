/**
 * SF Pro Font Size Hierarchy
 *
 * Mirrors Apple's typography scale from the HIG.
 * Primary consumption: Tailwind classes (text-apple-body, etc.)
 * These JS exports are for programmatic use (charts, canvas, etc.).
 */

export interface AppleFontLevel {
  fontSize: number
  lineHeight: number
  fontWeight: 400 | 500 | 600 | 700
  letterSpacing?: number
}

export const appleTypography = {
  largeTitle: { fontSize: 34, lineHeight: 41, fontWeight: 700, letterSpacing: 0.37 },
  title1: { fontSize: 28, lineHeight: 34, fontWeight: 700, letterSpacing: 0.36 },
  title2: { fontSize: 22, lineHeight: 28, fontWeight: 700, letterSpacing: 0.35 },
  title3: { fontSize: 20, lineHeight: 25, fontWeight: 600, letterSpacing: 0.34 },
  headline: { fontSize: 17, lineHeight: 22, fontWeight: 600, letterSpacing: -0.41 },
  body: { fontSize: 17, lineHeight: 22, fontWeight: 400, letterSpacing: -0.41 },
  callout: { fontSize: 16, lineHeight: 21, fontWeight: 400, letterSpacing: -0.32 },
  subhead: { fontSize: 15, lineHeight: 20, fontWeight: 400, letterSpacing: -0.24 },
  footnote: { fontSize: 13, lineHeight: 18, fontWeight: 400, letterSpacing: -0.08 },
  caption1: { fontSize: 12, lineHeight: 16, fontWeight: 400, letterSpacing: 0 },
  caption2: { fontSize: 11, lineHeight: 13, fontWeight: 400, letterSpacing: 0.07 },
} as const satisfies Record<string, AppleFontLevel>

export type AppleFontLevelName = keyof typeof appleTypography

/**
 * MiniMax Design System — Typography Tokens
 *
 * Multi-font system: DM Sans (UI), Outfit (display), Poppins (mid-tier), Roboto (data).
 * Primary consumption: Tailwind classes (text-mm-body, font-display, etc.)
 * These JS exports are for programmatic use.
 */

export interface MMFontLevel {
  fontSize: number
  lineHeight: number
  fontWeight: 400 | 500 | 600 | 700
  fontFamily: 'DM Sans' | 'Outfit' | 'Poppins' | 'Roboto'
}

export const mmTypography = {
  hero: { fontSize: 80, lineHeight: 1.10, fontWeight: 500, fontFamily: 'Outfit' },
  section: { fontSize: 31, lineHeight: 1.50, fontWeight: 600, fontFamily: 'Outfit' },
  sectionAlt: { fontSize: 32, lineHeight: 0.88, fontWeight: 600, fontFamily: 'Roboto' },
  cardTitle: { fontSize: 28, lineHeight: 1.71, fontWeight: 600, fontFamily: 'Outfit' },
  subheading: { fontSize: 24, lineHeight: 1.50, fontWeight: 500, fontFamily: 'Poppins' },
  feature: { fontSize: 18, lineHeight: 1.50, fontWeight: 500, fontFamily: 'Poppins' },
  bodyLarge: { fontSize: 20, lineHeight: 1.50, fontWeight: 500, fontFamily: 'DM Sans' },
  body: { fontSize: 16, lineHeight: 1.50, fontWeight: 400, fontFamily: 'DM Sans' },
  bodyBold: { fontSize: 16, lineHeight: 1.50, fontWeight: 700, fontFamily: 'DM Sans' },
  nav: { fontSize: 14, lineHeight: 1.50, fontWeight: 500, fontFamily: 'DM Sans' },
  button: { fontSize: 13, lineHeight: 1.50, fontWeight: 600, fontFamily: 'DM Sans' },
  caption: { fontSize: 13, lineHeight: 1.70, fontWeight: 400, fontFamily: 'DM Sans' },
  small: { fontSize: 12, lineHeight: 1.50, fontWeight: 500, fontFamily: 'DM Sans' },
  micro: { fontSize: 10, lineHeight: 1.50, fontWeight: 400, fontFamily: 'DM Sans' },
} as const satisfies Record<string, MMFontLevel>

export type MMFontLevelName = keyof typeof mmTypography

/**
 * Apple HIG Semantic Colors
 *
 * Maps Apple's Human Interface Guidelines color system
 * into a typed constant object for JS runtime access.
 *
 * Tailwind utility classes (e.g. `bg-apple-blue`, `text-apple-label`)
 * are the primary consumption path; these exports are for
 * dynamic/conditional color usage.
 *
 * @see tailwind.config.ts for the full CSS-accessible palette
 */

export const appleColors = {
  red: '#FF3B30',
  orange: '#FF9500',
  yellow: '#FFCC00',
  green: '#34C759',
  mint: '#00C7BE',
  teal: '#30B0C7',
  cyan: '#32ADE6',
  blue: '#007AFF',
  indigo: '#5856D6',
  purple: '#AF52DE',
  pink: '#FF2D55',
  brown: '#A2845E',
  label: '#000000',
  secondaryLabel: '#3C3C4399',
  tertiaryLabel: '#3C3C434C',
  quaternaryLabel: '#3C3C432E',
  placeholderText: '#3C3C434C',
  separator: '#3C3C4349',
  opaqueSeparator: '#C6C6C8',
  link: '#007AFF',
  systemBackground: '#FFFFFF',
  secondarySystemBackground: '#F2F2F7',
  tertiarySystemBackground: '#FFFFFF',
  systemGroupedBackground: '#F2F2F7',
  secondarySystemGroupedBackground: '#FFFFFF',
  tertiarySystemGroupedBackground: '#F2F2F7',
} as const

export const appleDarkColors = {
  label: '#FFFFFF',
  secondaryLabel: '#EBEBF599',
  tertiaryLabel: '#EBEBF54D',
  quaternaryLabel: '#EBEBF52E',
  separator: '#38383A',
  opaqueSeparator: '#38383A',
  systemBackground: '#000000',
  secondarySystemBackground: '#1C1C1E',
  tertiarySystemBackground: '#2C2C2E',
  systemGroupedBackground: '#000000',
  secondarySystemGroupedBackground: '#1C1C1E',
  tertiarySystemGroupedBackground: '#2C2C2E',
} as const

export const healthColors = {
  excellent: '#34C759',
  good: '#7DCF5C',
  fair: '#FFCC00',
  poor: '#FF9500',
  critical: '#FF3B30',
} as const

export type HealthStatus = keyof typeof healthColors
export type AppleColor = keyof typeof appleColors

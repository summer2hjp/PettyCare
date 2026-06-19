/**
 * MiniMax Design System — Color Tokens
 *
 * For runtime JS access; Tailwind utility classes (e.g. `text-brand-blue`,
 * `bg-mm-card`) are the primary consumption path.
 *
 * @see tailwind.config.ts for the full CSS-accessible palette
 */

export const brandColors = {
  blue: '#1456f0',
  sky: '#3daeff',
  pink: '#ea5ec1',
  deep: '#17437d',
} as const

export const primaryScale = {
  200: '#bfdbfe',
  light: '#60a5fa',
  500: '#3b82f6',
  600: '#2563eb',
  700: '#1d4ed8',
} as const

export const textColors = {
  primary: '#222222',
  dark: '#18181b',
  secondary: '#45515e',
  muted: '#8e8e93',
  helper: '#5f5f5f',
} as const

export const surfaceColors = {
  white: '#ffffff',
  secondary: '#f0f0f0',
  dark: '#181e25',
} as const

export const mmColors = {
  label: '#222222',
  secondaryLabel: '#45515e',
  tertiaryLabel: '#8e8e93',
  mutedLabel: '#8e8e93',
  background: '#ffffff',
  secondaryBackground: '#f0f0f0',
  card: '#ffffff',
  separator: '#e5e7eb',
  link: '#3b82f6',
  fill: 'rgba(0, 0, 0, 0.05)',
} as const

export const mmDarkColors = {
  label: '#ffffff',
  secondaryLabel: '#a1a1aa',
  tertiaryLabel: '#71717a',
  mutedLabel: '#52525b',
  background: '#000000',
  secondaryBackground: '#1c1c1e',
  card: '#1c1c1e',
  separator: '#38383a',
  link: '#60a5fa',
  fill: 'rgba(255, 255, 255, 0.06)',
} as const

export const healthColors = {
  excellent: '#34C759',
  good: '#7DCF5C',
  fair: '#FFCC00',
  poor: '#FF9500',
  critical: '#FF3B30',
} as const

export type HealthStatus = keyof typeof healthColors

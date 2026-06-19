/**
 * MiniMax Design System — Shadow / Elevation Tokens
 *
 * MiniMax uses distinctive purple-tinted shadows for featured elements
 * and neutral low-opacity shadows for standard cards.
 */

export interface MMShadow {
  offsetY: number
  blur: number
  spread: number
  color: string
}

export const shadowLayers = {
  subtle: { offsetY: 4, blur: 6, spread: 0, color: 'rgba(0,0,0,0.08)' },
  ambient: { offsetY: 0, blur: 22.576, spread: 0, color: 'rgba(0,0,0,0.08)' },
  brand: { offsetY: 0, blur: 15, spread: 0, color: 'rgba(44,30,116,0.16)' },
  brandOffset: { offsetY: 2, blur: 17.5, spread: 6.5, color: 'rgba(44,30,116,0.11)' },
  card: { offsetY: 12, blur: 16, spread: -4, color: 'rgba(36,36,36,0.08)' },
} as const satisfies Record<string, MMShadow>

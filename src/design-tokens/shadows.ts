/**
 * Apple-style Shadow Layers
 *
 * iOS uses layered shadow depths to communicate elevation.
 */

export interface AppleShadow {
  offsetY: number
  blur: number
  spread: number
  color: string
}

export const shadowLayers = {
  sm: { offsetY: 1, blur: 2, spread: 0, color: 'rgba(0,0,0,0.04)' },
  md: { offsetY: 2, blur: 8, spread: 0, color: 'rgba(0,0,0,0.06)' },
  lg: { offsetY: 4, blur: 16, spread: 0, color: 'rgba(0,0,0,0.08)' },
  xl: { offsetY: 8, blur: 32, spread: 0, color: 'rgba(0,0,0,0.10)' },
  '2xl': { offsetY: 16, blur: 48, spread: 0, color: 'rgba(0,0,0,0.12)' },
} as const satisfies Record<string, AppleShadow>

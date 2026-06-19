/**
 * MiniMax Design System — Animation Tokens
 *
 * Uses smooth cubic-bezier timing and spring animations
 * for a polished, modern feel.
 */

import type { Spring } from 'framer-motion'

export const springs = {
  press: { type: 'spring' as const, stiffness: 400, damping: 20, mass: 0.5 },
  tap: { type: 'spring' as const, stiffness: 500, damping: 30, mass: 0.5 },
  appear: { type: 'spring' as const, stiffness: 300, damping: 25, mass: 0.8 },
  pageTransition: { type: 'spring' as const, stiffness: 200, damping: 28, mass: 1 },
  toggle: { type: 'spring' as const, stiffness: 500, damping: 35, mass: 1 },
  sheet: { type: 'spring' as const, stiffness: 350, damping: 30, mass: 1.2 },
} as const satisfies Record<string, Spring>

export const durations = {
  instant: 100,
  fast: 200,
  normal: 350,
  slow: 500,
  reveal: 800,
} as const

export const stagger = {
  container: {
    animate: {
      transition: { staggerChildren: 0.05, delayChildren: 0.1 },
    },
  },
  item: {
    initial: { opacity: 0, y: 12 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { ...springs.appear },
    },
  },
} as const

export type SpringKey = keyof typeof springs

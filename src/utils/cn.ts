import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind classes with conflict resolution.
 *
 * Combines clsx (conditional classes) with tailwind-merge
 * (intelligent deduplication of conflicting Tailwind utilities).
 *
 * @example
 * cn('px-4 py-2', isActive && 'bg-apple-blue', 'px-6')
 * // => 'py-2 bg-apple-blue px-6'  (px-6 wins over px-4)
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

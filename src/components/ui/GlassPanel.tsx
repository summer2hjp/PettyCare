import { cn } from '@/utils/cn'
import type { ReactNode } from 'react'

interface GlassPanelProps {
  children?: ReactNode
  intensity?: 'light' | 'medium' | 'heavy'
  className?: string
  as?: 'div' | 'section' | 'aside' | 'nav'
}

export function GlassPanel({ children, intensity = 'medium', className, as: Tag = 'div' }: GlassPanelProps) {
  return (
    <Tag className={cn(
      intensity === 'light' && 'glass-light',
      intensity === 'medium' && 'glass',
      intensity === 'heavy' && 'glass-heavy',
      'rounded-mm-lg', className,
    )}>
      {children}
    </Tag>
  )
}

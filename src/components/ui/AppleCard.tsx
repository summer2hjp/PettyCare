import { cn } from '@/utils/cn'
import type { ReactNode, HTMLAttributes } from 'react'

interface AppleCardProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode
  padding?: 'sm' | 'md' | 'lg'
  hoverable?: boolean
  as?: 'div' | 'section' | 'article'
}

const paddingStyles = { sm: 'p-4', md: 'p-5', lg: 'p-6' }

export function AppleCard({
  children, padding = 'md', hoverable = false, as: Tag = 'div', className, ...props
}: AppleCardProps) {
  return (
    <Tag
      className={cn(
        'mm-card', paddingStyles[padding],
        hoverable && 'cursor-pointer hover:-translate-y-0.5',
        'transition-all duration-300', className,
      )}
      {...props}
    >
      {children}
    </Tag>
  )
}

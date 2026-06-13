import { cn } from '@/utils/cn'
import type { ReactNode } from 'react'

type BadgeVariant = 'red' | 'green' | 'orange' | 'blue' | 'grey'

interface AppleBadgeProps {
  count?: number; maxCount?: number; variant?: BadgeVariant; dot?: boolean; children?: ReactNode; className?: string
}

const variantMap: Record<BadgeVariant, string> = {
  red: 'bg-apple-red text-white', green: 'bg-apple-green text-white', orange: 'bg-apple-orange text-white',
  blue: 'bg-apple-blue text-white', grey: 'bg-[var(--apple-fill)] text-apple-secondaryLabel',
}

export function AppleBadge({ count, maxCount = 99, variant = 'red', dot = false, children, className }: AppleBadgeProps) {
  if (dot) {
    return <span className={cn('inline-block w-2 h-2 rounded-full', variantMap[variant], className)} />
  }
  const content = count !== undefined ? (count > maxCount ? `${maxCount}+` : count) : children
  return (
    <span className={cn('inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-apple-full text-[11px] font-semibold leading-none shadow-apple-sm', variantMap[variant], className)}>
      {content}
    </span>
  )
}

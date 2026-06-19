import { cn } from '@/utils/cn'
import type { ReactNode } from 'react'

type BadgeVariant = 'red' | 'green' | 'orange' | 'blue' | 'grey'

interface AppleBadgeProps {
  count?: number; maxCount?: number; variant?: BadgeVariant; dot?: boolean; children?: ReactNode; className?: string
}

const variantMap: Record<BadgeVariant, string> = {
  red: 'bg-[#FF3B30] text-white', green: 'bg-[#34C759] text-white', orange: 'bg-[#FF9500] text-white',
  blue: 'bg-[var(--mm-link)] text-white', grey: 'bg-[var(--mm-fill)] text-[var(--mm-secondaryLabel)]',
}

export function AppleBadge({ count, maxCount = 99, variant = 'red', dot = false, children, className }: AppleBadgeProps) {
  if (dot) {
    return <span className={cn('inline-block w-2 h-2 rounded-full', variantMap[variant], className)} />
  }
  const content = count !== undefined ? (count > maxCount ? `${maxCount}+` : count) : children
  return (
    <span className={cn('inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-mm-pill text-[11px] font-semibold leading-none shadow-mm-subtle', variantMap[variant], className)}>
      {content}
    </span>
  )
}

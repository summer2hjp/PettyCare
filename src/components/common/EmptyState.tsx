import { cn } from '@/utils/cn'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode; title: string; description?: string; action?: ReactNode; className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-6 text-center', className)}>
      <div className={cn('mb-5 w-16 h-16 rounded-full bg-[var(--mm-fill)] flex items-center justify-center', icon ? 'text-5xl opacity-60' : 'text-3xl')}>
        {icon ?? '📭'}
      </div>
      <h3 className="text-mm-card-title text-[var(--mm-label)] mb-1.5">{title}</h3>
      {description && <p className="text-mm-caption text-[var(--mm-tertiaryLabel)] max-w-xs mb-5">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  )
}

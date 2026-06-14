import { type ReactNode } from 'react'
import { DynamicType } from '@/components/ui/DynamicType'
import { AppleCard } from '@/components/ui/AppleCard'
import { cn } from '@/utils/cn'
import { ChevronRight, AlertCircle, RefreshCw } from 'lucide-react'

interface DashboardSectionProps {
  title: string
  subtitle?: string
  action?: { label: string; onClick: () => void }
  loading?: boolean
  error?: string | null
  empty?: boolean
  emptyMessage?: string
  onRetry?: () => void
  children?: ReactNode
  className?: string
}

function SkeletonCard() {
  return (
    <div className="min-w-[140px] h-[120px] rounded-apple bg-apple-systemBackground p-4 shrink-0">
      <div className="skeleton h-3 w-2/3 mb-3" />
      <div className="skeleton h-6 w-1/2 mb-2" />
      <div className="skeleton h-3 w-1/3" />
    </div>
  )
}

export function DashboardSection({
  title,
  subtitle,
  action,
  loading = false,
  error = null,
  empty = false,
  emptyMessage,
  onRetry,
  children,
  className,
}: DashboardSectionProps) {
  return (
    <div className={cn('mb-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-baseline gap-2">
          <DynamicType styleLevel="title3" weight={600}>{title}</DynamicType>
          {subtitle && (
            <DynamicType styleLevel="caption1" className="text-apple-secondaryLabel">
              {subtitle}
            </DynamicType>
          )}
        </div>
        {action && (
          <button
            onClick={action.onClick}
            className="flex items-center gap-0.5 text-apple-blue text-apple-footnote hover:opacity-80 transition-opacity"
          >
            {action.label}
            <ChevronRight size={14} />
          </button>
        )}
      </div>

      {/* Content */}
      {error ? (
        <AppleCard padding="md" className="flex items-center gap-3">
          <AlertCircle size={20} className="text-apple-red shrink-0" />
          <div className="flex-1 min-w-0">
            <DynamicType styleLevel="footnote" weight={600}>Data load failed</DynamicType>
            <DynamicType styleLevel="caption2" className="text-apple-secondaryLabel">{error}</DynamicType>
          </div>
          {onRetry && (
            <button onClick={onRetry} className="p-1.5 rounded-full hover:bg-apple-separator transition-colors">
              <RefreshCw size={16} className="text-apple-blue" />
            </button>
          )}
        </AppleCard>
      ) : loading ? (
        <div className="flex gap-3 overflow-x-auto scrollbar-none snap-x snap-mandatory">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : empty ? (
        <AppleCard padding="md">
          <DynamicType styleLevel="caption1" className="text-apple-secondaryLabel text-center py-4">
            {emptyMessage ?? 'No data available'}
          </DynamicType>
        </AppleCard>
      ) : (
        <div className="flex gap-3 overflow-x-auto scrollbar-none snap-x snap-mandatory pb-1">
          {children}
        </div>
      )}
    </div>
  )
}

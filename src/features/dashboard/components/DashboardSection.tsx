import { type ReactNode } from 'react'
import { DynamicType } from '@/components/ui/DynamicType'
import { GlassPanel } from '@/components/ui/GlassPanel'
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
  glassIntensity?: 'light' | 'medium' | 'heavy'
}

function SkeletonCard() {
  return (
    <div className="min-w-[140px] h-[120px] rounded-xl glass-light p-4 shrink-0 animate-pulse">
      <div className="h-3 w-2/3 bg-white/20 rounded mb-3" />
      <div className="h-6 w-1/2 bg-white/20 rounded mb-2" />
      <div className="h-3 w-1/3 bg-white/20 rounded" />
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
  glassIntensity = 'light',
}: DashboardSectionProps) {
  return (
    <div className={cn('mb-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-baseline gap-2">
          <DynamicType styleLevel="section" weight={600}>{title}</DynamicType>
          {subtitle && (
            <DynamicType styleLevel="caption" className="text-[var(--mm-secondaryLabel)]">
              {subtitle}
            </DynamicType>
          )}
        </div>
        {action && (
          <button
            onClick={action.onClick}
            className="flex items-center gap-0.5 text-[var(--mm-link)] text-mm-caption hover:opacity-80 transition-opacity"
          >
            {action.label}
            <ChevronRight size={14} />
          </button>
        )}
      </div>

      {/* Content */}
      {error ? (
        <GlassPanel intensity={glassIntensity} className="flex items-center gap-3 p-5">
          <AlertCircle size={20} className="text-[#FF3B30] shrink-0" />
          <div className="flex-1 min-w-0">
            <DynamicType styleLevel="button" weight={600}>Data load failed</DynamicType>
            <DynamicType styleLevel="small" className="text-[var(--mm-secondaryLabel)]">{error}</DynamicType>
          </div>
          {onRetry && (
            <button onClick={onRetry} className="p-1.5 rounded-full hover:bg-white/20 transition-colors">
              <RefreshCw size={16} className="text-[var(--mm-link)]" />
            </button>
          )}
        </GlassPanel>
      ) : loading ? (
        <div className="flex gap-3 overflow-x-auto scrollbar-none snap-x snap-mandatory">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : empty ? (
        <GlassPanel intensity={glassIntensity} className="p-5">
          <DynamicType styleLevel="caption" className="text-[var(--mm-secondaryLabel)] text-center py-4">
            {emptyMessage ?? 'No data available'}
          </DynamicType>
        </GlassPanel>
      ) : (
        <div className="flex gap-3 overflow-x-auto scrollbar-none snap-x snap-mandatory pb-1">
          {children}
        </div>
      )}
    </div>
  )
}

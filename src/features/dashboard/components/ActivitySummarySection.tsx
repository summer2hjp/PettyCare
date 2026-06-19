// src/features/dashboard/components/ActivitySummarySection.tsx
import { AppleCard } from '@/components/ui/AppleCard'
import { DynamicType } from '@/components/ui/DynamicType'
import { Footprints, Flame, Timer, TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { DashboardActivityData } from '@/features/dashboard/types/dashboard'

interface ActivitySummarySectionProps {
  data: DashboardActivityData | null
}

const statConfig = [
  { key: 'steps', icon: Footprints, color: 'bg-[var(--mm-link)]/10 text-[var(--mm-link)]', suffix: '', decimals: 0 },
  { key: 'distance', icon: TrendingUp, color: 'bg-[#34C759]/10 text-[#34C759]', suffix: 'km', decimals: 1 },
  { key: 'duration', icon: Timer, color: 'bg-[#FF9500]/10 text-[#FF9500]', suffix: 'min', decimals: 0 },
  { key: 'calories', icon: Flame, color: 'bg-[#FF3B30]/10 text-[#FF3B30]', suffix: 'cal', decimals: 0 },
] as const

export function ActivitySummarySection({ data }: ActivitySummarySectionProps) {
  if (!data) return null

  const values: Record<string, string> = {
    steps: data.steps.toLocaleString(),
    distance: data.distance.toFixed(1),
    duration: data.duration.toString(),
    calories: data.calories.toString(),
  }

  return (
    <>
      {statConfig.map(({ key, icon: Icon, color, suffix }) => (
        <AppleCard key={key} padding="md" hoverable className="snap-start shrink-0 min-w-[130px]">
          <div className="flex items-center gap-3">
            <div className={cn('w-9 h-9 rounded-full flex items-center justify-center shrink-0', color)}>
              <Icon size={16} />
            </div>
            <div className="min-w-0">
              <DynamicType styleLevel="small" className="text-[var(--mm-secondaryLabel)] capitalize">{key}</DynamicType>
              <div className="flex items-baseline gap-1">
                <DynamicType styleLevel="section" weight={700}>{values[key]}</DynamicType>
                <DynamicType styleLevel="small" className="text-[var(--mm-secondaryLabel)]">{suffix}</DynamicType>
              </div>
            </div>
          </div>
        </AppleCard>
      ))}
      {/* Trend card */}
      <AppleCard padding="md" hoverable className="snap-start shrink-0 min-w-[130px] flex items-center gap-2">
        {data.trendDirection === 'up'
          ? <TrendingUp size={20} className="text-[#34C759]" />
          : <TrendingDown size={20} className="text-[#FF3B30]" />
        }
        <div>
          <DynamicType styleLevel="small" className="text-[var(--mm-secondaryLabel)]">Weekly trend</DynamicType>
          <DynamicType styleLevel="section" weight={700}>
            {data.trendDirection === 'up' ? '+' : '-'}{data.trendPercent}%
          </DynamicType>
        </div>
      </AppleCard>
    </>
  )
}

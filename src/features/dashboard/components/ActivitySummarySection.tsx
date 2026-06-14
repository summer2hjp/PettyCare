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
  { key: 'steps', icon: Footprints, color: 'bg-apple-blue/10 text-apple-blue', suffix: '', decimals: 0 },
  { key: 'distance', icon: TrendingUp, color: 'bg-apple-green/10 text-apple-green', suffix: 'km', decimals: 1 },
  { key: 'duration', icon: Timer, color: 'bg-apple-orange/10 text-apple-orange', suffix: 'min', decimals: 0 },
  { key: 'calories', icon: Flame, color: 'bg-apple-red/10 text-apple-red', suffix: 'cal', decimals: 0 },
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
              <DynamicType styleLevel="caption2" className="text-apple-secondaryLabel capitalize">{key}</DynamicType>
              <div className="flex items-baseline gap-1">
                <DynamicType styleLevel="title3" weight={700}>{values[key]}</DynamicType>
                <DynamicType styleLevel="caption2" className="text-apple-secondaryLabel">{suffix}</DynamicType>
              </div>
            </div>
          </div>
        </AppleCard>
      ))}
      {/* Trend card */}
      <AppleCard padding="md" hoverable className="snap-start shrink-0 min-w-[130px] flex items-center gap-2">
        {data.trendDirection === 'up'
          ? <TrendingUp size={20} className="text-apple-green" />
          : <TrendingDown size={20} className="text-apple-red" />
        }
        <div>
          <DynamicType styleLevel="caption2" className="text-apple-secondaryLabel">Weekly trend</DynamicType>
          <DynamicType styleLevel="title3" weight={700}>
            {data.trendDirection === 'up' ? '+' : '-'}{data.trendPercent}%
          </DynamicType>
        </div>
      </AppleCard>
    </>
  )
}

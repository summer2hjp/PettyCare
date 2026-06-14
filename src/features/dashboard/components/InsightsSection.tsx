// src/features/dashboard/components/InsightsSection.tsx
import { AppleCard } from '@/components/ui/AppleCard'
import { DynamicType } from '@/components/ui/DynamicType'
import { TrendingUp, Lightbulb, BarChart3 } from 'lucide-react'
import type { DashboardInsight } from '@/features/dashboard/types/dashboard'

interface InsightsSectionProps {
  insights: DashboardInsight[]
}

const insightMeta: Record<string, { icon: React.ReactNode; label: string }> = {
  trend: { icon: <TrendingUp size={16} />, label: 'Trend' },
  tip: { icon: <Lightbulb size={16} />, label: 'Tip' },
  comparison: { icon: <BarChart3 size={16} />, label: 'Comparison' },
}

function MiniBarChart({ data }: { data: number[] }) {
  const max = Math.max(...data, 1)
  return (
    <div className="flex items-end gap-[3px] h-10 mt-2">
      {data.map((val, i) => (
        <div
          key={i}
          className="flex-1 rounded-t-sm bg-apple-blue/60"
          style={{ height: `${(val / max) * 100}%` }}
        />
      ))}
    </div>
  )
}

export function InsightsSection({ insights }: InsightsSectionProps) {
  if (insights.length === 0) return null

  return (
    <>
      {insights.map(insight => {
        const meta = insightMeta[insight.type] ?? insightMeta.tip
        return (
          <AppleCard key={insight.id} padding="md" hoverable className="snap-start shrink-0 min-w-[180px]">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-apple-blue">{meta.icon}</span>
              <DynamicType styleLevel="caption2" className="text-apple-secondaryLabel">{meta.label}</DynamicType>
            </div>
            <DynamicType styleLevel="footnote" weight={600}>{insight.title}</DynamicType>
            <DynamicType styleLevel="caption2" className="block text-apple-secondaryLabel mt-0.5">
              {insight.description}
            </DynamicType>
            {insight.trendData && insight.trendData.length > 0 && (
              <MiniBarChart data={insight.trendData} />
            )}
          </AppleCard>
        )
      })}
    </>
  )
}

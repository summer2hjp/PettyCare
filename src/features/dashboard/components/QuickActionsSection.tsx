// src/features/dashboard/components/QuickActionsSection.tsx
import { AppleCard } from '@/components/ui/AppleCard'
import { DynamicType } from '@/components/ui/DynamicType'
import type { DashboardAction } from '@/features/dashboard/types/dashboard'

interface QuickActionsSectionProps {
  actions: DashboardAction[]
  onAction: (action: DashboardAction) => void
}

export function QuickActionsSection({ actions, onAction }: QuickActionsSectionProps) {
  return (
    <div className="mb-6">
      <DynamicType styleLevel="title3" weight={600} className="mb-3 px-1">
        Quick Actions
      </DynamicType>
      <div className="flex gap-3 overflow-x-auto scrollbar-none snap-x snap-mandatory pb-1">
        {actions.map(action => (
          <button
            key={action.id}
            onClick={() => onAction(action)}
            className="snap-start shrink-0"
          >
            <AppleCard padding="md" hoverable className="flex items-center gap-2.5 min-w-[130px]">
              <span className="text-lg">{action.icon}</span>
              <DynamicType styleLevel="footnote" weight={600}>{action.label}</DynamicType>
            </AppleCard>
          </button>
        ))}
      </div>
    </div>
  )
}

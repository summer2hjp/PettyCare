// src/features/dashboard/components/QuickActionsSection.tsx
import { GlassPanel } from '@/components/ui/GlassPanel'
import { DynamicType } from '@/components/ui/DynamicType'
import type { DashboardAction } from '@/features/dashboard/types/dashboard'

interface QuickActionsSectionProps {
  actions: DashboardAction[]
  onAction: (action: DashboardAction) => void
}

export function QuickActionsSection({ actions, onAction }: QuickActionsSectionProps) {
  return (
    <div className="mb-6">
      <DynamicType styleLevel="section" weight={600} className="mb-3 px-1">
        Quick Actions
      </DynamicType>
      <div className="flex gap-3 overflow-x-auto scrollbar-none snap-x snap-mandatory pb-1">
        {actions.map(action => (
          <button
            key={action.id}
            onClick={() => onAction(action)}
            className="snap-start shrink-0"
          >
            <GlassPanel
              intensity="light"
              className="flex items-center gap-2.5 min-w-[130px] px-4 py-3 cursor-pointer transition-all duration-300 hover:scale-[1.03] hover:shadow-lg"
            >
              <span className="text-lg">{action.icon}</span>
              <DynamicType styleLevel="button" weight={600}>{action.label}</DynamicType>
            </GlassPanel>
          </button>
        ))}
      </div>
    </div>
  )
}

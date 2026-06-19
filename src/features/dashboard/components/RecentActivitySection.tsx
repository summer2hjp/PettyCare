// src/features/dashboard/components/RecentActivitySection.tsx
import { AppleCard } from '@/components/ui/AppleCard'
import { DynamicType } from '@/components/ui/DynamicType'
import { cn } from '@/utils/cn'
import { Syringe, Utensils, Footprints, Calendar, Stethoscope } from 'lucide-react'
import type { TimelineEntry } from '@/features/dashboard/types/dashboard'

interface RecentActivitySectionProps {
  entries: TimelineEntry[]
}

const typeStyle: Record<string, { icon: React.ReactNode; bg: string }> = {
  vaccination: { icon: <Syringe size={14} />, bg: 'bg-blue-100 dark:bg-blue-900/30 text-[var(--mm-link)]' },
  feeding: { icon: <Utensils size={14} />, bg: 'bg-amber-100 dark:bg-amber-900/30 text-[#FF9500]' },
  activity: { icon: <Footprints size={14} />, bg: 'bg-green-100 dark:bg-green-900/30 text-[#34C759]' },
  appointment: { icon: <Calendar size={14} />, bg: 'bg-purple-100 dark:bg-purple-900/30 text-[#AF52DE]' },
  visit: { icon: <Stethoscope size={14} />, bg: 'bg-rose-100 dark:bg-rose-900/30 text-[#FF3B30]' },
}

export function RecentActivitySection({ entries }: RecentActivitySectionProps) {
  if (entries.length === 0) return null

  return (
    <>
      {entries.map(entry => {
        const style = typeStyle[entry.type] ?? typeStyle.visit
        return (
          <AppleCard key={entry.id} padding="md" hoverable className="snap-start shrink-0 min-w-[240px]">
            <div className="flex items-start gap-3">
              <div className={cn('w-8 h-8 rounded-full flex items-center justify-center shrink-0', style.bg)}>
                {style.icon}
              </div>
              <div className="min-w-0">
                <DynamicType styleLevel="button" weight={600}>{entry.description}</DynamicType>
                <DynamicType styleLevel="small" className="block text-[var(--mm-secondaryLabel)]">{entry.detail}</DynamicType>
                <DynamicType styleLevel="small" className="block text-[var(--mm-tertiaryLabel)]">{entry.relativeTime}</DynamicType>
              </div>
            </div>
          </AppleCard>
        )
      })}
    </>
  )
}

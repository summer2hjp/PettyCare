// src/features/dashboard/components/UpcomingEventsSection.tsx
import { AppleCard } from '@/components/ui/AppleCard'
import { DynamicType } from '@/components/ui/DynamicType'
import { cn } from '@/utils/cn'
import { Syringe, Stethoscope, Calendar } from 'lucide-react'
import type { DashboardUpcomingEvent } from '@/features/dashboard/types/dashboard'

interface UpcomingEventsSectionProps {
  events: DashboardUpcomingEvent[]
}

const urgencyConfig: Record<string, { label: string; color: string }> = {
  tomorrow: { label: 'Tomorrow', color: 'bg-[var(--mm-link)] text-white' },
  'within-3-days': { label: 'In 3 days', color: 'bg-[#FF9500] text-white' },
  'next-week': { label: 'Next week', color: 'bg-[#34C759] text-white' },
  later: { label: 'Later', color: 'bg-[var(--mm-separator)] text-[var(--mm-secondaryLabel)]' },
}

const typeIcon: Record<string, React.ReactNode> = {
  vaccination: <Syringe size={14} className="text-[var(--mm-link)]" />,
  appointment: <Stethoscope size={14} className="text-[#AF52DE]" />,
  visit: <Calendar size={14} className="text-[#30B0C7]" />,
}

export function UpcomingEventsSection({ events }: UpcomingEventsSectionProps) {
  if (events.length === 0) return null

  return (
    <>
      {events.map(event => {
        const urgency = urgencyConfig[event.urgency] ?? urgencyConfig.later
        return (
          <AppleCard key={event.id} padding="md" hoverable className="snap-start shrink-0 min-w-[220px]">
            <span className={cn('inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full mb-2', urgency.color)}>
              {urgency.label}
            </span>
            <div className="flex items-center gap-1.5 mb-1">
              {typeIcon[event.type] ?? null}
              <DynamicType styleLevel="button" weight={600}>{event.title}</DynamicType>
            </div>
            <DynamicType styleLevel="small" className="block text-[var(--mm-secondaryLabel)]">
              {event.date}{event.time ? ` · ${event.time}` : ''}
            </DynamicType>
            <DynamicType styleLevel="small" className="text-[var(--mm-secondaryLabel)]">{event.petName}</DynamicType>
          </AppleCard>
        )
      })}
    </>
  )
}

import { cn } from '@/utils/cn'
import { DynamicType } from '@/components/ui/DynamicType'
import { ShinyText } from '@/components/ui/ShinyText'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { MagicRings } from '@/components/ui/MagicRings'
import { useTheme } from '@/hooks/useTheme'
import { Heart, UtensilsCrossed, Calendar, Lightbulb } from 'lucide-react'
import type { DashboardHealthData, FeedingMeal, DashboardUpcomingEvent, DashboardInsight } from '@/features/dashboard/types/dashboard'

interface DataCardRowProps {
  health: DashboardHealthData | null
  feeding: FeedingMeal[]
  events: DashboardUpcomingEvent[]
  insights: DashboardInsight[]
  loading?: boolean
  className?: string
  onNavigate?: (page: string) => void
}

function StatCardSkeleton() {
  return (
    <GlassPanel intensity="light" className="p-4 animate-pulse">
      <div className="w-7 h-7 rounded-lg bg-white/20 mb-2" />
      <div className="h-5 w-16 bg-white/20 rounded mb-1" />
      <div className="h-3 w-20 bg-white/20 rounded" />
    </GlassPanel>
  )
}

function StatCard({
  icon,
  label,
  value,
  sublabel,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  value: string
  sublabel?: string
  onClick?: () => void
}) {
  const content = (
    <>
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-lg bg-white/30 flex items-center justify-center">
          {icon}
        </div>
        <DynamicType styleLevel="small" className="text-[var(--mm-secondaryLabel)]">
          {label}
        </DynamicType>
      </div>
      <DynamicType styleLevel="body" weight={600}>
        {value}
      </DynamicType>
      {sublabel && (
        <DynamicType styleLevel="small" className="text-[var(--mm-tertiaryLabel)] mt-0.5">
          {sublabel}
        </DynamicType>
      )}
    </>
  )

  if (onClick) {
    return (
      <button
        type="button"
        className={cn(
          'glass-light rounded-mm-lg p-4 text-left w-full transition-all duration-300',
          'cursor-pointer hover:-translate-y-0.5 hover:shadow-lg'
        )}
        onClick={onClick}
      >
        {content}
      </button>
    )
  }

  return (
    <GlassPanel intensity="light" className="p-4">
      {content}
    </GlassPanel>
  )
}

export function DataCardRow({ health, feeding, events, insights, loading, className, onNavigate }: DataCardRowProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  if (loading) {
    return (
      <div className={cn('mb-6', className)}>
        <ShinyText text="Overview" as="h2" className="text-mm-section font-semibold mb-3 px-1" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
      </div>
    )
  }

  const healthValue = health ? `${health.score}` : '--'
  const healthSublabel = health ? health.status : 'No data'

  const feedingCount = feeding.length
  const nextMeal = feeding.find(m => m.status === 'upcoming')
  const feedingValue = feedingCount > 0 ? `${feedingCount} meals` : '--'
  const feedingSublabel = nextMeal ? `Next: ${nextMeal.time.slice(0, 5)}` : 'No schedule'

  const eventsCount = events.length
  const nearestEvent = events[0]
  const eventsValue = eventsCount > 0 ? `${eventsCount} upcoming` : '--'
  const eventsSublabel = nearestEvent ? nearestEvent.title.slice(0, 20) : 'All clear'

  const insightValue = insights.length > 0 ? insights[0].title : '--'
  const insightSublabel = insights.length > 0 ? insights[0].description.slice(0, 24) : 'Check back later'

  return (
    <div className={cn('mb-6', className)}>
      <ShinyText text="Overview" as="h2" className="text-mm-section font-semibold mb-3 px-1" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="relative">
          {isDark && <MagicRings ringCount={4} color="#fc42ff" colorTwo="#42fcff" opacity={0.6} speed={0.8} className="rounded-mm-lg" />}
          <StatCard
            icon={<Heart size={14} className="text-[#FF3B30]" />}
            label="Health"
            value={healthValue}
            sublabel={healthSublabel}
            onClick={onNavigate ? () => onNavigate('health') : undefined}
          />
        </div>
        <div className="relative">
          {isDark && <MagicRings ringCount={4} color="#3b82f6" colorTwo="#60a5fa" opacity={0.6} speed={0.8} className="rounded-mm-lg" />}
          <StatCard
            icon={<UtensilsCrossed size={14} />}
            label="Feeding"
            value={feedingValue}
            sublabel={feedingSublabel}
            onClick={onNavigate ? () => onNavigate('feeding') : undefined}
          />
        </div>
        <div className="relative">
          {isDark && <MagicRings ringCount={4} color="#34C759" colorTwo="#7DCF5C" opacity={0.6} speed={0.8} className="rounded-mm-lg" />}
          <StatCard
            icon={<Calendar size={14} />}
            label="Events"
            value={eventsValue}
            sublabel={eventsSublabel}
            onClick={onNavigate ? () => onNavigate('appointments') : undefined}
          />
        </div>
        <div className="relative">
          {isDark && <MagicRings ringCount={4} color="#FF9500" colorTwo="#FFCC00" opacity={0.6} speed={0.8} className="rounded-mm-lg" />}
          <StatCard
            icon={<Lightbulb size={14} />}
            label="Insight"
            value={insightValue}
            sublabel={insightSublabel}
          />
        </div>
      </div>
    </div>
  )
}

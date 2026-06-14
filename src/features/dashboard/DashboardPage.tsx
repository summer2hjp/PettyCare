// src/features/dashboard/DashboardPage.tsx
import { usePets } from '@/store/pet-context'
import { DashboardSection } from '@/features/dashboard/components/DashboardSection'
import { HealthSummarySection } from '@/features/dashboard/components/HealthSummarySection'
import { ActivitySummarySection } from '@/features/dashboard/components/ActivitySummarySection'
import { FeedingScheduleSection } from '@/features/dashboard/components/FeedingScheduleSection'
import { UpcomingEventsSection } from '@/features/dashboard/components/UpcomingEventsSection'
import { RecentActivitySection } from '@/features/dashboard/components/RecentActivitySection'
import { InsightsSection } from '@/features/dashboard/components/InsightsSection'
import { QuickActionsSection } from '@/features/dashboard/components/QuickActionsSection'
import { useDashboardData } from '@/features/dashboard/hooks/useDashboardData'
import type { DashboardAction } from '@/features/dashboard/types/dashboard'

interface DashboardPageProps {
  onNavigate: (page: string) => void
}

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { pets } = usePets()
  const data = useDashboardData()

  const handleAction = (action: DashboardAction) => {
    onNavigate(action.navigateTo.page)
  }

  return (
    <div>
      {/* Quick Actions (no loading/empty/error wrapper — always shown) */}
      <QuickActionsSection actions={data.actions} onAction={handleAction} />

      {/* Health Overview */}
      <DashboardSection
        title="Health Overview"
        subtitle={pets.length > 0 ? `${pets.length} pet${pets.length > 1 ? 's' : ''}` : undefined}
        action={{ label: 'View All', onClick: () => onNavigate('health') }}
        loading={data.loading}
        error={data.error}
        empty={!data.health}
        emptyMessage="Add health records to see an overview"
        onRetry={() => window.location.reload()}
      >
        {data.health && <HealthSummarySection data={data.health} />}
      </DashboardSection>

      {/* Activity Summary */}
      <DashboardSection
        title="Activity"
        action={{ label: 'View All', onClick: () => onNavigate('activity') }}
        loading={data.loading}
        empty={!data.activity || data.activity.steps === 0}
        emptyMessage="No activity data yet — take your pet for a walk!"
      >
        {data.activity && <ActivitySummarySection data={data.activity} />}
      </DashboardSection>

      {/* Feeding Schedule */}
      <DashboardSection
        title="Feeding Schedule"
        action={{ label: 'View All', onClick: () => onNavigate('feeding') }}
        loading={data.loading}
        empty={data.feeding.length === 0}
        emptyMessage="No feeding schedule set up"
      >
        <FeedingScheduleSection meals={data.feeding} />
      </DashboardSection>

      {/* Upcoming Events */}
      <DashboardSection
        title="Upcoming Events"
        action={{ label: 'View All', onClick: () => onNavigate('appointments') }}
        loading={data.loading}
        empty={data.events.length === 0}
        emptyMessage="No upcoming appointments or vaccinations"
      >
        <UpcomingEventsSection events={data.events} />
      </DashboardSection>

      {/* Recent Activity */}
      <DashboardSection
        title="Recent Activity"
        loading={data.loading}
        empty={data.timeline.length === 0}
        emptyMessage="No recent activity to show"
      >
        <RecentActivitySection entries={data.timeline} />
      </DashboardSection>

      {/* Insights */}
      <DashboardSection
        title="Insights"
        loading={data.loading}
        empty={data.insights.length === 0}
        emptyMessage="Check back later for data insights"
      >
        <InsightsSection insights={data.insights} />
      </DashboardSection>
    </div>
  )
}

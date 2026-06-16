// src/features/dashboard/DashboardPage.tsx

import { useState } from 'react'
import { usePets } from '@/store/pet-context'
import { useDashboardData } from '@/features/dashboard/hooks/useDashboardData'
import { usePetMoments } from '@/features/dashboard/hooks/usePetMoments'
import { PetHeroCard } from '@/features/dashboard/components/PetHeroCard'
import { MomentSection } from '@/features/dashboard/components/MomentSection'
import { GrowthTimelineSection } from '@/features/dashboard/components/GrowthTimelineSection'
import { DataCardRow } from '@/features/dashboard/components/DataCardRow'
import { QuickActionsSection } from '@/features/dashboard/components/QuickActionsSection'
import { PhotoPreview } from '@/features/dashboard/components/PhotoPreview'
import type { DashboardAction } from '@/features/dashboard/types/dashboard'
import type { PetMoment } from '@/types/moments'

interface DashboardPageProps {
  onNavigate: (page: string) => void
}

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { pets, loading: petsLoading } = usePets()
  const data = useDashboardData()

  // Fetch moments for each type (with local image fallback)
  const dailyMoments = usePetMoments({ petId: null, type: 'daily', limit: 12, pets })
  const interactionMoments = usePetMoments({ petId: null, type: 'interaction', limit: 8, pets })
  const growthMoments = usePetMoments({ petId: null, type: 'growth', limit: 10, pets })

  // Photo preview state
  const [previewMoments, setPreviewMoments] = useState<PetMoment[] | null>(null)
  const [previewIndex, setPreviewIndex] = useState(0)

  const openPreview = (moments: PetMoment[], index: number) => {
    setPreviewMoments(moments)
    setPreviewIndex(index)
  }

  const handleAction = (action: DashboardAction) => {
    onNavigate(action.navigateTo.page)
  }

  const overallLoading = data.loading || petsLoading

  return (
    <div>
      {/* Quick Actions — always on top */}
      <QuickActionsSection actions={data.actions} onAction={handleAction} />

      {/* Daily Life Moments */}
      <MomentSection
        title="📸 宠物的日常"
        subtitle={activePet ? activePet.name : undefined}
        moments={dailyMoments.moments}
        momentType="daily"
        loading={dailyMoments.loading}
        error={dailyMoments.error}
        emptyMessage="还没有日常记录，快去拍一张吧 📸"
        onMomentClick={(index) => openPreview(dailyMoments.moments, index)}
        onRetry={dailyMoments.refresh}
      />

      {/* Interaction Moments */}
      <MomentSection
        title="💕 互动瞬间"
        subtitle={activePet ? activePet.name : undefined}
        moments={interactionMoments.moments}
        momentType="interaction"
        loading={interactionMoments.loading}
        error={interactionMoments.error}
        emptyMessage="还没有互动记录，和宠物一起玩吧 🎾"
        onMomentClick={(index) => openPreview(interactionMoments.moments, index)}
        onRetry={interactionMoments.refresh}
      />

      {/* Growth Timeline */}
      <GrowthTimelineSection
        moments={growthMoments.moments}
        loading={growthMoments.loading}
        error={growthMoments.error}
        onMomentClick={(index) => openPreview(growthMoments.moments, index)}
        onRetry={growthMoments.refresh}
      />

      {/* Data Card Row */}
      <DataCardRow
        health={data.health}
        feeding={data.feeding}
        events={data.events}
        insights={data.insights}
        loading={overallLoading}
        onNavigate={onNavigate}
      />

      {/* Photo Preview Modal */}
      {previewMoments && (
        <PhotoPreview
          moments={previewMoments}
          initialIndex={previewIndex}
          onClose={() => setPreviewMoments(null)}
        />
      )}
    </div>
  )
}

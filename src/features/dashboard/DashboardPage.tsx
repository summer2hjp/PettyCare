// src/features/dashboard/DashboardPage.tsx

import { useState } from 'react'
import { usePets } from '@/store/pet-context'
import { useDashboardData } from '@/features/dashboard/hooks/useDashboardData'
import { usePetMoments } from '@/features/dashboard/hooks/usePetMoments'
import { PetSelectorStrip } from '@/features/dashboard/components/PetSelectorStrip'
import { PetHeroCard } from '@/features/dashboard/components/PetHeroCard'
import { MomentSection } from '@/features/dashboard/components/MomentSection'
import { GrowthTimelineSection } from '@/features/dashboard/components/GrowthTimelineSection'
import { DataCardRow } from '@/features/dashboard/components/DataCardRow'
import { QuickActionsSection } from '@/features/dashboard/components/QuickActionsSection'
import { PhotoPreview } from '@/features/dashboard/components/PhotoPreview'
import type { DashboardAction } from '@/features/dashboard/types/dashboard'
import type { PetMoment } from '@/types/moments'
import type { Pet } from '@/types/pet'

interface DashboardPageProps {
  onNavigate: (page: string) => void
}

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { pets, loading: petsLoading } = usePets()
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null)
  const data = useDashboardData(selectedPetId)

  // Fetch moments for each type (with local image fallback)
  const dailyMoments = usePetMoments({ petId: selectedPetId, type: 'daily', limit: 12, pets })
  const interactionMoments = usePetMoments({ petId: selectedPetId, type: 'interaction', limit: 8, pets })
  const growthMoments = usePetMoments({ petId: selectedPetId, type: 'growth', limit: 10, pets })

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

  const activePet: Pet | undefined = selectedPetId
    ? pets.find(p => p.id === selectedPetId)
    : undefined

  const overallLoading = data.loading || petsLoading

  return (
    <div>
      {/* Quick Actions — always on top */}
      <QuickActionsSection actions={data.actions} onAction={handleAction} />

      {/* Pet Selector Strip */}
      <PetSelectorStrip
        pets={pets}
        activePetId={selectedPetId}
        onSelect={setSelectedPetId}
        loading={petsLoading}
      />

      {/* Pet Hero Card — only when a specific pet is selected */}
      {activePet && (
        <PetHeroCard
          pet={activePet}
          health={data.health}
          activity={data.activity}
          loading={overallLoading}
        />
      )}

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

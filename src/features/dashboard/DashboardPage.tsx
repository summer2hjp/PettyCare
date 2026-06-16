// src/features/dashboard/DashboardPage.tsx

import { useState, useRef, useCallback } from 'react'
import { usePets } from '@/store/pet-context'
import { useDashboardData } from '@/features/dashboard/hooks/useDashboardData'
import { usePetMoments } from '@/features/dashboard/hooks/usePetMoments'
import { MomentSection } from '@/features/dashboard/components/MomentSection'
import { GrowthTimelineSection } from '@/features/dashboard/components/GrowthTimelineSection'
import { DataCardRow } from '@/features/dashboard/components/DataCardRow'
import { QuickActionsSection } from '@/features/dashboard/components/QuickActionsSection'
import { PhotoPreview } from '@/features/dashboard/components/PhotoPreview'
import { supabase } from '@/lib/supabase'
import type { DashboardAction } from '@/features/dashboard/types/dashboard'
import type { PetMoment, MomentType } from '@/types/moments'

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

  // Upload state
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadingType, setUploadingType] = useState<MomentType | null>(null)

  const openPreview = (moments: PetMoment[], index: number) => {
    setPreviewMoments(moments)
    setPreviewIndex(index)
  }

  const handleAction = (action: DashboardAction) => {
    onNavigate(action.navigateTo.page)
  }

  const handleUpload = useCallback(async (type: MomentType) => {
    // Use the first pet if available, otherwise prompt user to add a pet first
    if (pets.length === 0) {
      alert('请先在 Quick Actions 中添加宠物')
      return
    }

    setUploadingType(type)
    // Trigger file picker — next tick so React renders loading state
    setTimeout(() => fileInputRef.current?.click(), 0)
  }, [pets.length])

  const handleFileSelected = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !uploadingType || pets.length === 0) return

    const petId = pets[0].id
    const fileName = `${Date.now()}-${file.name}`
    const filePath = `moments/${fileName}`

    try {
      // 1. Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // 2. Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      // 3. Insert record into pet_moments
      const { error: insertError } = await supabase
        .from('pet_moments')
        .insert({
          pet_id: petId,
          image_url: publicUrl,
          caption: null,
          moment_type: uploadingType,
          taken_at: new Date().toISOString().split('T')[0],
        })

      if (insertError) throw insertError

      // 4. Refresh all moments
      dailyMoments.refresh()
      interactionMoments.refresh()
      growthMoments.refresh()
    } catch (err) {
      console.error('Upload failed:', err)
      alert('上传失败: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      setUploadingType(null)
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }, [uploadingType, pets, dailyMoments, interactionMoments, growthMoments])

  const overallLoading = data.loading || petsLoading

  return (
    <div>
      {/* Hidden file input for photo upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelected}
      />

      {/* Quick Actions — always on top */}
      <QuickActionsSection actions={data.actions} onAction={handleAction} />

      {/* Daily Life Moments */}
      <MomentSection
        title="📸 宠物的日常"
        subtitle={undefined}
        moments={dailyMoments.moments}
        momentType="daily"
        loading={dailyMoments.loading}
        error={dailyMoments.error}
        emptyMessage="还没有日常记录，快去拍一张吧 📸"
        onMomentClick={(index) => openPreview(dailyMoments.moments, index)}
        onRetry={dailyMoments.refresh}
        onUpload={handleUpload}
      />

      {/* Interaction Moments */}
      <MomentSection
        title="💕 互动瞬间"
        subtitle={undefined}
        moments={interactionMoments.moments}
        momentType="interaction"
        loading={interactionMoments.loading}
        error={interactionMoments.error}
        emptyMessage="还没有互动记录，和宠物一起玩吧 🎾"
        onMomentClick={(index) => openPreview(interactionMoments.moments, index)}
        onRetry={interactionMoments.refresh}
        onUpload={handleUpload}
      />

      {/* Growth Timeline */}
      <GrowthTimelineSection
        moments={growthMoments.moments}
        loading={growthMoments.loading}
        error={growthMoments.error}
        onMomentClick={(index) => openPreview(growthMoments.moments, index)}
        onRetry={growthMoments.refresh}
        onUpload={() => handleUpload('growth')}
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

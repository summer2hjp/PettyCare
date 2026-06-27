// src/features/dashboard/DashboardPage.tsx

import { useState, useRef, useCallback, useMemo } from 'react'
import { Plus } from 'lucide-react'
import { usePets } from '@/store/pet-context'
import { useDashboardData } from '@/features/dashboard/hooks/useDashboardData'
import { usePetMoments } from '@/features/dashboard/hooks/usePetMoments'
import CircularGallery from '@/components/ui/CircularGallery'
import { DataCardRow } from '@/features/dashboard/components/DataCardRow'
import { QuickActionsSection } from '@/features/dashboard/components/QuickActionsSection'
import { supabase } from '@/lib/supabase'
import type { DashboardAction } from '@/features/dashboard/types/dashboard'
import type { MomentType } from '@/types/moments'

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

  // Upload state
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadingType, setUploadingType] = useState<MomentType | null>(null)

  // Stable gallery items from moments
  const dailyItems = useMemo(() =>
    dailyMoments.moments.map(m => ({ image: m.imageUrl, text: m.caption ?? '' })),
    [dailyMoments.moments]
  )
  const interactionItems = useMemo(() =>
    interactionMoments.moments.map(m => ({ image: m.imageUrl, text: m.caption ?? '' })),
    [interactionMoments.moments]
  )
  const growthItems = useMemo(() =>
    growthMoments.moments.map(m => ({ image: m.imageUrl, text: m.caption ?? '' })),
    [growthMoments.moments]
  )

  const handleAction = (action: DashboardAction) => {
    onNavigate(action.navigateTo.page)
  }

  const handleUpload = useCallback(async (type: MomentType) => {
    if (pets.length === 0) {
      alert('请先在 Quick Actions 中添加宠物')
      return
    }
    setUploadingType(type)
    setTimeout(() => fileInputRef.current?.click(), 0)
  }, [pets.length])

  const handleFileSelected = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !uploadingType || pets.length === 0) return

    const petId = pets[0].id
    const fileName = `${Date.now()}-${file.name}`
    const filePath = `moments/${fileName}`

    try {
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

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

      dailyMoments.refresh()
      interactionMoments.refresh()
      growthMoments.refresh()
    } catch (err) {
      console.error('Upload failed:', err)
      alert('上传失败: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      setUploadingType(null)
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
      <section className="mb-6">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <span className="text-mm-section font-semibold text-[var(--mm-label)]">📸 宠物的日常</span>
            {pets.length > 0 && (
              <button
                onClick={() => handleUpload('daily')}
                className="w-6 h-6 rounded-full glass-light flex items-center justify-center hover:scale-110 transition-transform"
                title="上传照片"
              >
                <Plus size={14} />
              </button>
            )}
          </div>
        </div>
        <div className="h-[320px] rounded-xl overflow-hidden">
          <CircularGallery
            items={dailyItems}
            bend={2}
            textColor="#ffffff"
            borderRadius={0.05}
            scrollSpeed={1.5}
            scrollEase={0.05}
          />
        </div>
      </section>

      {/* Interaction Moments */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <span className="text-mm-section font-semibold text-[var(--mm-label)]">💕 互动瞬间</span>
            {pets.length > 0 && (
              <button
                onClick={() => handleUpload('interaction')}
                className="w-6 h-6 rounded-full glass-light flex items-center justify-center hover:scale-110 transition-transform"
                title="上传照片"
              >
                <Plus size={14} />
              </button>
            )}
          </div>
        </div>
        <div className="h-[320px] rounded-xl overflow-hidden">
          <CircularGallery
            items={interactionItems}
            bend={-2}
            textColor="#ffffff"
            borderRadius={0.05}
            scrollSpeed={1.5}
            scrollEase={0.05}
          />
        </div>
      </section>

      {/* Growth Timeline */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <span className="text-mm-section font-semibold text-[var(--mm-label)]">📈 成长轨迹</span>
            {pets.length > 0 && (
              <button
                onClick={() => handleUpload('growth')}
                className="w-6 h-6 rounded-full glass-light flex items-center justify-center hover:scale-110 transition-transform"
                title="上传照片"
              >
                <Plus size={14} />
              </button>
            )}
          </div>
        </div>
        <div className="h-[320px] rounded-xl overflow-hidden">
          <CircularGallery
            items={growthItems}
            bend={3}
            textColor="#ffffff"
            borderRadius={0.05}
            scrollSpeed={1.5}
            scrollEase={0.05}
          />
        </div>
      </section>

      {/* Data Card Row */}
      <DataCardRow
        health={data.health}
        feeding={data.feeding}
        events={data.events}
        insights={data.insights}
        loading={overallLoading}
        onNavigate={onNavigate}
      />
    </div>
  )
}

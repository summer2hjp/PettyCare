// src/features/dashboard/components/MomentSection.tsx

import { useRef, useState, useEffect, useCallback } from 'react'
import { DynamicType } from '@/components/ui/DynamicType'
import { ChevronRight, Camera, Plus, Trash2, X as XIcon } from 'lucide-react'
import { MomentCard } from './MomentCard'
import { GlassMomentSkeleton } from './GlassMomentSkeleton'
import { cn } from '@/utils/cn'
import type { PetMoment, MomentType } from '@/types/moments'

interface MomentSectionProps {
  title: string
  subtitle?: string
  moments: PetMoment[]
  momentType: MomentType
  loading?: boolean
  error?: string | null
  emptyMessage?: string
  onViewAll?: () => void
  onMomentClick: (index: number) => void
  onRetry?: () => void
  onUpload?: (type: MomentType) => void
  onBatchDelete?: (moments: PetMoment[]) => void
}

export function MomentSection({
  title,
  subtitle,
  moments,
  momentType,
  loading = false,
  error = null,
  emptyMessage,
  onViewAll,
  onMomentClick,
  onRetry,
  onUpload,
  onBatchDelete,
}: MomentSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const [selecting, setSelecting] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const check = () => {
      setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10)
    }

    check()
    el.addEventListener('scroll', check)
    window.addEventListener('resize', check)
    return () => {
      el.removeEventListener('scroll', check)
      window.removeEventListener('resize', check)
    }
  }, [moments])

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const handleBatchDelete = useCallback(() => {
    if (selectedIds.size === 0) return
    if (!confirm(`确定删除选中的 ${selectedIds.size} 张照片吗？`)) return
    const toDelete = moments.filter(m => selectedIds.has(m.id))
    onBatchDelete?.(toDelete)
    setSelecting(false)
    setSelectedIds(new Set())
  }, [selectedIds, moments, onBatchDelete])

  return (
    <div className="mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-baseline gap-2">
          <DynamicType styleLevel="section" weight={600}>{title}</DynamicType>
          {subtitle && (
            <DynamicType styleLevel="caption" className="text-[var(--mm-tertiaryLabel)]">
              {subtitle}
            </DynamicType>
          )}
          {onUpload && !selecting && (
            <button
              onClick={() => onUpload(momentType)}
              className="ml-1 w-6 h-6 rounded-full glass-light flex items-center justify-center hover:scale-110 transition-transform"
              title="上传照片"
            >
              <Plus size={14} />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onBatchDelete && moments.length > 0 && !selecting && (
            <button
              onClick={() => setSelecting(true)}
              className="text-[var(--mm-link)] text-mm-caption hover:opacity-80 transition-opacity"
            >
              选择
            </button>
          )}
          {selecting && (
            <button
              onClick={() => { setSelecting(false); setSelectedIds(new Set()) }}
              className="flex items-center gap-1 text-[#FF3B30] text-mm-caption hover:opacity-80 transition-opacity"
            >
              <XIcon size={14} /> 取消
            </button>
          )}
          {onViewAll && !selecting && (
            <button
              onClick={onViewAll}
              className="flex items-center gap-0.5 text-[var(--mm-link)] text-mm-caption hover:opacity-80 transition-opacity"
            >
              View All
              <ChevronRight size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {error ? (
        <div className="rounded-xl glass-light p-5 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <DynamicType styleLevel="button" weight={600} className="text-[#FF3B30]">
              Failed to load
            </DynamicType>
            <DynamicType styleLevel="small" className="text-[var(--mm-secondaryLabel)]">
              {error}
            </DynamicType>
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-3 py-1.5 rounded-lg glass-light text-[var(--mm-link)] text-mm-caption hover:opacity-80 transition-opacity"
            >
              Retry
            </button>
          )}
        </div>
      ) : loading ? (
        <GlassMomentSkeleton
          count={4}
          aspectRatio="portrait"
        />
      ) : moments.length === 0 ? (
        <div className="rounded-xl glass-light p-6 flex flex-col items-center gap-2">
          <Camera size={24} className="text-[var(--mm-tertiaryLabel)]" />
          <DynamicType styleLevel="caption" className="text-[var(--mm-secondaryLabel)] text-center">
            {emptyMessage ?? '还没有记录'}
          </DynamicType>
        </div>
      ) : (
        <div className="relative">
          <div
            ref={scrollRef}
            className={cn(
              'flex gap-3 overflow-x-auto pb-1',
              selecting ? '' : 'scrollbar-none snap-x snap-mandatory'
            )}
          >
            {moments.map((moment, index) => (
              <div key={moment.id} className="relative shrink-0">
                {selecting && (
                  <button
                    onClick={() => toggleSelect(moment.id)}
                    className={cn(
                      'absolute top-1.5 left-1.5 z-10 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200',
                      selectedIds.has(moment.id)
                        ? 'bg-[var(--mm-link)] text-white scale-110'
                        : 'bg-white/60 text-transparent hover:bg-white/80'
                    )}
                  >
                    ✓
                  </button>
                )}
                <MomentCard
                  moment={moment}
                  type={momentType}
                  onClick={selecting ? () => toggleSelect(moment.id) : () => onMomentClick(index)}
                  style={{ transitionDelay: `${index * 60}ms` }}
                />
              </div>
            ))}
          </div>

          {/* Right scroll hint */}
          {canScrollRight && moments.length > 2 && !selecting && (
            <div className="absolute right-0 top-0 bottom-3 w-12 bg-gradient-to-l from-white/30 to-transparent pointer-events-none rounded-r-xl" />
          )}
        </div>
      )}

      {/* Batch delete bar */}
      {selecting && selectedIds.size > 0 && (
        <div className="mt-3 flex justify-center">
          <button
            onClick={handleBatchDelete}
            className="flex items-center gap-2 px-4 py-2 rounded-xl glass-heavy text-red-400 text-mm-caption font-semibold hover:bg-white/10 transition-all"
          >
            <Trash2 size={16} />
            删除选中 ({selectedIds.size})
          </button>
        </div>
      )}
    </div>
  )
}

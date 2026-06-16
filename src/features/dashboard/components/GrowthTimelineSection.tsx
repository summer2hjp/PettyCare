// src/features/dashboard/components/GrowthTimelineSection.tsx

import { useState, useCallback } from 'react'
import { DynamicType } from '@/components/ui/DynamicType'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { GlassMomentSkeleton } from './GlassMomentSkeleton'
import { ChevronRight, Clock, Plus, Trash2, X as XIcon } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { PetMoment } from '@/types/moments'

interface GrowthTimelineSectionProps {
  moments: PetMoment[]
  loading?: boolean
  error?: string | null
  onMomentClick: (index: number) => void
  onRetry?: () => void
  onUpload?: () => void
  onBatchDelete?: (moments: PetMoment[]) => void
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.getFullYear()}/${d.getMonth() + 1}`
}

export function GrowthTimelineSection({
  moments,
  loading,
  error,
  onMomentClick,
  onRetry,
  onUpload,
  onBatchDelete,
}: GrowthTimelineSectionProps) {
  const [selecting, setSelecting] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const sorted = [...moments].sort(
    (a, b) => new Date(a.takenAt).getTime() - new Date(b.takenAt).getTime()
  )

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
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <DynamicType styleLevel="title3" weight={600}>📈 成长轨迹</DynamicType>
          {onUpload && !selecting && (
            <button
              onClick={onUpload}
              className="w-6 h-6 rounded-full glass-light flex items-center justify-center hover:scale-110 transition-transform"
              title="上传照片"
            >
              <Plus size={14} />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onBatchDelete && moments.length > 0 && !selecting && (
            <button onClick={() => setSelecting(true)} className="text-apple-blue text-apple-footnote hover:opacity-80 transition-opacity">
              选择
            </button>
          )}
          {selecting && (
            <button onClick={() => { setSelecting(false); setSelectedIds(new Set()) }}
              className="flex items-center gap-1 text-apple-red text-apple-footnote hover:opacity-80 transition-opacity">
              <XIcon size={14} /> 取消
            </button>
          )}
        </div>
      </div>

      {error ? (
        <div className="rounded-xl glass-light p-5 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <DynamicType styleLevel="footnote" weight={600} className="text-apple-red">
              Failed to load
            </DynamicType>
            <DynamicType styleLevel="caption2" className="text-apple-secondaryLabel">
              {error}
            </DynamicType>
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-3 py-1.5 rounded-lg glass-light text-apple-blue text-apple-footnote hover:opacity-80 transition-opacity"
            >
              Retry
            </button>
          )}
        </div>
      ) : loading ? (
        <GlassMomentSkeleton count={3} aspectRatio="portrait" />
      ) : sorted.length === 0 ? (
        <div className="rounded-xl glass-light p-6 flex flex-col items-center gap-2">
          <Clock size={24} className="text-apple-tertiaryLabel" />
          <DynamicType styleLevel="caption1" className="text-apple-secondaryLabel text-center">
            还没有成长记录，每月拍一张对比照吧 📸
          </DynamicType>
        </div>
      ) : (
        <div className={cn(
          'flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 px-1',
          selecting ? '' : 'snap-x snap-mandatory'
        )}>
          {sorted.map((moment, index) => {
            const isFirst = index === 0
            const isLast = index === sorted.length - 1
            const label = isFirst ? `🐣 ${formatDate(moment.takenAt)}` :
                         isLast ? '现在' :
                         formatDate(moment.takenAt)

            return (
              <div key={moment.id} className="flex items-center gap-2 snap-start shrink-0">
                {index > 0 && (
                  <ChevronRight size={20} className="text-apple-tertiaryLabel shrink-0" />
                )}
                <div className="relative shrink-0 w-[140px]">
                  {selecting && (
                    <button
                      onClick={() => toggleSelect(moment.id)}
                      className={cn(
                        'absolute top-1.5 left-1.5 z-10 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200',
                        selectedIds.has(moment.id)
                          ? 'bg-apple-blue text-white scale-110'
                          : 'bg-white/60 text-transparent hover:bg-white/80'
                      )}
                    >
                      ✓
                    </button>
                  )}
                  <button
                    onClick={selecting ? () => toggleSelect(moment.id) : () => onMomentClick(index)}
                    className="group w-full"
                  >
                    <GlassPanel
                      intensity="light"
                      className={cn(
                        'overflow-hidden transition-all duration-300',
                        selecting ? 'cursor-pointer' : 'cursor-pointer group-hover:scale-[1.02] group-hover:-translate-y-0.5 group-hover:shadow-xl'
                      )}
                    >
                      <div className="aspect-[3/4] relative">
                        <img
                          src={moment.imageUrl}
                          alt={moment.caption ?? ''}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none'
                          }}
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                          <DynamicType
                            styleLevel="caption2"
                            weight={600}
                            className="text-white truncate"
                            style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
                          >
                            {label}
                          </DynamicType>
                          {moment.caption && (
                            <DynamicType styleLevel="caption2" className="text-white/80 truncate">
                              {moment.caption}
                            </DynamicType>
                          )}
                        </div>
                      </div>
                    </GlassPanel>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Batch delete bar */}
      {selecting && selectedIds.size > 0 && (
        <div className="mt-3 flex justify-center">
          <button
            onClick={handleBatchDelete}
            className="flex items-center gap-2 px-4 py-2 rounded-xl glass-heavy text-red-400 text-apple-footnote font-semibold hover:bg-white/10 transition-all"
          >
            <Trash2 size={16} />
            删除选中 ({selectedIds.size})
          </button>
        </div>
      )}
    </div>
  )
}

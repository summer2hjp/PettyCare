// src/features/dashboard/components/GrowthTimelineSection.tsx

import { DynamicType } from '@/components/ui/DynamicType'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { GlassMomentSkeleton } from './GlassMomentSkeleton'
import { ChevronRight, Clock, Plus } from 'lucide-react'
import type { PetMoment } from '@/types/moments'

interface GrowthTimelineSectionProps {
  moments: PetMoment[]
  loading?: boolean
  error?: string | null
  onMomentClick: (index: number) => void
  onRetry?: () => void
  onUpload?: () => void
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
}: GrowthTimelineSectionProps) {
  const sorted = [...moments].sort(
    (a, b) => new Date(a.takenAt).getTime() - new Date(b.takenAt).getTime()
  )

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <DynamicType styleLevel="title3" weight={600}>📈 成长轨迹</DynamicType>
          {onUpload && (
            <button
              onClick={onUpload}
              className="w-6 h-6 rounded-full glass-light flex items-center justify-center hover:scale-110 transition-transform"
              title="上传照片"
            >
              <Plus size={14} />
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
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none snap-x snap-mandatory pb-1 px-1">
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
                <button
                  onClick={() => onMomentClick(index)}
                  className="group shrink-0 w-[140px]"
                >
                  <GlassPanel
                    intensity="light"
                    className="overflow-hidden cursor-pointer transition-all duration-300 group-hover:scale-[1.02] group-hover:-translate-y-0.5 group-hover:shadow-xl"
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
            )
          })}
        </div>
      )}
    </div>
  )
}

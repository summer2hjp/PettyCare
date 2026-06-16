// src/features/dashboard/components/MomentSection.tsx

import { useRef, useState, useEffect } from 'react'
import { cn } from '@/utils/cn'
import { DynamicType } from '@/components/ui/DynamicType'
import { ChevronRight, Camera } from 'lucide-react'
import { MomentCard } from './MomentCard'
import { GlassMomentSkeleton } from './GlassMomentSkeleton'
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
}: MomentSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollRight, setCanScrollRight] = useState(false)

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

  return (
    <div className="mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-baseline gap-2">
          <DynamicType styleLevel="title3" weight={600}>{title}</DynamicType>
          {subtitle && (
            <DynamicType styleLevel="caption1" className="text-apple-tertiaryLabel">
              {subtitle}
            </DynamicType>
          )}
        </div>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="flex items-center gap-0.5 text-apple-blue text-apple-footnote hover:opacity-80 transition-opacity"
          >
            View All
            <ChevronRight size={14} />
          </button>
        )}
      </div>

      {/* Content */}
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
        <GlassMomentSkeleton
          count={4}
          aspectRatio={momentType === 'daily' ? 'square' : momentType === 'interaction' ? 'landscape' : 'portrait'}
        />
      ) : moments.length === 0 ? (
        <div className="rounded-xl glass-light p-6 flex flex-col items-center gap-2">
          <Camera size={24} className="text-apple-tertiaryLabel" />
          <DynamicType styleLevel="caption1" className="text-apple-secondaryLabel text-center">
            {emptyMessage ?? '还没有记录'}
          </DynamicType>
        </div>
      ) : (
        <div className="relative">
          <div
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto scrollbar-none snap-x snap-mandatory pb-1"
          >
            {moments.map((moment, index) => (
              <MomentCard
                key={moment.id}
                moment={moment}
                type={momentType}
                onClick={() => onMomentClick(index)}
                style={{ transitionDelay: `${index * 60}ms` }}
              />
            ))}
          </div>

          {/* Right scroll hint */}
          {canScrollRight && moments.length > 2 && (
            <div className="absolute right-0 top-0 bottom-3 w-12 bg-gradient-to-l from-white/30 to-transparent pointer-events-none rounded-r-xl" />
          )}
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'
import { cn } from '@/utils/cn'
import { DynamicType } from '@/components/ui/DynamicType'
import type { PetMoment, MomentType } from '@/types/moments'

interface MomentCardProps {
  moment: PetMoment
  type: MomentType
  onClick: () => void
  className?: string
  style?: React.CSSProperties
}

const aspectClasses: Record<MomentType, string> = {
  daily: 'aspect-square',
  interaction: 'aspect-[4/3]',
  growth: 'aspect-[3/4]',
}

const glassClasses: Record<MomentType, string> = {
  daily: 'glass-light',
  interaction: 'glass',
  growth: 'glass-light',
}

const radiusClasses: Record<MomentType, string> = {
  daily: 'rounded-xl',
  interaction: 'rounded-2xl',
  growth: 'rounded-xl',
}

export function MomentCard({ moment, type, onClick, className, style }: MomentCardProps) {
  const [imgError, setImgError] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)

  return (
    <button
      onClick={onClick}
      className={cn(
        'shrink-0 overflow-hidden relative cursor-pointer',
        'transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5 hover:shadow-xl',
        radiusClasses[type],
        glassClasses[type],
        aspectClasses[type],
        'min-w-[140px]',
        className
      )}
      style={style}
    >
      {!imgLoaded && !imgError && (
        <div className="absolute inset-0 flex items-center justify-center animate-pulse bg-white/10">
          <div className="w-8 h-8 rounded-full bg-white/20" />
        </div>
      )}

      {imgError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-white/5">
          <span className="text-2xl">🐾</span>
          <DynamicType styleLevel="caption2" className="text-white/60">
            Load failed
          </DynamicType>
        </div>
      ) : (
        <img
          src={moment.imageUrl}
          alt={moment.caption ?? 'Pet moment'}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-300',
            imgLoaded ? 'opacity-100' : 'opacity-0'
          )}
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgError(true)}
          loading="lazy"
        />
      )}

      {/* Caption overlay */}
      {moment.caption && (
        <div className={cn(
          'absolute bottom-0 left-0 right-0 p-2',
          type === 'interaction'
            ? 'bg-gradient-to-t from-black/60 to-transparent'
            : 'bg-white/20 backdrop-blur-sm'
        )}>
          <DynamicType
            styleLevel="caption2"
            weight={600}
            className="text-white truncate"
            style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
          >
            {moment.caption}
          </DynamicType>
        </div>
      )}
    </button>
  )
}

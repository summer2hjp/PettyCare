import { cn } from '@/utils/cn'

interface GlassMomentSkeletonProps {
  count?: number
  aspectRatio?: 'square' | 'landscape' | 'portrait'
  className?: string
}

const aspectClasses = {
  square: 'aspect-square',
  landscape: 'aspect-[4/3]',
  portrait: 'aspect-[3/4]',
}

export function GlassMomentSkeleton({ count = 4, aspectRatio = 'square', className }: GlassMomentSkeletonProps) {
  return (
    <div className={cn('flex gap-3 overflow-x-auto scrollbar-none', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'shrink-0 rounded-xl glass-light',
            aspectClasses[aspectRatio],
            'min-w-[140px]'
          )}
        >
          <div className="w-full h-full flex items-center justify-center animate-pulse">
            <div className="w-8 h-8 rounded-full bg-white/20" />
          </div>
        </div>
      ))}
    </div>
  )
}

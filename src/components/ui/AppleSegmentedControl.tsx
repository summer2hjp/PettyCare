import { cn } from '@/utils/cn'

interface Segment { value: string; label: string }

interface AppleSegmentedControlProps {
  segments: Segment[]; value: string; onChange: (value: string) => void; className?: string
}

export function AppleSegmentedControl({ segments, value, onChange, className }: AppleSegmentedControlProps) {
  return (
    <div className={cn('inline-flex p-0.5 rounded-apple-lg bg-[var(--apple-fill)] gap-0.5 flex-nowrap', className)}>
      {segments.map(seg => {
        const isActive = seg.value === value
        return (
          <button
            key={seg.value}
            onClick={() => onChange(seg.value)}
            className={cn(
              'px-2 py-1 rounded-apple-lg text-apple-caption-1 font-medium transition-all duration-200',
              isActive && 'bg-apple-blue text-white shadow-apple-sm',
              !isActive && 'text-apple-secondaryLabel hover:text-apple-label',
            )}
          >
            {seg.label}
          </button>
        )
      })}
    </div>
  )
}

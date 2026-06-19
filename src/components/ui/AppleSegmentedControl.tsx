import { cn } from '@/utils/cn'

interface Segment { value: string; label: string }

interface AppleSegmentedControlProps {
  segments: Segment[]; value: string; onChange: (value: string) => void; className?: string
}

export function AppleSegmentedControl({ segments, value, onChange, className }: AppleSegmentedControlProps) {
  return (
    <div className={cn('inline-flex p-0.5 rounded-mm-md bg-[var(--mm-fill)] gap-0.5 flex-nowrap', className)}>
      {segments.map(seg => {
        const isActive = seg.value === value
        return (
          <button
            key={seg.value}
            onClick={() => onChange(seg.value)}
            className={cn(
              'px-3 py-1.5 rounded-mm-sm text-mm-small font-medium transition-all duration-200',
              isActive && 'bg-[var(--mm-card)] text-[var(--mm-label)] shadow-mm-subtle',
              !isActive && 'text-[var(--mm-secondaryLabel)] hover:text-[var(--mm-label)]',
            )}
          >
            {seg.label}
          </button>
        )
      })}
    </div>
  )
}

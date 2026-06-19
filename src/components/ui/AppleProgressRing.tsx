import { cn } from '@/utils/cn'

interface AppleProgressRingProps {
  progress: number; size?: number; strokeWidth?: number
  color?: string; trackColor?: string
  children?: React.ReactNode; className?: string
}

export function AppleProgressRing({
  progress, size = 72, strokeWidth = 6, color = 'var(--mm-link)', trackColor = 'var(--mm-fill)', children, className,
}: AppleProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - Math.min(Math.max(progress, 0), 1))

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={trackColor} strokeWidth={strokeWidth} />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} className="transition-all duration-1000" />
      </svg>
      {children && <div className="absolute inset-0 flex items-center justify-center">{children}</div>}
    </div>
  )
}

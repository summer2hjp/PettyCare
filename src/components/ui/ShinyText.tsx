import { cn } from '@/utils/cn'

export interface ShinyTextProps {
  text: string
  disabled?: boolean
  speed?: number
  className?: string
  color?: string
  shineColor?: string
  spread?: number
  yoyo?: boolean
  pauseOnHover?: boolean
  direction?: 'left' | 'right'
  delay?: number
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'span' | 'p' | 'div'
}

export function ShinyText({
  text,
  disabled = false,
  speed = 2,
  className,
  color = '#b5b5b5',
  shineColor = '#ffffff',
  spread = 120,
  yoyo = false,
  pauseOnHover = false,
  direction = 'left',
  delay = 0,
  as: Tag = 'span',
}: ShinyTextProps) {
  const bgPosFrom = direction === 'left' ? `-${spread}px` : `${spread}px`
  const bgPosTo = direction === 'left' ? `${spread}px` : `-${spread}px`

  return (
    <Tag
      className={cn(
        'shiny-text',
        pauseOnHover && 'shiny-text-pause',
        className,
      )}
      style={{
        color: disabled ? color : 'transparent',
        backgroundImage: disabled
          ? 'none'
          : `linear-gradient(90deg, ${color} 0%, ${color} 40%, ${shineColor} 50%, ${color} 60%, ${color} 100%)`,
        backgroundSize: `${spread * 2 + 100}% 100%`,
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: disabled ? color : 'transparent',
        animationDelay: `${delay}s`,
        ['--shine-speed' as string]: `${speed}s`,
        ['--shine-bg-from' as string]: bgPosFrom,
        ['--shine-bg-to' as string]: bgPosTo,
        ['--shine-yoyo' as string]: yoyo ? 'alternate' : 'normal',
      }}
    >
      {text}
    </Tag>
  )
}
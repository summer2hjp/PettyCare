import { cn } from '@/utils/cn'
import type { ReactNode, HTMLAttributes } from 'react'
import { useTheme } from '@/hooks/useTheme'
import SpotlightCard from '@/components/ui/SpotlightCard'

interface AppleCardProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode
  padding?: 'sm' | 'md' | 'lg'
  hoverable?: boolean
  as?: 'div' | 'section' | 'article'
}

const paddingStyles = { sm: 'p-4', md: 'p-5', lg: 'p-6' }

export function AppleCard({
  children, padding = 'md', hoverable = false, as: Tag = 'div', className, ...props
}: AppleCardProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const inner = (
    <Tag
      className={cn(
        'mm-card', paddingStyles[padding],
        hoverable && 'cursor-pointer hover:-translate-y-0.5',
        'transition-all duration-300', className,
      )}
      {...props}
    >
      {children}
    </Tag>
  )

  if (isDark) {
    // ponytail: wrap in SpotlightCard for dark mode glow effect
    return <SpotlightCard className="rounded-mm-xl">{inner}</SpotlightCard>
  }

  return inner
}
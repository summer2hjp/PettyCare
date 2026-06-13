import { cn } from '@/utils/cn'
import { useState } from 'react'

interface AppleAvatarProps {
  src?: string; name?: string; size?: 'sm' | 'md' | 'lg' | 'xl'; className?: string
}

const sizeMap = { sm: 'w-8 h-8 text-apple-footnote', md: 'w-10 h-10 text-apple-callout', lg: 'w-14 h-14 text-apple-body', xl: 'w-20 h-20 text-apple-title-3' }

function getInitials(name?: string): string {
  if (!name) return ''
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

export function AppleAvatar({ src, name, size = 'md', className }: AppleAvatarProps) {
  const [imgError, setImgError] = useState(false)
  const initials = getInitials(name)
  const showFallback = !src || imgError

  return (
    <div className={cn(sizeMap[size], 'rounded-full flex items-center justify-center bg-[var(--apple-fill)] text-apple-secondaryLabel font-semibold ring-1 ring-[var(--apple-separator)] overflow-hidden shrink-0 select-none', className)}>
      {showFallback ? (initials || '🐾') : (
        <img src={src} alt={name ?? ''} className="w-full h-full object-cover" onError={() => setImgError(true)} />
      )}
    </div>
  )
}

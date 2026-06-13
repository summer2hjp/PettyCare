import { cn } from '@/utils/cn'

interface LoadingStateProps {
  lines?: number; card?: boolean; message?: string; className?: string
}

export function LoadingState({ lines = 3, card = false, message, className }: LoadingStateProps) {
  if (card) {
    return (
      <div className={cn('apple-card p-5 space-y-4', className)}>
        <div className="skeleton h-5 w-3/5" />
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="skeleton h-4 w-full" style={{ width: `${80 - i * 15}%` }} />
        ))}
      </div>
    )
  }
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4 gap-4', className)}>
      <div className="flex gap-1.5">
        {[0, 1, 2].map(i => (
          <div key={i} className="w-2.5 h-2.5 rounded-full bg-apple-blue opacity-30 animate-pulse-soft"
            style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
      {message && <p className="text-apple-subhead text-apple-tertiaryLabel animate-pulse-soft">{message}</p>}
    </div>
  )
}

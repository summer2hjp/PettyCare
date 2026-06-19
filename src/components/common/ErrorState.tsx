import { cn } from '@/utils/cn'
import { AppleButton } from '@/components/ui/AppleButton'
import { RefreshCw } from 'lucide-react'

interface ErrorStateProps {
  title?: string; message?: string; onRetry?: () => void; className?: string
}

export function ErrorState({
  title = 'Something went wrong', message = 'An unexpected error occurred. Please try again.', onRetry, className,
}: ErrorStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-6 text-center', className)}>
      <div className="mb-5 w-16 h-16 rounded-full bg-[#FF3B30]/10 flex items-center justify-center text-3xl">⚠️</div>
      <h3 className="text-mm-card-title text-[var(--mm-label)] mb-1.5">{title}</h3>
      <p className="text-mm-caption text-[var(--mm-tertiaryLabel)] max-w-xs mb-5">{message}</p>
      {onRetry && (
        <AppleButton variant="secondary" icon={<RefreshCw size={16} />} onClick={onRetry}>Try Again</AppleButton>
      )}
    </div>
  )
}

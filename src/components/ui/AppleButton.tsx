import { cn } from '@/utils/cn'
import { Loader2 } from 'lucide-react'
import type { ReactNode, ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'plain'
type ButtonSize = 'sm' | 'md' | 'lg'

interface AppleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  icon?: ReactNode
  children?: ReactNode
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-apple-blue text-white hover:brightness-110 active:brightness-90 shadow-apple-sm hover:shadow-apple-md disabled:opacity-40 disabled:shadow-none',
  secondary: 'bg-[var(--apple-fill)] text-apple-label hover:bg-[var(--apple-secondaryFill)] active:brightness-95 disabled:opacity-40',
  plain: 'bg-transparent text-apple-blue hover:bg-[var(--apple-fill)] disabled:opacity-40',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-[28px] px-3 text-apple-caption-1 gap-1',
  md: 'h-[34px] px-4 text-apple-footnote gap-1.5',
  lg: 'h-[40px] px-5 text-apple-subhead gap-2',
}

export function AppleButton({
  variant = 'primary', size = 'md', loading = false, icon, children, className, disabled, ...props
}: AppleButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-apple-lg font-semibold',
        'transition-all duration-200 active:scale-[0.97]',
        variantStyles[variant], sizeStyles[size], className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 size={size === 'sm' ? 14 : 18} className="animate-spin" /> : icon}
      {children && <span>{children}</span>}
    </button>
  )
}

import { cn } from '@/utils/cn'
import { Loader2 } from 'lucide-react'
import type { ReactNode, ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'plain' | 'pill' | 'dark'
type ButtonSize = 'sm' | 'md' | 'lg'

interface AppleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  icon?: ReactNode
  children?: ReactNode
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-[var(--mm-link)] text-white hover:brightness-110 active:brightness-90 shadow-mm-subtle disabled:opacity-40 disabled:shadow-none',
  secondary: 'bg-[var(--mm-fill)] text-[var(--mm-label)] hover:bg-[var(--mm-secondaryBackground)] active:brightness-95 disabled:opacity-40',
  plain: 'bg-transparent text-[var(--mm-link)] hover:bg-[var(--mm-fill)] disabled:opacity-40',
  pill: 'bg-[var(--mm-fill)] text-[var(--mm-label)] rounded-mm-pill hover:bg-[var(--mm-secondaryBackground)] active:brightness-95 font-medium',
  dark: 'bg-[#181e25] text-white hover:bg-[#2a3038] active:brightness-90 shadow-mm-subtle',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-[32px] px-[12px] text-mm-button gap-1.5',
  md: 'h-[38px] px-5 text-mm-button gap-1.5',
  lg: 'h-[44px] px-6 text-mm-body gap-2',
}

export function AppleButton({
  variant = 'primary', size = 'md', loading = false, icon, children, className, disabled, ...props
}: AppleButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-mm-sm font-semibold',
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

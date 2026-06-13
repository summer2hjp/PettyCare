import { cn } from '@/utils/cn'
import type { InputHTMLAttributes } from 'react'

interface AppleSwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  size?: 'sm' | 'md'
}

export function AppleSwitch({ size = 'md', className, checked, onChange, disabled, ...props }: AppleSwitchProps) {
  return (
    <label className={cn('relative inline-flex items-center cursor-pointer', disabled && 'opacity-40 cursor-not-allowed', className)}>
      <input type="checkbox" checked={checked} onChange={onChange} disabled={disabled} className="sr-only peer" {...props} />
      <div className={cn(
        size === 'sm' ? 'w-9 h-5' : 'w-12 h-7',
        'rounded-full p-0.5 bg-[var(--apple-fill)] peer-checked:bg-apple-green transition-colors duration-300',
      )}>
        <div className={cn(
          size === 'sm' ? 'w-3.5 h-3.5' : 'w-5 h-5',
          'rounded-full bg-white shadow-apple-sm peer-checked:translate-x-full transition-transform duration-300',
        )} />
      </div>
    </label>
  )
}

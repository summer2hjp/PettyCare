import { cn } from '@/utils/cn'
import type { InputHTMLAttributes } from 'react'

interface AppleSwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  size?: 'sm' | 'md'
}

export function AppleSwitch({ size = 'sm', className, checked, onChange, disabled, ...props }: AppleSwitchProps) {
  return (
    <label className={cn('relative inline-flex items-center cursor-pointer -mt-[1px]', disabled && 'opacity-40 cursor-not-allowed', className)}>
      <input type="checkbox" checked={checked} onChange={onChange} disabled={disabled} className="sr-only" {...props} />
      <div className={cn(
        size === 'sm' ? 'w-[36px] h-[20px]' : 'w-[44px] h-[24px]',
        'rounded-mm-pill p-[2px] transition-all duration-[250ms]',
        checked ? 'bg-[var(--mm-link)]' : 'bg-[var(--mm-separator)]',
      )}>
        <div className={cn(
          size === 'sm' ? 'w-[16px] h-[16px]' : 'w-[20px] h-[20px]',
          'rounded-full bg-white transition-all duration-[250ms]',
          'shadow-[0_1px_3px_rgba(0,0,0,0.2),0_1px_1px_rgba(0,0,0,0.1)]',
          checked && (size === 'sm' ? 'translate-x-[16px]' : 'translate-x-[20px]'),
        )} />
      </div>
    </label>
  )
}

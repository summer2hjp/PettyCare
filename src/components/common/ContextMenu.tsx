import { cn } from '@/utils/cn'
import { useEffect, useRef, useState, type ReactNode } from 'react'

export interface ContextMenuItem {
  id: string; label: string; icon?: ReactNode; danger?: boolean; disabled?: boolean; onClick: () => void
}

interface ContextMenuProps {
  items: ContextMenuItem[]; children: ReactNode; className?: string
}

export function ContextMenu({ items, children, className }: ContextMenuProps) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false)
    }
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    if (open) { document.addEventListener('mousedown', handleClick); document.addEventListener('keydown', handleEsc) }
    return () => { document.removeEventListener('mousedown', handleClick); document.removeEventListener('keydown', handleEsc) }
  }, [open])

  return (
    <div onContextMenu={(e) => { e.preventDefault(); setPos({ x: e.clientX, y: e.clientY }); setOpen(true) }} className={className}>
      {children}
      {open && (
        <div ref={menuRef} style={{ left: pos.x, top: pos.y }}
          className={cn('fixed z-50 min-w-[180px] py-1 bg-[var(--mm-card)] rounded-mm-lg shadow-mm-card border border-[var(--mm-separator)] animate-scale-in origin-top-left')}>
          {items.map(item => (
            <button key={item.id} disabled={item.disabled}
              onClick={() => { item.onClick(); setOpen(false) }}
              className={cn('w-full flex items-center gap-3 px-4 py-2 text-mm-caption text-[var(--mm-label)] hover:bg-[var(--mm-fill)] transition-colors duration-100', item.danger && 'text-[#FF3B30]', item.disabled && 'opacity-40 cursor-not-allowed')}>
              {item.icon && <span className="w-4 h-4 flex items-center">{item.icon}</span>}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

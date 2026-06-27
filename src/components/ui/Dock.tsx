// ponytail: Simple macOS-style dock with css transform scale on hover
import { useRef, useState, useCallback } from 'react'
import { cn } from '@/utils/cn'

export interface DockItem {
  id: string
  icon: React.ReactNode
  label: string
  onClick?: () => void
  ariaLabel?: string
}

export interface DockProps {
  items: DockItem[]
  className?: string
  magnification?: number
  distance?: number
  panelHeight?: number
  dockHeight?: number
  baseItemSize?: number
}

export function Dock({
  items,
  className,
  magnification = 70,
  distance = 200,
  panelHeight = 68,
  dockHeight = 256,
  baseItemSize = 50,
}: DockProps) {
  const dockRef = useRef<HTMLDivElement>(null)

  const getScale = useCallback(
    (itemIndex: number, mouseX: number | null) => {
      if (mouseX === null) return 1
      const dockEl = dockRef.current
      if (!dockEl) return 1

      const rect = dockEl.getBoundingClientRect()
      const totalItems = items.length
      const itemWidth = rect.width / totalItems
      const itemCenter = rect.left + itemWidth * itemIndex + itemWidth / 2
      const dist = Math.abs(mouseX - itemCenter)

      if (dist > distance) return 1
      const scale = 1 + (magnification / 100) * Math.max(0, 1 - dist / distance)
      return Math.min(scale, 2.5)
    },
    [items.length, magnification, distance],
  )

  const [mouseX, setMouseX] = useState<number | null>(null)

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      setMouseX(e.clientX)
    },
    [],
  )

  const handleMouseLeave = useCallback(() => {
    setMouseX(null)
  }, [])

  return (
    <div
      ref={dockRef}
      role="toolbar"
      aria-label="Application dock"
      className={cn(
        'flex items-end justify-center',
        className,
      )}
      style={{ height: dockHeight }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className={cn(
          'flex items-end gap-1 px-3 pb-1.5',
          'rounded-2xl',
          'bg-black/20 backdrop-blur-xl',
          'border border-white/10',
          'shadow-lg',
        )}
        style={{ height: panelHeight }}
      >
        {items.map((item, index) => {
          const scale = getScale(index, mouseX)

          return (
            <button
              key={item.id}
              type="button"
              aria-label={item.ariaLabel ?? item.label}
              title={item.label}
              onClick={item.onClick}
              onMouseEnter={() => {}}
              className={cn(
                'flex items-center justify-center rounded-xl',
                'transition-colors duration-150',
                'hover:bg-white/10',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40',
              )}
              style={{
                width: baseItemSize,
                height: baseItemSize,
                transform: `scale(${scale})`,
                transition: 'transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            >
              <span className="text-white/90">{item.icon}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
// ponytail: Canvas-based shape grid — no React state per shape, just rAF + direct canvas draw
import { useRef, useEffect, useCallback } from 'react'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/utils/cn'

export type ShapeType = 'square' | 'hexagon' | 'triangle' | 'circle'
export type AnimDirection = 'right' | 'left' | 'up' | 'down' | 'diagonal'

export interface ShapeGridProps {
  direction?: AnimDirection
  speed?: number
  borderColor?: string
  squareSize?: number
  shape?: ShapeType
  hoverTrailAmount?: number
  className?: string
}

function drawShape(
  ctx: CanvasRenderingContext2D,
  type: ShapeType,
  cx: number,
  cy: number,
  size: number,
  color: string,
  fillAlpha: number,
) {
  ctx.strokeStyle = color
  ctx.lineWidth = 1
  ctx.fillStyle = `rgba(255,255,255,${fillAlpha})`

  switch (type) {
    case 'square': {
      const hs = size / 2
      ctx.strokeRect(cx - hs, cy - hs, size, size)
      ctx.fillRect(cx - hs, cy - hs, size, size)
      break
    }
    case 'circle': {
      ctx.beginPath()
      ctx.arc(cx, cy, size / 2, 0, Math.PI * 2)
      ctx.stroke()
      ctx.fill()
      break
    }
    case 'triangle': {
      const h = (size * Math.sqrt(3)) / 2
      ctx.beginPath()
      ctx.moveTo(cx, cy - h / 2)
      ctx.lineTo(cx - size / 2, cy + h / 2)
      ctx.lineTo(cx + size / 2, cy + h / 2)
      ctx.closePath()
      ctx.stroke()
      ctx.fill()
      break
    }
    case 'hexagon': {
      ctx.beginPath()
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 6
        const x = cx + (size / 2) * Math.cos(angle)
        const y = cy + (size / 2) * Math.sin(angle)
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      }
      ctx.closePath()
      ctx.stroke()
      ctx.fill()
      break
    }
  }
}

export function ShapeGrid({
  direction = 'right',
  speed = 1,
  borderColor = '#999',
  squareSize = 40,
  shape = 'square',
  hoverTrailAmount = 0,
  className,
}: ShapeGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const offsetRef = useRef(0)
  const rafRef = useRef(0)
  const mouseRef = useRef({ x: -1000, y: -1000 })
  const hoveredRef = useRef<{ row: number; col: number } | null>(null)
  const trailRef = useRef<{ row: number; col: number; alpha: number }[]>([])
  const { theme } = useTheme()

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = canvas.width
    const h = canvas.height
    const gap = squareSize + 8
    const cols = Math.ceil(w / gap) + 2
    const rows = Math.ceil(h / gap) + 2

    ctx.clearRect(0, 0, w, h)

    offsetRef.current += speed * 0.3

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        let x = c * gap
        let y = r * gap

        const rowOffset = (r * 10 + offsetRef.current) % (gap * 2)
        switch (direction) {
          case 'right': x += offsetRef.current % (gap * 2); break
          case 'left': x -= offsetRef.current % (gap * 2); break
          case 'up': y -= offsetRef.current % (gap * 2); break
          case 'down': y += offsetRef.current % (gap * 2); break
          case 'diagonal': x += rowOffset; y += rowOffset * 0.5; break
        }

        if (x > w + gap) x -= (w + gap * 2)
        if (y > h + gap) y -= (h + gap * 2)
        if (x < -gap) x += (w + gap * 2)
        if (y < -gap) y += (h + gap * 2)

        const colIdx = Math.round((x - offsetRef.current % (gap * 2)) / gap)
        const rowIdx = r
        const isHovered = hoveredRef.current?.row === rowIdx && hoveredRef.current?.col === colIdx

        let trailAlpha = 0
        if (hoverTrailAmount > 0) {
          const trail = trailRef.current.find(t => t.row === rowIdx && t.col === colIdx)
          if (trail) trailAlpha = trail.alpha
        }

        drawShape(ctx, shape, x, y, squareSize, borderColor, isHovered ? 0.15 : trailAlpha)
      }
    }
  }, [direction, speed, borderColor, squareSize, shape, hoverTrailAmount])

  useEffect(() => {
    if (theme !== 'dark') return

    const canvas = canvasRef.current
    if (!canvas) return

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio
      canvas.height = canvas.offsetHeight * window.devicePixelRatio
      canvas.style.width = `${canvas.offsetWidth}px`
      canvas.style.height = `${canvas.offsetHeight}px`
    }
    resize()
    window.addEventListener('resize', resize)

    const loop = () => {
      draw()
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [draw, theme])

  useEffect(() => {
    if (theme !== 'dark') return

    const canvas = canvasRef.current
    if (!canvas) return

    const handleMouse = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top
      mouseRef.current = { x: mx, y: my }

      const gap = squareSize + 8
      const col = Math.round((mx - offsetRef.current % (gap * 2)) / gap)
      const row = Math.round(my / gap)

      const prev = hoveredRef.current
      hoveredRef.current = { row, col }

      if (hoverTrailAmount > 0) {
        if (prev && (prev.row !== row || prev.col !== col)) {
          trailRef.current.push({ ...prev, alpha: 1 })
        }
        trailRef.current = trailRef.current
          .map(t => ({ ...t, alpha: t.alpha - 0.02 }))
          .filter(t => t.alpha > 0)
      }
    }

    canvas.addEventListener('mousemove', handleMouse)
    return () => canvas.removeEventListener('mousemove', handleMouse)
  }, [squareSize, hoverTrailAmount, theme])

  if (theme !== 'dark') return null

  return (
    <canvas
      ref={canvasRef}
      className={cn('w-full h-full', className)}
      aria-hidden="true"
    />
  )
}
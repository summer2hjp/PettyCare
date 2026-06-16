import { useState, useEffect, useCallback } from 'react'
import { cn } from '@/utils/cn'
import { DynamicType } from '@/components/ui/DynamicType'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { X, ChevronLeft, ChevronRight, RefreshCw, Trash2 } from 'lucide-react'
import type { PetMoment } from '@/types/moments'

interface PhotoPreviewProps {
  moments: PetMoment[]
  initialIndex: number
  onClose: () => void
  onDelete?: (moment: PetMoment) => void
}

export function PhotoPreview({ moments, initialIndex, onClose, onDelete }: PhotoPreviewProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [imgError, setImgError] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)
  const [closing, setClosing] = useState(false)
  const [loading, setLoading] = useState(true)

  const current = moments[currentIndex]

  const goTo = useCallback((index: number) => {
    if (index < 0 || index >= moments.length) return
    setCurrentIndex(index)
    setImgError(false)
    setImgLoaded(false)
    setLoading(true)
  }, [moments.length])

  const goNext = useCallback(() => goTo(currentIndex + 1), [goTo, currentIndex])
  const goPrev = useCallback(() => goTo(currentIndex - 1), [goTo, currentIndex])

  const handleClose = useCallback(() => {
    setClosing(true)
    setTimeout(onClose, 200)
  }, [onClose])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape': handleClose(); break
        case 'ArrowLeft': goPrev(); break
        case 'ArrowRight': goNext(); break
      }
    }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [handleClose, goPrev, goNext])

  if (!current) return null

  const typeLabel: Record<string, string> = {
    daily: '宠物的日常',
    interaction: '互动瞬间',
    growth: '成长轨迹',
  }

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex flex-col items-center justify-center',
        'backdrop-blur-xl bg-black/60',
        'transition-all duration-200',
        closing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
      )}
      onClick={handleClose}
    >
      {/* Top buttons */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              if (confirm('确定删除这张照片吗？')) {
                onDelete(current)
                if (moments.length <= 1) handleClose()
              }
            }}
            className="w-10 h-10 rounded-full glass-heavy flex items-center justify-center hover:bg-white/20 transition-colors hover:text-red-400"
            title="删除照片"
          >
            <Trash2 size={18} />
          </button>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); handleClose() }}
          className="w-10 h-10 rounded-full glass-heavy flex items-center justify-center hover:bg-white/20 transition-colors"
        >
          <X size={20} className="text-white" />
        </button>
      </div>

      {/* Left arrow */}
      {currentIndex > 0 && (
        <button
          onClick={(e) => { e.stopPropagation(); goPrev() }}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full glass-heavy flex items-center justify-center hover:bg-white/20 transition-colors"
        >
          <ChevronLeft size={24} className="text-white" />
        </button>
      )}

      {/* Right arrow */}
      {currentIndex < moments.length - 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); goNext() }}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full glass-heavy flex items-center justify-center hover:bg-white/20 transition-colors"
        >
          <ChevronRight size={24} className="text-white" />
        </button>
      )}

      {/* Image */}
      <div
        className="relative max-w-[80vw] max-h-[70vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {loading && !imgError && (
          <div className="w-[400px] h-[300px] rounded-2xl glass-heavy flex items-center justify-center animate-pulse">
            <div className="w-10 h-10 rounded-full bg-white/10" />
          </div>
        )}

        {imgError ? (
          <div className="rounded-2xl glass-heavy p-12 flex flex-col items-center gap-3">
            <RefreshCw size={32} className="text-white/40" />
            <DynamicType styleLevel="body" className="text-white/60">
              图片加载失败
            </DynamicType>
            <button
              onClick={() => {
                setImgError(false)
                setLoading(true)
                const img = new Image()
                img.src = current.imageUrl
                img.onload = () => { setImgLoaded(true); setLoading(false) }
                img.onerror = () => { setImgError(true); setLoading(false) }
              }}
              className="px-4 py-2 rounded-lg glass-light text-white text-apple-footnote hover:bg-white/10 transition-colors"
            >
              重试
            </button>
          </div>
        ) : (
          <img
            src={current.imageUrl}
            alt={current.caption ?? ''}
            className={cn(
              'max-w-full max-h-[70vh] object-contain rounded-2xl',
              'transition-all duration-300',
              imgLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            )}
            onLoad={() => { setImgLoaded(true); setLoading(false) }}
            onError={() => { setImgError(true); setLoading(false) }}
          />
        )}
      </div>

      {/* Caption bar */}
      <div onClick={(e) => e.stopPropagation()}>
        <GlassPanel
          intensity="heavy"
          className="mt-4 px-6 py-3 flex items-center gap-4 max-w-[80vw]"
          as="div"
        >
          <div className="flex-1 min-w-0">
            <DynamicType styleLevel="body" weight={600} className="text-white">
              {current.caption ?? '无标题'}
            </DynamicType>
            <div className="flex items-center gap-3 mt-0.5">
              <DynamicType styleLevel="caption2" className="text-white/60">
                {current.takenAt}
              </DynamicType>
              <DynamicType styleLevel="caption2" className="text-white/40">·</DynamicType>
              <DynamicType styleLevel="caption2" className="text-white/60">
                {typeLabel[current.momentType] ?? current.momentType}
              </DynamicType>
            </div>
          </div>
          <DynamicType styleLevel="caption2" className="text-white/40">
            {currentIndex + 1} / {moments.length}
          </DynamicType>
        </GlassPanel>
      </div>

      {/* Thumbnail strip */}
      <div
        className="flex gap-2 mt-3 overflow-x-auto scrollbar-none max-w-[80vw] px-2"
        onClick={(e) => e.stopPropagation()}
      >
        {moments.map((moment, idx) => (
          <button
            key={moment.id}
            onClick={() => goTo(idx)}
            className={cn(
              'w-12 h-12 rounded-lg overflow-hidden shrink-0 transition-all duration-200',
              idx === currentIndex ? 'ring-2 ring-white scale-110' : 'opacity-50 hover:opacity-80'
            )}
          >
            <img
              src={moment.imageUrl}
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </button>
        ))}
      </div>
    </div>
  )
}

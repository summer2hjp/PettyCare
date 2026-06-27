import { useRef, useState, useEffect, useCallback } from 'react'
import { DynamicType } from '@/components/ui/DynamicType'
import { MomentCard } from '@/features/dashboard/components/MomentCard'
import { GlassMomentSkeleton } from '@/features/dashboard/components/GlassMomentSkeleton'
import { usePetMoments } from '@/features/dashboard/hooks/usePetMoments'
import { cn } from '@/utils/cn'
import { Camera, Plus, Trash2, X as XIcon } from 'lucide-react'
import type { Pet } from '@/types/pet'

interface GrowthMomentsProps {
  petId?: string | null
  pets?: Pet[]
  limit?: number
}

export default function GrowthMoments({ petId = null, pets = [], limit = 10 }: GrowthMomentsProps) {
  const { moments, loading, error, refresh } = usePetMoments({ petId, type: 'growth', limit, pets })
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const [selecting, setSelecting] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const check = () => setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10)
    check()
    el.addEventListener('scroll', check)
    window.addEventListener('resize', check)
    return () => { el.removeEventListener('scroll', check); window.removeEventListener('resize', check) }
  }, [moments])

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n })
  }, [])

  const handleDelete = useCallback(() => {
    if (selectedIds.size === 0) return
    if (!confirm(`确定删除选中的 ${selectedIds.size} 张照片吗？`)) return
    refresh()
    setSelecting(false)
    setSelectedIds(new Set())
  }, [selectedIds, refresh])

  if (error) {
    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3 px-1">
          <DynamicType styleLevel="section" weight={600}>📈 成长轨迹</DynamicType>
        </div>
        <div className="rounded-xl glass-light p-5 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <DynamicType styleLevel="button" weight={600} className="text-[#FF3B30]">加载失败</DynamicType>
            <DynamicType styleLevel="small" className="text-[var(--mm-secondaryLabel)]">{error}</DynamicType>
          </div>
          <button onClick={refresh} className="px-3 py-1.5 rounded-lg glass-light text-[var(--mm-link)] text-mm-caption">重试</button>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <DynamicType styleLevel="section" weight={600}>📈 成长轨迹</DynamicType>
          {pets.length > 0 && !selecting && (
            <button className="w-6 h-6 rounded-full glass-light flex items-center justify-center hover:scale-110 transition-transform" title="上传照片">
              <Plus size={14} />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          {moments.length > 0 && !selecting && (
            <button onClick={() => setSelecting(true)} className="text-[var(--mm-link)] text-mm-caption">选择</button>
          )}
          {selecting && (
            <button onClick={() => { setSelecting(false); setSelectedIds(new Set()) }} className="flex items-center gap-1 text-[#FF3B30] text-mm-caption">
              <XIcon size={14} /> 取消
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <GlassMomentSkeleton count={6} aspectRatio="square" />
      ) : moments.length === 0 ? (
        <div className="rounded-xl glass-light p-6 flex flex-col items-center gap-2">
          <Camera size={24} className="text-[var(--mm-tertiaryLabel)]" />
          <DynamicType styleLevel="caption" className="text-[var(--mm-secondaryLabel)]">还没有成长记录</DynamicType>
        </div>
      ) : (
        <div className="relative">
          <div ref={scrollRef} className={cn('flex gap-2 overflow-x-auto pb-1', selecting ? '' : 'scrollbar-none snap-x snap-mandatory')}>
            {moments.map(moment => (
              <div key={moment.id} className="relative shrink-0">
                {selecting && (
                  <button onClick={() => toggleSelect(moment.id)} className={cn(
                    'absolute top-1.5 left-1.5 z-10 w-6 h-6 rounded-full flex items-center justify-center',
                    selectedIds.has(moment.id) ? 'bg-[var(--mm-link)] text-white scale-110' : 'bg-white/60'
                  )}>✓</button>
                )}
                <MomentCard moment={moment} type="growth" onClick={selecting ? () => toggleSelect(moment.id) : () => {}} />
              </div>
            ))}
          </div>
          {canScrollRight && moments.length > 3 && !selecting && (
            <div className="absolute right-0 top-0 bottom-3 w-12 bg-gradient-to-l from-white/30 to-transparent pointer-events-none rounded-r-xl" />
          )}
        </div>
      )}

      {selecting && selectedIds.size > 0 && (
        <div className="mt-3 flex justify-center">
          <button onClick={handleDelete} className="flex items-center gap-2 px-4 py-2 rounded-xl glass-heavy text-red-400 text-mm-caption">
            <Trash2 size={16} /> 删除选中 ({selectedIds.size})
          </button>
        </div>
      )}
    </div>
  )
}
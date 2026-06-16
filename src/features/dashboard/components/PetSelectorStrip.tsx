import { useRef, useEffect } from 'react'
import { cn } from '@/utils/cn'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { DynamicType } from '@/components/ui/DynamicType'
import type { Pet } from '@/types/pet'

interface PetSelectorStripProps {
  pets: Pet[]
  activePetId: string | null
  onSelect: (petId: string | null) => void
  loading?: boolean
}

function SkeletonPet() {
  return (
    <div className="flex flex-col items-center gap-1.5 min-w-[60px]">
      <div className="h-3 w-12 skeleton rounded" />
      <div className="h-3 w-8 skeleton rounded" />
    </div>
  )
}

export function PetSelectorStrip({ pets, activePetId, onSelect, loading }: PetSelectorStripProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      const container = scrollRef.current
      const el = activeRef.current
      const offset = el.offsetLeft - container.clientWidth / 2 + el.clientWidth / 2
      container.scrollTo({ left: Math.max(0, offset), behavior: 'smooth' })
    }
  }, [activePetId])

  if (loading) {
    return (
      <div className="mb-6">
        <div ref={scrollRef} className="flex gap-3 overflow-x-auto scrollbar-none px-1">
          <SkeletonPet />
          <SkeletonPet />
          <SkeletonPet />
          <SkeletonPet />
        </div>
      </div>
    )
  }

  if (pets.length === 0) return null

  return (
    <div className="mb-6">
      <div ref={scrollRef} className="flex gap-3 overflow-x-auto scrollbar-none snap-x snap-mandatory px-1 pb-1">
        {/* "All Pets" button — only if more than 1 pet */}
        {pets.length > 1 && (
          <button
            onClick={() => onSelect(null)}
            className="snap-start shrink-0"
          >
            <GlassPanel
              intensity="light"
              className={cn(
                'flex flex-col items-center justify-center gap-1 w-[60px] py-2.5 px-2 cursor-pointer transition-all duration-300',
                activePetId === null && 'ring-2 ring-apple-blue scale-105'
              )}
            >
              <DynamicType styleLevel="caption2" weight={activePetId === null ? 600 : 400}>
                All
              </DynamicType>
            </GlassPanel>
          </button>
        )}

        {pets.map(pet => {
          const isActive = activePetId === pet.id
          return (
            <button
              key={pet.id}
              ref={isActive ? activeRef : undefined}
              onClick={() => onSelect(pet.id)}
              className="snap-start shrink-0"
            >
              <GlassPanel
                intensity="light"
                className={cn(
                  'flex flex-col items-center gap-0.5 w-[60px] py-2.5 px-2 cursor-pointer transition-all duration-300',
                  isActive && 'ring-2 ring-apple-blue scale-105'
                )}
              >
                <DynamicType
                  styleLevel="caption2"
                  weight={isActive ? 600 : 400}
                  className="text-center truncate w-full"
                >
                  {pet.name}
                </DynamicType>
                <DynamicType styleLevel="caption2" className="text-apple-tertiaryLabel">
                  {pet.weight}{pet.weightUnit}
                </DynamicType>
              </GlassPanel>
            </button>
          )
        })}
      </div>
    </div>
  )
}

import { useRef, useEffect, useState } from 'react'
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
    <div className="flex flex-col items-center gap-1.5 min-w-[72px]">
      <div className="w-14 h-14 rounded-2xl glass-light animate-pulse flex items-center justify-center">
        <div className="w-6 h-6 rounded-full bg-white/20" />
      </div>
      <div className="h-3 w-12 skeleton rounded" />
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
        <DynamicType styleLevel="title3" weight={600} className="mb-3 px-1">My Pets</DynamicType>
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
      <DynamicType styleLevel="title3" weight={600} className="mb-3 px-1">My Pets</DynamicType>
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
                'flex flex-col items-center justify-center gap-1.5 w-[80px] py-3 px-2 cursor-pointer transition-all duration-300',
                activePetId === null && 'ring-2 ring-apple-blue scale-105'
              )}
            >
              <div className="w-10 h-10 rounded-full bg-white/40 flex items-center justify-center">
                <span className="text-lg">🐾</span>
              </div>
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
                  'flex flex-col items-center gap-1.5 w-[80px] py-3 px-2 cursor-pointer transition-all duration-300',
                  isActive && 'ring-2 ring-apple-blue scale-105'
                )}
              >
                <GlassAvatar pet={pet} />
                <DynamicType
                  styleLevel="caption2"
                  weight={isActive ? 600 : 400}
                  className="text-center truncate w-full px-0.5"
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

/** Glassmorphism pet avatar — circular, no background, image or emoji only */
function GlassAvatar({ pet }: { pet: Pet }) {
  const [failed, setFailed] = useState(false)
  const speciesEmoji: Record<string, string> = {
    dog: '🐕', cat: '🐱', bird: '🐦', fish: '🐟', rabbit: '🐰', hamster: '🐹', other: '🐾',
  }
  const src = pet.avatarUrl ? `/picture/${pet.avatarUrl}` : `/picture/${pet.name.toLowerCase()}-1.jpeg`

  if (failed) {
    return (
      <div className="w-10 h-10 rounded-full flex items-center justify-center">
        <span className="text-lg">{speciesEmoji[pet.species] ?? '🐾'}</span>
      </div>
    )
  }

  return (
    <div className="w-10 h-10 rounded-full overflow-hidden">
      <img
        src={src}
        alt={pet.name}
        className="w-full h-full object-cover"
        onError={() => setFailed(true)}
      />
    </div>
  )
}

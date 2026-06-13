import { useState } from 'react'
import { usePets } from '@/store/pet-context'
import { AppleCard } from '@/components/ui/AppleCard'
import { AppleAvatar } from '@/components/ui/AppleAvatar'
import { AppleButton } from '@/components/ui/AppleButton'
import { EmptyState } from '@/components/common/EmptyState'
import { LoadingState } from '@/components/common/LoadingState'
import { ErrorState } from '@/components/common/ErrorState'
import { DynamicType } from '@/components/ui/DynamicType'
import { calculateAge } from '@/utils/date'
import { cn } from '@/utils/cn'
import { Plus, Search } from 'lucide-react'

const speciesEmoji: Record<string, string> = { dog: '🐕', cat: '🐈', bird: '🐦', fish: '🐟', rabbit: '🐇', hamster: '🐹', other: '🐾' }

interface PetListPageProps { onSelect?: (id: string) => void; onAdd?: () => void }

export function PetListPage({ onSelect, onAdd }: PetListPageProps) {
  const { pets, loading, error } = usePets()
  const [search, setSearch] = useState('')
  const [filterSpecies, setFilterSpecies] = useState<string>('all')

  const filtered = pets.filter(p => {
    if (filterSpecies !== 'all' && p.species !== filterSpecies) return false
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.breed.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  if (loading) return <LoadingState lines={4} card />
  if (error) return <ErrorState message={error} onRetry={() => {}} />

  return (
    <div>
      <div className="flex mb-5">
        <AppleButton icon={<Plus size={16} />} onClick={onAdd}>Add Pet</AppleButton>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-apple-tertiaryLabel" />
          <input type="text" placeholder="Search pets..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full h-[34px] pl-9 pr-3 rounded-apple-lg bg-[var(--apple-fill)] text-apple-subhead text-apple-label text-left placeholder:text-apple-placeholderText border-0 focus:outline-none focus:bg-[var(--apple-secondarySystemBackground)] transition-colors duration-200" />
        </div>
        <div className="flex gap-1">
          {['all', 'dog', 'cat', 'hamster'].map(s => (
            <button key={s} onClick={() => setFilterSpecies(s)}
              className={cn('px-3 py-1.5 rounded-apple-lg text-apple-caption-1 font-medium transition-colors duration-200', filterSpecies === s ? 'bg-apple-blue text-white' : 'text-apple-secondaryLabel hover:bg-[var(--apple-fill)]')}>
              {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1) + 's'}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="🐾" title="No pets found" description={search ? 'Try a different search term' : 'Add your first pet to get started'}
          action={!search ? <AppleButton icon={<Plus size={16} />} onClick={onAdd}>Add Pet</AppleButton> : undefined} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(pet => (
            <AppleCard key={pet.id} hoverable onClick={() => onSelect?.(pet.id)} className="flex flex-col items-center text-center py-6">
              <AppleAvatar name={pet.name} size="xl" className="mb-3" />
              <DynamicType styleLevel="headline" weight={600}>{pet.name}</DynamicType>
              <DynamicType styleLevel="caption1"  className="mt-0.5">{speciesEmoji[pet.species] ?? '🐾'} {pet.breed}</DynamicType>
              <DynamicType styleLevel="caption2"  className="mt-2"><span className="text-lg">{pet.gender === 'male' ? '♂' : '♀'}</span> · {calculateAge(pet.birthDate)} · {pet.weight}{pet.weightUnit}</DynamicType>
            </AppleCard>
          ))}
        </div>
      )}
    </div>
  )
}

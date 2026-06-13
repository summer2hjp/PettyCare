import { useState, useRef, useEffect } from 'react'
import { usePets } from '@/store/pet-context'
import { cn } from '@/utils/cn'
import { ChevronDown } from 'lucide-react'

interface PetSelectorProps {
  selectedPetId: string
  onChange: (petId: string) => void
  className?: string
}

export function PetSelector({ selectedPetId, onChange, className }: PetSelectorProps) {
  const { pets, getPet } = usePets()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const current = getPet(selectedPetId)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    if (open) { document.addEventListener('mousedown', handleClick); document.addEventListener('keydown', handleEsc) }
    return () => { document.removeEventListener('mousedown', handleClick); document.removeEventListener('keydown', handleEsc) }
  }, [open])

  if (!current) return null

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button onClick={() => setOpen(!open)}
        className={cn('flex items-center gap-1.5 h-8 px-3 rounded-[8px] bg-transparent hover:text-apple-blue transition-colors duration-200')}>
        <span className="text-base">{current.species === 'dog' ? '🐕' : current.species === 'cat' ? '🐈' : current.species === 'hamster' ? '🐹' : '🐾'}</span>
        <span className="text-apple-footnote text-apple-label font-medium">{current.name}</span>
        <ChevronDown size={14} className={cn('text-apple-secondaryLabel transition-transform duration-200', open && 'rotate-180')} />
      </button>

      {open && (
        <div className={cn('absolute right-0 top-full mt-1.5 min-w-[140px] py-1 z-50 glass-heavy rounded-apple-xl shadow-apple-lg border border-[var(--apple-separator)] animate-scale-in origin-top-right')}>
          {pets.map(p => (
            <button key={p.id} onClick={() => { onChange(p.id); setOpen(false) }}
              className={cn('w-full flex items-center gap-2 px-3 py-1.5 text-apple-caption-1 transition-colors duration-100', p.id === selectedPetId ? 'text-apple-label font-semibold' : 'text-apple-label hover:text-apple-blue')}>
              <span>{p.species === 'dog' ? '🐕' : p.species === 'cat' ? '🐈' : p.species === 'hamster' ? '🐹' : '🐾'}</span>
              <span>{p.name}</span>
              {p.id === selectedPetId && <div className="ml-auto w-1 h-1 rounded-full bg-apple-blue" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

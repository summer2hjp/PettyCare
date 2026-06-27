import { useState, useRef, useEffect } from 'react'
import { usePets } from '@/store/pet-context'
import { AppleCard } from '@/components/ui/AppleCard'
import { AppleButton } from '@/components/ui/AppleButton'
import { PetSelector } from '@/components/pet/PetSelector'
import { DynamicType } from '@/components/ui/DynamicType'
import { MagicRings } from '@/components/ui/MagicRings'
import { useTheme } from '@/hooks/useTheme'
import { EmptyState } from '@/components/common/EmptyState'
import { formatDate } from '@/utils/date'
import { cn } from '@/utils/cn'
import { Plus, Syringe, Stethoscope, Pill, ChevronDown } from 'lucide-react'
import type { Vaccination, VetVisit, Medication } from '@/types/health'
import { supabase } from '@/lib/supabase'

function VaccinationRow({ v }: { v: Vaccination }) {
  const statusColor = v.status === 'completed' ? 'bg-[#34C759]' : v.status === 'overdue' ? 'bg-[#FF3B30]' : 'bg-[#FF9500]'
  const statusLabel = v.status === 'completed' ? 'Completed' : v.status === 'overdue' ? 'Overdue' : 'Upcoming'
  return (
    <div className="group flex items-center justify-between px-4 py-2 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[var(--mm-link)]/10 flex items-center justify-center shrink-0"><Syringe size={16} className="text-[var(--mm-link)]" /></div>
        <div>
          <DynamicType styleLevel="button" weight={600} className="group-hover:text-[var(--mm-link)]">{v.name}</DynamicType>
          <DynamicType styleLevel="small" color="muted" className="group-hover:text-[var(--mm-link)]">Due: {formatDate(v.scheduledDate)}</DynamicType>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className={cn('inline-flex items-center px-2 py-0.5 rounded-mm-pill text-[10px] font-semibold text-white', statusColor)}>{statusLabel}</span>
      </div>
    </div>
  )
}

function VisitCard({ v }: { v: VetVisit }) {
  return (
    <div className="group px-4 py-2 transition-colors">
      <div className="flex items-start gap-4">
        <div className="w-8 h-8 rounded-full bg-[#34C759]/10 flex items-center justify-center shrink-0"><Stethoscope size={16} className="text-[#34C759]" /></div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <DynamicType styleLevel="button" weight={600} className="group-hover:text-[var(--mm-link)]">{v.reason}</DynamicType>
            <DynamicType styleLevel="small" color="muted" className="group-hover:text-[var(--mm-link)]">{formatDate(v.date)}</DynamicType>
          </div>
          <DynamicType styleLevel="small" color="secondary" className="group-hover:text-[var(--mm-link)]">{v.vetName}{v.diagnosis ? ` · ${v.diagnosis}` : ''}</DynamicType>
          {v.cost && <DynamicType styleLevel="small" color="muted" className="group-hover:text-[var(--mm-link)]">${v.cost}</DynamicType>}
        </div>
      </div>
    </div>
  )
}

function MedicationRow({ m }: { m: Medication }) {
  return (
    <div className="group flex items-center justify-between px-4 py-2 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[#FF9500]/10 flex items-center justify-center shrink-0"><Pill size={16} className="text-[#FF9500]" /></div>
        <div>
          <DynamicType styleLevel="button" weight={600} className="group-hover:text-[var(--mm-link)]">{m.name}</DynamicType>
          <DynamicType styleLevel="small" color="muted" className="group-hover:text-[var(--mm-link)]">{m.dosage} · {m.frequency}</DynamicType>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className={cn('w-2 h-2 rounded-full', m.isActive ? 'bg-[#34C759]' : 'bg-[var(--mm-separator)]')} />
        <DynamicType styleLevel="caption" color="secondary" className="group-hover:text-[var(--mm-link)]">{m.isActive ? 'Active' : 'Inactive'}</DynamicType>
      </div>
    </div>
  )
}

export function HealthPage() {
  const { pets } = usePets()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [selectedPetId, setSelectedPetId] = useState(pets[0]?.id ?? '')
  const [tab, setTab] = useState('vaccinations')
  const [tabOpen, setTabOpen] = useState(false)
  const tabRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => { if (tabRef.current && !tabRef.current.contains(e.target as Node)) setTabOpen(false) }
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setTabOpen(false) }
    if (tabOpen) { document.addEventListener('mousedown', handleClick); document.addEventListener('keydown', handleEsc) }
    return () => { document.removeEventListener('mousedown', handleClick); document.removeEventListener('keydown', handleEsc) }
  }, [tabOpen])

  const tabOptions = [
    { value: 'vaccinations', label: '💉 Vaccinations' },
    { value: 'visits', label: '🏥 Vet Visits' },
    { value: 'medications', label: '💊 Medications' },
  ]
  const currentTab = tabOptions.find(t => t.value === tab)

  const [vaccinations, setVaccinations] = useState<Vaccination[]>([])
  const [visits, setVisits] = useState<VetVisit[]>([])
  const [meds, setMeds] = useState<Medication[]>([])

  const fetchData = async (table: string, setter: (data: any[]) => void, label: string) => {
    try {
      const { data } = await supabase.from(table).select('*').eq('pet_id', selectedPetId)
      setter(data as any[] ?? [])
    } catch (err) {
      console.error(`Failed to fetch ${label}:`, err)
    }
  }

  useEffect(() => { fetchData('vaccinations', (d) => setVaccinations(d as Vaccination[]), 'vaccinations') }, [selectedPetId])
  useEffect(() => { fetchData('vet_visits', (d) => setVisits(d as VetVisit[]), 'vet visits') }, [selectedPetId])
  useEffect(() => { fetchData('medications', (d) => setMeds(d as Medication[]), 'medications') }, [selectedPetId])

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <PetSelector selectedPetId={selectedPetId} onChange={setSelectedPetId} />

        <div ref={tabRef} className="relative">
          <button onClick={() => setTabOpen(!tabOpen)}
            className={cn('flex items-center gap-1.5 h-8 px-3 rounded-mm-md bg-[var(--mm-fill)] hover:bg-[var(--mm-secondaryBackground)] transition-colors duration-200')}>
            <span className="text-mm-caption text-[var(--mm-label)] font-medium">{currentTab?.label ?? tab}</span>
            <ChevronDown size={14} className={cn('text-[var(--mm-secondaryLabel)] transition-transform duration-200', tabOpen && 'rotate-180')} />
          </button>
        {tabOpen && (
          <div className={cn('absolute left-0 top-full mt-1.5 min-w-[200px] py-1 z-50 bg-[var(--mm-card)] rounded-mm-lg shadow-mm-card border border-[var(--mm-separator)] animate-scale-in origin-top-left')}>
            {tabOptions.map(o => (
              <button key={o.value} onClick={() => { setTab(o.value); setTabOpen(false) }}
                className={cn('w-full flex items-center gap-2 px-3 py-1.5 text-mm-caption transition-colors duration-100', o.value === tab ? 'text-[var(--mm-label)] font-semibold' : 'text-[var(--mm-label)] hover:text-[var(--mm-link)]')}>
                <span className="whitespace-nowrap">{o.label}</span>
                {o.value === tab && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--mm-link)]" />}
              </button>
            ))}
          </div>
        )}
      </div>
      </div>

      {tab === 'vaccinations' && (
        <div>
          <div className="flex justify-end mb-3">
            <AppleButton variant="secondary" size="sm" icon={<Plus size={14} />} onClick={() => alert('Add record coming soon!')}>Add Record</AppleButton>
          </div>
          <div className="relative">
            {isDark && <MagicRings ringCount={4} color="#3b82f6" colorTwo="#60a5fa" opacity={0.5} speed={0.7} className="rounded-mm-lg" />}
            {vaccinations.length === 0 ? (
              <AppleCard padding="lg"><EmptyState title="No vaccinations" description="Add your pet's first vaccination record" /></AppleCard>
            ) : (
              <AppleCard padding="sm" className="relative z-10 !p-0 divide-y divide-[var(--mm-separator)]">
                {vaccinations.map(v => <VaccinationRow key={v.id} v={v} />)}
              </AppleCard>
            )}
          </div>
        </div>
      )}

      {tab === 'visits' && (
        <div>
          <div className="flex justify-end mb-3">
            <AppleButton variant="secondary" size="sm" icon={<Plus size={14} />} onClick={() => alert('Add visit coming soon!')}>Add Visit</AppleButton>
          </div>
          <div className="relative">
            {isDark && <MagicRings ringCount={4} color="#34C759" colorTwo="#7DCF5C" opacity={0.5} speed={0.7} className="rounded-mm-lg" />}
            {visits.length === 0 ? (
              <AppleCard padding="lg"><EmptyState title="No visits recorded" description="Add your first vet visit" /></AppleCard>
            ) : (
              <AppleCard padding="sm" className="relative z-10 !p-0 divide-y divide-[var(--mm-separator)]">
                {visits.map(v => <VisitCard key={v.id} v={v} />)}
              </AppleCard>
            )}
          </div>
        </div>
      )}

      {tab === 'medications' && (
        <div>
          <div className="flex justify-end mb-3">
            <AppleButton variant="secondary" size="sm" icon={<Plus size={14} />} onClick={() => alert('Add medication coming soon!')}>Add Medication</AppleButton>
          </div>
          <div className="relative">
            {isDark && <MagicRings ringCount={4} color="#FF9500" colorTwo="#FFCC00" opacity={0.5} speed={0.7} className="rounded-mm-lg" />}
            {meds.length === 0 ? (
              <AppleCard padding="lg"><EmptyState title="No medications" description="Add your pet's first medication" /></AppleCard>
            ) : (
              <AppleCard padding="sm" className="relative z-10 !p-0 divide-y divide-[var(--mm-separator)]">
                {meds.map(m => <MedicationRow key={m.id} m={m} />)}
              </AppleCard>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

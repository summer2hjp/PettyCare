import { useState, useRef, useEffect } from 'react'
import { usePets } from '@/store/pet-context'
import { AppleCard } from '@/components/ui/AppleCard'
import { AppleButton } from '@/components/ui/AppleButton'
import { PetSelector } from '@/components/pet/PetSelector'
import { DynamicType } from '@/components/ui/DynamicType'
import { EmptyState } from '@/components/common/EmptyState'
import { formatDate } from '@/utils/date'
import { cn } from '@/utils/cn'
import { Plus, Syringe, Stethoscope, Pill, ChevronRight, ChevronDown } from 'lucide-react'
import type { Vaccination, VetVisit, Medication } from '@/types/health'
import { supabase } from '@/lib/supabase'


function VaccinationRow({ v }: { v: Vaccination }) {
  const statusColor = v.status === 'completed' ? 'bg-apple-green' : v.status === 'overdue' ? 'bg-apple-red' : 'bg-apple-orange'
  const statusLabel = v.status === 'completed' ? 'Completed' : v.status === 'overdue' ? 'Overdue' : 'Upcoming'
  return (
    <div className="group flex items-center justify-between px-4 py-2 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-apple-blue/10 flex items-center justify-center shrink-0"><Syringe size={16} className="text-apple-blue" /></div>
        <div>
          <DynamicType styleLevel="footnote" weight={600} className="group-hover:text-apple-blue">{v.name}</DynamicType>
          <DynamicType styleLevel="caption2"  className="group-hover:text-apple-blue">Due: {formatDate(v.scheduledDate)}</DynamicType>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className={cn('inline-flex items-center px-2 py-0.5 rounded-apple-full text-[10px] font-semibold text-white', statusColor)}>{statusLabel}</span>
        <ChevronRight size={16} className="text-apple-tertiaryLabel" />
      </div>
    </div>
  )
}

function VisitCard({ v }: { v: VetVisit }) {
  return (
    <div className="group px-4 py-2 transition-colors">
      <div className="flex items-start gap-4">
        <div className="w-8 h-8 rounded-full bg-apple-green/10 flex items-center justify-center shrink-0"><Stethoscope size={16} className="text-apple-green" /></div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <DynamicType styleLevel="footnote" weight={600} className="group-hover:text-apple-blue">{v.reason}</DynamicType>
            <DynamicType styleLevel="caption2"  className="group-hover:text-apple-blue">{formatDate(v.date)}</DynamicType>
          </div>
          <DynamicType styleLevel="caption2"  className="group-hover:text-apple-blue">{v.vetName}{v.diagnosis ? ` · ${v.diagnosis}` : ''}</DynamicType>
          {v.cost && <DynamicType styleLevel="caption2"  className="group-hover:text-apple-blue">${v.cost}</DynamicType>}
        </div>
      </div>
    </div>
  )
}

function MedicationRow({ m }: { m: Medication }) {
  return (
    <div className="group flex items-center justify-between px-4 py-2 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-apple-orange/10 flex items-center justify-center shrink-0"><Pill size={16} className="text-apple-orange" /></div>
        <div>
          <DynamicType styleLevel="footnote" weight={600} className="group-hover:text-apple-blue">{m.name}</DynamicType>
          <DynamicType styleLevel="caption2"  className="group-hover:text-apple-blue">{m.dosage} · {m.frequency}</DynamicType>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className={cn('w-2 h-2 rounded-full', m.isActive ? 'bg-apple-green' : 'bg-[var(--apple-separator)]')} />
        <DynamicType styleLevel="caption1"  className="group-hover:text-apple-blue">{m.isActive ? 'Active' : 'Inactive'}</DynamicType>
      </div>
    </div>
  )
}

export function HealthPage() {
  const { pets } = usePets()
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

  useEffect(() => {
    supabase.from('vaccinations').select('*').eq('pet_id', selectedPetId)
      .then(({ data }) => setVaccinations(data as Vaccination[] ?? []))
  }, [selectedPetId])

  useEffect(() => {
    supabase.from('vet_visits').select('*').eq('pet_id', selectedPetId)
      .then(({ data }) => setVisits(data as VetVisit[] ?? []))
  }, [selectedPetId])

  useEffect(() => {
    supabase.from('medications').select('*').eq('pet_id', selectedPetId)
      .then(({ data }) => setMeds(data as Medication[] ?? []))
  }, [selectedPetId])

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <PetSelector selectedPetId={selectedPetId} onChange={setSelectedPetId} />

        <div ref={tabRef} className="relative">
          <button onClick={() => setTabOpen(!tabOpen)}
            className={cn('flex items-center gap-1.5 h-8 px-3 rounded-[8px] bg-transparent hover:text-apple-blue transition-colors duration-200')}>
            <span className="text-apple-footnote text-apple-label font-medium">{currentTab?.label ?? tab}</span>
            <ChevronDown size={14} className={cn('text-apple-secondaryLabel transition-transform duration-200', tabOpen && 'rotate-180')} />
          </button>
        {tabOpen && (
          <div className={cn('absolute left-0 top-full mt-1.5 min-w-[200px] py-1 z-50 glass-heavy rounded-apple-xl shadow-apple-lg border border-[var(--apple-separator)] animate-scale-in origin-top-left')}>
            {tabOptions.map(o => (
              <button key={o.value} onClick={() => { setTab(o.value); setTabOpen(false) }}
                className={cn('w-full flex items-center gap-2 px-3 py-1.5 text-apple-caption-1 transition-colors duration-100', o.value === tab ? 'text-apple-label font-semibold' : 'text-apple-label hover:text-apple-blue')}>
                <span className="whitespace-nowrap">{o.label}</span>
                {o.value === tab && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-apple-blue" />}
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
          {vaccinations.length === 0 ? (
            <AppleCard padding="lg"><EmptyState title="No vaccinations" description="Add your pet's first vaccination record" /></AppleCard>
          ) : (
            <AppleCard padding="sm" className="!p-0 divide-y divide-[var(--apple-separator)]">
              {vaccinations.map(v => <VaccinationRow key={v.id} v={v} />)}
            </AppleCard>
          )}
        </div>
      )}

      {tab === 'visits' && (
        <div>
          <div className="flex justify-end mb-3">
            <AppleButton variant="secondary" size="sm" icon={<Plus size={14} />} onClick={() => alert('Add visit coming soon!')}>Add Visit</AppleButton>
          </div>
          {visits.length === 0 ? (
            <AppleCard padding="lg"><EmptyState title="No visits recorded" description="Add your first vet visit" /></AppleCard>
          ) : (
            <AppleCard padding="sm" className="!p-0 divide-y divide-[var(--apple-separator)]">
              {visits.map(v => <VisitCard key={v.id} v={v} />)}
            </AppleCard>
          )}
        </div>
      )}

      {tab === 'medications' && (
        <div>
          <div className="flex justify-end mb-3">
            <AppleButton variant="secondary" size="sm" icon={<Plus size={14} />} onClick={() => alert('Add medication coming soon!')}>Add Medication</AppleButton>
          </div>
          {meds.length === 0 ? (
            <AppleCard padding="lg"><EmptyState title="No medications" description="Add your pet's first medication" /></AppleCard>
          ) : (
            <AppleCard padding="sm" className="!p-0 divide-y divide-[var(--apple-separator)]">
              {meds.map(m => <MedicationRow key={m.id} m={m} />)}
            </AppleCard>
          )}
        </div>
      )}
    </div>
  )
}

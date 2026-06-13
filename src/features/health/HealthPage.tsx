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

const perPetVaccinations: Record<string, Vaccination[]> = {
  '1': [
    { id: 'v1', petId: '1', name: 'FVRCP', scheduledDate: '2025-04-10', status: 'completed', administeredDate: '2024-04-10', vetName: 'Dr. Smith' },
    { id: 'v2', petId: '1', name: 'Rabies', scheduledDate: '2025-08-15', status: 'upcoming', notes: '3-year vaccine' },
    { id: 'v3', petId: '1', name: 'Feline Leukemia', scheduledDate: '2025-11-01', status: 'upcoming' },
  ],
  '2': [
    { id: 'v4', petId: '2', name: 'Rabies', scheduledDate: '2025-03-10', status: 'completed', administeredDate: '2024-03-10', vetName: 'Dr. Smith' },
    { id: 'v5', petId: '2', name: 'DHPP', scheduledDate: '2025-06-15', status: 'overdue', notes: 'Annual booster overdue!' },
    { id: 'v6', petId: '2', name: 'Bordetella', scheduledDate: '2025-09-01', status: 'upcoming', notes: 'Kennel cough' },
    { id: 'v7', petId: '2', name: 'Leptospirosis', scheduledDate: '2025-12-01', status: 'upcoming' },
  ],
  '3': [
    { id: 'v8', petId: '3', name: 'DHPP', scheduledDate: '2025-02-20', status: 'completed', administeredDate: '2024-02-20', vetName: 'Dr. Lee' },
    { id: 'v9', petId: '3', name: 'Rabies', scheduledDate: '2025-10-15', status: 'upcoming' },
  ],
  '4': [
    { id: 'v10', petId: '4', name: 'FVRCP', scheduledDate: '2025-05-05', status: 'completed', administeredDate: '2024-05-05', vetName: 'Dr. Smith' },
    { id: 'v11', petId: '4', name: 'Rabies', scheduledDate: '2025-07-20', status: 'upcoming' },
  ],
  '5': [
    { id: 'v12', petId: '5', name: 'None', scheduledDate: '2025-01-01', status: 'completed', notes: 'Hamster vaccinations N/A' },
  ],
}

const perPetVisits: Record<string, VetVisit[]> = {
  '1': [
    { id: 'vi1', petId: '1', date: '2024-12-10', reason: 'Annual checkup', diagnosis: 'Healthy', vetName: 'Dr. Smith', cost: 85 },
    { id: 'vi2', petId: '1', date: '2024-08-15', reason: 'Hairball issues', diagnosis: 'Mild digestive upset', prescription: 'Hairball gel', vetName: 'Dr. Smith', cost: 95 },
  ],
  '2': [
    { id: 'vi3', petId: '2', date: '2024-12-10', reason: 'Annual checkup', diagnosis: 'Healthy', vetName: 'Dr. Smith', cost: 85 },
    { id: 'vi4', petId: '2', date: '2024-09-05', reason: 'Ear infection', diagnosis: 'Otitis externa', prescription: 'Otomax 2x/day', vetName: 'Dr. Lee', cost: 120, followUpDate: '2024-09-19' },
    { id: 'vi5', petId: '2', date: '2024-06-20', reason: 'Vaccination booster', vetName: 'Dr. Smith', cost: 65 },
  ],
  '3': [
    { id: 'vi6', petId: '3', date: '2024-11-20', reason: 'Skin allergy', diagnosis: 'Atopic dermatitis', prescription: 'Apoquel', vetName: 'Dr. Lee', cost: 150 },
    { id: 'vi7', petId: '3', date: '2024-07-10', reason: 'Grooming + checkup', vetName: 'Dr. Smith', cost: 55 },
  ],
  '4': [
    { id: 'vi8', petId: '4', date: '2024-10-05', reason: 'Annual checkup', diagnosis: 'Healthy', vetName: 'Dr. Smith', cost: 85 },
  ],
  '5': [
    { id: 'vi9', petId: '5', date: '2024-09-01', reason: 'New pet checkup', diagnosis: 'Healthy', vetName: 'Dr. Smith', cost: 50 },
  ],
}

const perPetMedications: Record<string, Medication[]> = {
  '1': [
    { id: 'm1', petId: '1', name: 'Hairball Relief', dosage: '1 tube', frequency: 'Weekly', startDate: '2024-08-15', isActive: true },
  ],
  '2': [
    { id: 'm2', petId: '2', name: 'Heartgard Plus', dosage: '1 chew', frequency: 'Monthly', startDate: '2024-01-15', isActive: true },
    { id: 'm3', petId: '2', name: 'NexGard', dosage: '1 tablet', frequency: 'Monthly', startDate: '2024-01-15', isActive: true },
  ],
  '3': [
    { id: 'm4', petId: '3', name: 'Apoquel', dosage: '1 tablet', frequency: 'Twice daily', startDate: '2024-11-20', isActive: true },
    { id: 'm5', petId: '3', name: 'Heartgard Plus', dosage: '1 chew', frequency: 'Monthly', startDate: '2024-01-15', isActive: true },
  ],
  '4': [],
  '5': [],
}

function mockVaccinations(petId: string): Vaccination[] { return perPetVaccinations[petId] ?? [] }
function mockVisits(petId: string): VetVisit[] { return perPetVisits[petId] ?? [] }
function mockMedications(petId: string): Medication[] { return perPetMedications[petId] ?? [] }

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

  const vaccinations = mockVaccinations(selectedPetId)
  const visits = mockVisits(selectedPetId)
  const medications = mockMedications(selectedPetId)

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
          {medications.length === 0 ? (
            <AppleCard padding="lg"><EmptyState title="No medications" description="Add your pet's first medication" /></AppleCard>
          ) : (
            <AppleCard padding="sm" className="!p-0 divide-y divide-[var(--apple-separator)]">
              {medications.map(m => <MedicationRow key={m.id} m={m} />)}
            </AppleCard>
          )}
        </div>
      )}
    </div>
  )
}

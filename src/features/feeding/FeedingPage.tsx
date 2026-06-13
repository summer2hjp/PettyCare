import { useState } from 'react'
import { usePets } from '@/store/pet-context'
import { AppleCard } from '@/components/ui/AppleCard'
import { AppleButton } from '@/components/ui/AppleButton'
import { PetSelector } from '@/components/pet/PetSelector'
import { DynamicType } from '@/components/ui/DynamicType'
import { EmptyState } from '@/components/common/EmptyState'
import { formatDate } from '@/utils/date'
import { cn } from '@/utils/cn'
import { Plus, Utensils, Clock, RotateCcw } from 'lucide-react'

interface FeedingRecord { id: string; petId: string; time: string; food: string; portion: string; notes?: string }
interface FeedingSchedule { time: string; label: string }

const schedules: Record<string, FeedingSchedule[]> = {
  '1': [{ time: '08:00', label: 'Breakfast' }, { time: '12:00', label: 'Lunch' }, { time: '18:00', label: 'Dinner' }],
  '2': [{ time: '07:30', label: 'Breakfast' }, { time: '17:30', label: 'Dinner' }],
  '3': [{ time: '08:00', label: 'Breakfast' }, { time: '12:00', label: 'Lunch' }, { time: '18:00', label: 'Dinner' }],
  '4': [{ time: '08:30', label: 'Breakfast' }, { time: '17:00', label: 'Dinner' }],
  '5': [{ time: '09:00', label: 'Morning' }, { time: '21:00', label: 'Evening' }],
}

function mockFeedingRecords(petId: string): FeedingRecord[] {
  const today = new Date().toISOString().slice(0, 10)
  const sched = schedules[petId] ?? schedules['1']
  return sched.map((s, i) => ({
    id: `f${petId}-${i}`, petId, time: `${today}T${s.time}:00`,
    food: petId === '1' ? 'Purina Cat Chow' : petId === '2' ? 'Royal Canin Large' : petId === '3' ? "Hill's Science Diet" : petId === '4' ? 'Friskies' : 'Sunflower seeds',
    portion: petId === '5' ? '1 tbsp' : `${(i + 1) * 0.5} cup`,
  }))
}

export function FeedingPage() {
  const { pets } = usePets()
  const [selectedPetId, setSelectedPetId] = useState(pets[0]?.id ?? '')
  const records = mockFeedingRecords(selectedPetId)
  const todaySched = schedules[selectedPetId] ?? schedules['1']

  return (
    <div>
      <div className="flex items-center mb-5">
        <PetSelector selectedPetId={selectedPetId} onChange={setSelectedPetId} />
      </div>

      <AppleCard padding="lg" className="mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Clock size={18} className="text-apple-secondaryLabel" />
          <DynamicType styleLevel="subhead" weight={600}>Today's Schedule</DynamicType>
          <DynamicType styleLevel="caption1"  className="ml-auto">{formatDate(new Date().toISOString())}</DynamicType>
        </div>
        <div className="space-y-3">
          {todaySched.map((s, i) => {
            const record = records[i]
            return (
              <div key={s.time} className="flex items-center gap-4">
                <div className="flex flex-col items-center">
                  <div className={cn('w-3 h-3 rounded-full border-2', record ? 'border-apple-green bg-apple-green' : 'border-[var(--apple-separator)]')} />
                  {i < todaySched.length - 1 && <div className="w-0.5 h-8 bg-[var(--apple-separator)]" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <DynamicType styleLevel="footnote" weight={600}>{s.label}</DynamicType>
                    <DynamicType styleLevel="caption2" >{s.time}</DynamicType>
                  </div>
                  {record ? (
                    <DynamicType styleLevel="caption2"  className="mt-0.5">{record.food} · {record.portion}</DynamicType>
                  ) : (
                    <DynamicType styleLevel="caption2"  className="mt-0.5">Not yet fed</DynamicType>
                  )}
                </div>
                {record && <div className="w-2 h-2 rounded-full bg-apple-green shrink-0" />}
              </div>
            )
          })}
        </div>
      </AppleCard>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <AppleButton variant="secondary" icon={<Plus size={16} />} className="w-full">Log Meal</AppleButton>
        <AppleButton variant="secondary" icon={<RotateCcw size={16} />} className="w-full">Repeat Yesterday</AppleButton>
      </div>

      <DynamicType styleLevel="title3" weight={600} className="mb-3">Recent Records</DynamicType>

      {records.length === 0 ? (
        <AppleCard padding="lg"><EmptyState title="No feeding records" description="Log your pet's first meal" /></AppleCard>
      ) : (
        <AppleCard padding="sm" className="!p-0 divide-y divide-[var(--apple-separator)]">
          {records.map(r => (
            <div key={r.id} className="group flex items-center gap-3 px-4 py-2.5 transition-colors">
              <div className="w-8 h-8 rounded-full bg-apple-orange/10 flex items-center justify-center shrink-0"><Utensils size={16} className="text-apple-orange" /></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <DynamicType styleLevel="footnote" weight={600} className="group-hover:text-apple-blue">{r.food}</DynamicType>
                  <DynamicType styleLevel="caption2"  className="group-hover:text-apple-blue">{r.time.slice(11, 16)}</DynamicType>
                </div>
                <DynamicType styleLevel="caption2"  className="group-hover:text-apple-blue">{r.portion}</DynamicType>
              </div>
            </div>
          ))}
        </AppleCard>
      )}
    </div>
  )
}

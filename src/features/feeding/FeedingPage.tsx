import { useState, useEffect } from 'react'
import { usePets } from '@/store/pet-context'
import { supabase } from '@/lib/supabase'
import { AppleCard } from '@/components/ui/AppleCard'
import { AppleButton } from '@/components/ui/AppleButton'
import { PetSelector } from '@/components/pet/PetSelector'
import { DynamicType } from '@/components/ui/DynamicType'
import { EmptyState } from '@/components/common/EmptyState'
import { formatDate } from '@/utils/date'
import { cn } from '@/utils/cn'
import { Plus, Utensils, Clock, RotateCcw } from 'lucide-react'

export interface FeedingRecord { id: string; petId: string; time: string; food: string; portion: string; notes?: string }
export interface FeedingSchedule { time: string; label: string }

export const schedules: Record<string, FeedingSchedule[]> = {
  '1': [{ time: '08:00', label: 'Breakfast' }, { time: '12:00', label: 'Lunch' }, { time: '18:00', label: 'Dinner' }],
  '2': [{ time: '07:30', label: 'Breakfast' }, { time: '17:30', label: 'Dinner' }],
  '3': [{ time: '08:00', label: 'Breakfast' }, { time: '12:00', label: 'Lunch' }, { time: '18:00', label: 'Dinner' }],
  '4': [{ time: '08:30', label: 'Breakfast' }, { time: '17:00', label: 'Dinner' }],
  '5': [{ time: '09:00', label: 'Morning' }, { time: '21:00', label: 'Evening' }],
}

export function FeedingPage() {
  const { pets } = usePets()
  const [selectedPetId, setSelectedPetId] = useState(pets[0]?.id ?? '')
  const [records, setRecords] = useState<FeedingRecord[]>([])

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10)
    supabase.from('feeding_records')
      .select('*')
      .eq('pet_id', selectedPetId)
      .gte('meal_time', today)
      .order('meal_time', { ascending: true })
      .then(({ data }) => setRecords(data as FeedingRecord[] ?? []))
  }, [selectedPetId])

  const todaySched = schedules[selectedPetId] ?? schedules['1']

  return (
    <div>
      <div className="flex items-center mb-5">
        <PetSelector selectedPetId={selectedPetId} onChange={setSelectedPetId} />
      </div>

      <AppleCard padding="lg" className="mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Clock size={18} className="text-[var(--mm-secondaryLabel)]" />
          <DynamicType styleLevel="bodyBold" weight={600}>Today's Schedule</DynamicType>
          <DynamicType styleLevel="caption" color="muted" className="ml-auto">{formatDate(new Date().toISOString())}</DynamicType>
        </div>
        <div className="space-y-3">
          {todaySched.map((s, i) => {
            const record = records[i]
            return (
              <div key={s.time} className="flex items-center gap-4">
                <div className="flex flex-col items-center">
                  <div className={cn('w-3 h-3 rounded-full border-2', record ? 'border-[#34C759] bg-[#34C759]' : 'border-[var(--mm-separator)]')} />
                  {i < todaySched.length - 1 && <div className="w-0.5 h-8 bg-[var(--mm-separator)]" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <DynamicType styleLevel="button" weight={600}>{s.label}</DynamicType>
                    <DynamicType styleLevel="small" color="muted">{s.time}</DynamicType>
                  </div>
                  {record ? (
                    <DynamicType styleLevel="small" color="secondary" className="mt-0.5">{record.food} · {record.portion}</DynamicType>
                  ) : (
                    <DynamicType styleLevel="small" color="muted" className="mt-0.5">Not yet fed</DynamicType>
                  )}
                </div>
                {record && <div className="w-2 h-2 rounded-full bg-[#34C759] shrink-0" />}
              </div>
            )
          })}
        </div>
      </AppleCard>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <AppleButton variant="secondary" icon={<Plus size={16} />} className="w-full">Log Meal</AppleButton>
        <AppleButton variant="secondary" icon={<RotateCcw size={16} />} className="w-full">Repeat Yesterday</AppleButton>
      </div>

      <DynamicType styleLevel="section" weight={600} className="mb-3">Recent Records</DynamicType>

      {records.length === 0 ? (
        <AppleCard padding="lg"><EmptyState title="No feeding records" description="Log your pet's first meal" /></AppleCard>
      ) : (
        <AppleCard padding="sm" className="!p-0 divide-y divide-[var(--mm-separator)]">
          {records.map(r => (
            <div key={r.id} className="group flex items-center gap-3 px-4 py-2.5 transition-colors">
              <div className="w-8 h-8 rounded-full bg-[#FF9500]/10 flex items-center justify-center shrink-0"><Utensils size={16} className="text-[#FF9500]" /></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <DynamicType styleLevel="button" weight={600} className="group-hover:text-[var(--mm-link)]">{r.food}</DynamicType>
                  <DynamicType styleLevel="small" color="muted" className="group-hover:text-[var(--mm-link)]">{r.time.slice(11, 16)}</DynamicType>
                </div>
                <DynamicType styleLevel="small" color="secondary" className="group-hover:text-[var(--mm-link)]">{r.portion}</DynamicType>
              </div>
            </div>
          ))}
        </AppleCard>
      )}
    </div>
  )
}

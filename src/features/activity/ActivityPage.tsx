import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { usePets } from '@/store/pet-context'
import { AppleCard } from '@/components/ui/AppleCard'
import { AppleSegmentedControl } from '@/components/ui/AppleSegmentedControl'
import { AppleProgressRing } from '@/components/ui/AppleProgressRing'
import { PetSelector } from '@/components/pet/PetSelector'
import { DynamicType } from '@/components/ui/DynamicType'
import { EmptyState } from '@/components/common/EmptyState'
import { LoadingState } from '@/components/common/LoadingState'
import { formatDate } from '@/utils/date'
import { cn } from '@/utils/cn'
import { Footprints, Timer, Flame, TrendingUp, Dog } from 'lucide-react'

type ViewMode = 'day' | 'week' | 'month'
export interface ActivityRecord { date: string; steps: number; distance: number; duration: number; calories: number }

function StatCard({ icon, label, value, unit, color }: { icon: React.ReactNode; label: string; value: string; unit: string; color: string }) {
  return (
    <AppleCard padding="md" hoverable>
      <div className="flex items-center gap-3">
        <div className={cn('w-10 h-10 rounded-full flex items-center justify-center shrink-0', color)}>{icon}</div>
        <div className="min-w-0">
          <DynamicType styleLevel="caption" color="secondary">{label}</DynamicType>
          <div className="flex items-baseline gap-1">
            <DynamicType styleLevel="subheading" weight={700}>{value}</DynamicType>
            <DynamicType styleLevel="caption" color="muted">{unit}</DynamicType>
          </div>
        </div>
      </div>
    </AppleCard>
  )
}

export function ActivityPage() {
  const { pets } = usePets()
  const [selectedPetId, setSelectedPetId] = useState(pets[0]?.id ?? '')
  const [view, setView] = useState<ViewMode>('week')
  const [records, setRecords] = useState<ActivityRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    supabase.from('activity_records')
      .select('*')
      .eq('pet_id', selectedPetId)
      .order('date', { ascending: true })
      .then(({ data }) => {
        setRecords(data as ActivityRecord[] ?? [])
        setLoading(false)
      })
  }, [selectedPetId])

  if (loading) return (
    <div>
      <div className="flex items-center mb-5">
        <PetSelector selectedPetId={selectedPetId} onChange={setSelectedPetId} />
      </div>
      <LoadingState lines={4} card />
    </div>
  )

  if (records.length === 0) return (
    <div>
      <div className="flex items-center mb-5">
        <PetSelector selectedPetId={selectedPetId} onChange={setSelectedPetId} />
      </div>
      <EmptyState icon="🏃" title="No activity data" description="Start tracking your pet's activity to see stats and history here" />
    </div>
  )

  const today = records[records.length - 1]
  const weekAvg = records.slice(-7).reduce((a, r) => ({ steps: a.steps + r.steps, distance: a.distance + r.distance, duration: a.duration + r.duration, calories: a.calories + r.calories }), { steps: 0, distance: 0, duration: 0, calories: 0 })
  const avgSteps = Math.round(weekAvg.steps / 7)

  return (
    <div>
      <div className="flex items-center mb-5">
        <PetSelector selectedPetId={selectedPetId} onChange={setSelectedPetId} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <AppleCard padding="lg" hoverable className="flex flex-col items-center justify-center md:col-span-1">
          <AppleProgressRing progress={Math.min(today.steps / 8000, 1)} size={100} strokeWidth={8} color="#34C759" trackColor="var(--mm-fill)">
            <div className="text-center">
              <DynamicType styleLevel="subheading" weight={700}>{Math.round(Math.min(today.steps / 8000, 1) * 100)}%</DynamicType>
              <DynamicType styleLevel="small" color="muted">Goal</DynamicType>
            </div>
          </AppleProgressRing>
          <DynamicType styleLevel="bodyBold" weight={600} className="mt-3">Today's Activity</DynamicType>
          <DynamicType styleLevel="caption" color="muted">{formatDate(today.date)}</DynamicType>
        </AppleCard>

        <div className="md:col-span-2 grid grid-cols-2 gap-4">
          <StatCard icon={<Footprints size={20} className="text-[#34C759]" />} label="Steps" value={today.steps.toLocaleString()} unit="steps" color="bg-[#34C759]/10" />
          <StatCard icon={<TrendingUp size={20} className="text-[var(--mm-link)]" />} label="Distance" value={today.distance.toFixed(1)} unit="km" color="bg-[var(--mm-link)]/10" />
          <StatCard icon={<Timer size={20} className="text-[#FF9500]" />} label="Active Time" value={String(today.duration)} unit="min" color="bg-[#FF9500]/10" />
          <StatCard icon={<Flame size={20} className="text-[#FF3B30]" />} label="Calories" value={today.calories.toLocaleString()} unit="kcal" color="bg-[#FF3B30]/10" />
        </div>
      </div>

      <AppleCard padding="md" hoverable className="mb-4">
        <div className="flex items-center gap-3">
          <Dog size={20} className="text-[var(--mm-secondaryLabel)]" />
          <DynamicType styleLevel="body" color="secondary">Weekly Average</DynamicType>
          <DynamicType styleLevel="bodyBold" weight={700} className="ml-auto">{avgSteps.toLocaleString()} <DynamicType as="span" styleLevel="caption" color="muted">steps/day</DynamicType></DynamicType>
          <DynamicType styleLevel="bodyBold" weight={700}>{(weekAvg.distance / 7).toFixed(1)} <DynamicType as="span" styleLevel="caption" color="muted">km/day</DynamicType></DynamicType>
        </div>
      </AppleCard>

      <div className="flex items-center justify-between mb-4">
        <DynamicType styleLevel="section" weight={600}>History</DynamicType>
        <AppleSegmentedControl segments={[{ value: 'day', label: 'Day' }, { value: 'week', label: 'Week' }, { value: 'month', label: 'Month' }]} value={view} onChange={v => setView(v as ViewMode)} />
      </div>

      <AppleCard padding="sm" className="!p-0 divide-y divide-[var(--mm-separator)]">
        {records.length === 0 ? (
          <div className="py-8"><EmptyState title="No activity data" description="Start tracking your pet's activity" /></div>
        ) : (
          records.slice().reverse().map(r => (
            <div key={r.date} className="group flex items-center gap-3 px-4 py-2 transition-colors">
              <div className="w-8 h-8 rounded-full bg-[var(--mm-fill)] flex items-center justify-center shrink-0"><Footprints size={16} className="text-[var(--mm-secondaryLabel)]" /></div>
              <div className="flex-1 min-w-0">
                <DynamicType styleLevel="button" weight={600} className="group-hover:text-[var(--mm-link)]">{formatDate(r.date)}</DynamicType>
                <DynamicType styleLevel="small" color="muted" className="group-hover:text-[var(--mm-link)]">{r.steps.toLocaleString()} steps · {r.distance} km · {r.duration} min</DynamicType>
              </div>
              <div className="w-16 h-2 rounded-full bg-[var(--mm-fill)] overflow-hidden">
                <div className="h-full rounded-full bg-[#34C759] transition-all" style={{ width: `${Math.min(r.steps / 80, 100)}%` }} />
              </div>
            </div>
          ))
        )}
      </AppleCard>
    </div>
  )
}

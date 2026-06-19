import { useState, useEffect } from 'react'
import { usePets } from '@/store/pet-context'
import { AppleCard } from '@/components/ui/AppleCard'
import { AppleButton } from '@/components/ui/AppleButton'
import { PetSelector } from '@/components/pet/PetSelector'
import { DynamicType } from '@/components/ui/DynamicType'
import { EmptyState } from '@/components/common/EmptyState'
import { formatDate, isToday } from '@/utils/date'
import { cn } from '@/utils/cn'
import { Plus, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Stethoscope, Syringe, Scissors } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export interface Appointment { id: string; petId: string; date: string; time: string; type: string; vet: string; notes?: string }

const typeIcons: Record<string, React.ReactNode> = {
  'Annual Checkup': <Stethoscope size={16} className="text-[var(--mm-link)]" />,
  'Vaccination': <Syringe size={16} className="text-[#34C759]" />,
  'Dental Cleaning': <Scissors size={16} className="text-[#FF9500]" />,
  'Follow-up': <Stethoscope size={16} className="text-[#AF52DE]" />,
  'Skin Check': <Stethoscope size={16} className="text-[#5856D6]" />,
}

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function AppointmentsPage() {
  const { pets } = usePets()
  const [selectedPetId, setSelectedPetId] = useState(pets[0]?.id ?? '')
  const [viewDate, setViewDate] = useState(new Date())
  const [appointments, setAppointments] = useState<Appointment[]>([])

  useEffect(() => {
    supabase.from('appointments')
      .select('*')
      .eq('pet_id', selectedPetId)
      .order('date', { ascending: true })
      .then(({ data }) => setAppointments(data as Appointment[] ?? []))
  }, [selectedPetId])

  const year = viewDate.getFullYear(); const month = viewDate.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDay = new Date(year, month, 1).getDay()
  const todayStr = new Date().toISOString().slice(0, 10)
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December']

  const getApptsForDay = (day: number) => {
    const d = `${year}-${String(month + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
    return appointments.filter(a => a.date === d)
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <PetSelector selectedPetId={selectedPetId} onChange={setSelectedPetId} />
        <AppleButton icon={<Plus size={18} />} onClick={() => alert('Booking feature coming soon!')}>Book</AppleButton>
      </div>

      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setViewDate(new Date(year, month - 1, 1))} className="w-8 h-8 flex items-center justify-center rounded-mm-md hover:bg-[var(--mm-fill)] transition-colors"><ChevronLeft size={20} className="text-[var(--mm-label)]" /></button>
        <DynamicType styleLevel="subheading" weight={600}>{monthNames[month]} {year}</DynamicType>
        <button onClick={() => setViewDate(new Date(year, month + 1, 1))} className="w-8 h-8 flex items-center justify-center rounded-mm-md hover:bg-[var(--mm-fill)] transition-colors"><ChevronRight size={20} className="text-[var(--mm-label)]" /></button>
      </div>

      <AppleCard padding="md" className="mb-5">
        <div className="grid grid-cols-7 mb-1">
          {dayNames.map(d => <div key={d} className="text-center text-mm-small text-[var(--mm-tertiaryLabel)] font-medium py-1">{d}</div>)}
        </div>
        <div className="grid grid-cols-7">
          {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} className="aspect-square" />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const ds = `${year}-${String(month + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
            const appts = getApptsForDay(day)
            return (
              <div key={day} className={cn('aspect-square p-1 flex flex-col items-center rounded-mm-md transition-colors', ds === todayStr && 'bg-[var(--mm-link)]/10')}>
                <span className={cn('text-mm-caption font-medium leading-none', ds === todayStr ? 'text-[var(--mm-link)]' : 'text-[var(--mm-label)]')}>{day}</span>
                {appts.length > 0 && (
                  <div className="flex gap-0.5 mt-1">
                    {appts.slice(0, 3).map(a => <div key={a.id} className={cn('w-1.5 h-1.5 rounded-full', a.type.includes('Checkup') ? 'bg-[var(--mm-link)]' : a.type === 'Vaccination' ? 'bg-[#34C759]' : 'bg-[#FF9500]')} />)}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </AppleCard>

      <DynamicType styleLevel="section" weight={600} className="mb-3">Upcoming</DynamicType>

      {appointments.length === 0 ? (
        <AppleCard padding="lg"><EmptyState title="No appointments" description="Book your pet's next visit" /></AppleCard>
      ) : (
        <div className="space-y-3">
          {appointments.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)).map(a => (
            <AppleCard key={a.id} padding="md" hoverable>
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center min-w-[48px]">
                  <DynamicType styleLevel="button" weight={700} className="text-[var(--mm-label)]">{a.time}</DynamicType>
                  <DynamicType styleLevel="small" color="muted">{formatDate(a.date, { month: 'short', day: 'numeric' })}</DynamicType>
                </div>
                <div className="w-8 h-8 rounded-full bg-[var(--mm-fill)] flex items-center justify-center shrink-0">{typeIcons[a.type] ?? <CalendarIcon size={16} className="text-[var(--mm-secondaryLabel)]" />}</div>
                <div className="flex-1 min-w-0">
                  <DynamicType styleLevel="button" weight={600}>{a.type}</DynamicType>
                  <DynamicType styleLevel="small" color="secondary" className="mt-0.5">{a.vet}{a.notes ? ` · ${a.notes}` : ''}</DynamicType>
                </div>
                {isToday(a.date) && <span className="px-2 py-0.5 rounded-mm-pill bg-[#34C759]/10 text-[#34C759] text-[10px] font-semibold">Today</span>}
              </div>
            </AppleCard>
          ))}
        </div>
      )}
    </div>
  )
}

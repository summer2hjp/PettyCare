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
  'Annual Checkup': <Stethoscope size={16} className="text-apple-blue" />,
  'Vaccination': <Syringe size={16} className="text-apple-green" />,
  'Dental Cleaning': <Scissors size={16} className="text-apple-orange" />,
  'Follow-up': <Stethoscope size={16} className="text-apple-purple" />,
  'Skin Check': <Stethoscope size={16} className="text-apple-indigo" />,
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
        <button onClick={() => setViewDate(new Date(year, month - 1, 1))} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--apple-fill)] transition-colors"><ChevronLeft size={20} className="text-apple-label" /></button>
        <DynamicType styleLevel="title3" weight={600}>{monthNames[month]} {year}</DynamicType>
        <button onClick={() => setViewDate(new Date(year, month + 1, 1))} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--apple-fill)] transition-colors"><ChevronRight size={20} className="text-apple-label" /></button>
      </div>

      <AppleCard padding="md" className="mb-5">
        <div className="grid grid-cols-7 mb-1">
          {dayNames.map(d => <div key={d} className="text-center text-apple-caption-2 text-apple-tertiaryLabel font-medium py-1">{d}</div>)}
        </div>
        <div className="grid grid-cols-7">
          {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} className="aspect-square" />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const ds = `${year}-${String(month + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
            const appts = getApptsForDay(day)
            return (
              <div key={day} className={cn('aspect-square p-1 flex flex-col items-center rounded-apple-lg transition-colors', ds === todayStr && 'bg-apple-blue/10')}>
                <span className={cn('text-apple-caption-1 font-medium leading-none', ds === todayStr ? 'text-apple-blue' : 'text-apple-label')}>{day}</span>
                {appts.length > 0 && (
                  <div className="flex gap-0.5 mt-1">
                    {appts.slice(0, 3).map(a => <div key={a.id} className={cn('w-1.5 h-1.5 rounded-full', a.type.includes('Checkup') ? 'bg-apple-blue' : a.type === 'Vaccination' ? 'bg-apple-green' : 'bg-apple-orange')} />)}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </AppleCard>

      <DynamicType styleLevel="title3" weight={600} className="mb-3">Upcoming</DynamicType>

      {appointments.length === 0 ? (
        <AppleCard padding="lg"><EmptyState title="No appointments" description="Book your pet's next visit" /></AppleCard>
      ) : (
        <div className="space-y-3">
          {appointments.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)).map(a => (
            <AppleCard key={a.id} padding="md" hoverable>
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center min-w-[48px]">
                  <DynamicType styleLevel="caption1" weight={700} className="text-apple-label">{a.time}</DynamicType>
                  <DynamicType styleLevel="caption2" >{formatDate(a.date, { month: 'short', day: 'numeric' })}</DynamicType>
                </div>
                <div className="w-8 h-8 rounded-full bg-[var(--apple-fill)] flex items-center justify-center shrink-0">{typeIcons[a.type] ?? <CalendarIcon size={16} className="text-apple-secondaryLabel" />}</div>
                <div className="flex-1 min-w-0">
                  <DynamicType styleLevel="footnote" weight={600}>{a.type}</DynamicType>
                  <DynamicType styleLevel="caption2"  className="mt-0.5">{a.vet}{a.notes ? ` · ${a.notes}` : ''}</DynamicType>
                </div>
                {isToday(a.date) && <span className="px-2 py-0.5 rounded-apple-full bg-apple-green/10 text-apple-green text-[10px] font-semibold">Today</span>}
              </div>
            </AppleCard>
          ))}
        </div>
      )}
    </div>
  )
}

import { usePets } from '@/store/pet-context'
import { AppleCard } from '@/components/ui/AppleCard'
import { AppleAvatar } from '@/components/ui/AppleAvatar'
import { AppleButton } from '@/components/ui/AppleButton'
import { AppleProgressRing } from '@/components/ui/AppleProgressRing'
import { AppleTable } from '@/components/ui/AppleTable'
import { DynamicType } from '@/components/ui/DynamicType'
import { LoadingState } from '@/components/common/LoadingState'
import { ErrorState } from '@/components/common/ErrorState'
import { calculateAge, formatDate } from '@/utils/date'
import { ArrowLeft, Edit3, Trash2 } from 'lucide-react'

interface PetDetailPageProps { petId: string; onBack?: () => void; onEdit?: (id: string) => void; onDelete?: (id: string) => void }

export function PetDetailPage({ petId, onBack, onEdit, onDelete }: PetDetailPageProps) {
  const { loading, error, getPet } = usePets()
  const pet = getPet(petId)

  if (loading) return <LoadingState lines={4} card />
  if (error) return <ErrorState message={error} />
  if (!pet) return <ErrorState title="Pet not found" message="The pet you're looking for doesn't exist." />

  const healthScore = Math.floor(Math.random() * 30) + 70
  const healthData = [
    { label: 'Last Checkup', value: 'Dec 10, 2024' },
    { label: 'Vaccinations', value: 'Rabies, DHPP (up to date)' },
    { label: 'Weight Trend', value: 'Stable (+0.2 kg / 3mo)' },
    { label: 'Activity Level', value: 'Moderate' },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <button onClick={onBack} className="flex items-center gap-1.5 text-apple-subhead text-apple-blue hover:opacity-80 transition-opacity">
          <ArrowLeft size={18} /> Back
        </button>
        <div className="flex gap-2">
          <AppleButton variant="secondary" size="sm" icon={<Edit3 size={14} />} onClick={() => onEdit?.(pet.id)}>Edit</AppleButton>
          <AppleButton variant="secondary" size="sm" icon={<Trash2 size={14} />} onClick={() => onDelete?.(pet.id)} className="text-apple-red">Delete</AppleButton>
        </div>
      </div>

      <AppleCard padding="lg" className="mb-6">
        <div className="flex items-start gap-6">
          <AppleAvatar name={pet.name} size="xl" />
          <div className="flex-1 min-w-0">
            <DynamicType styleLevel="largeTitle" weight={700}>
              <span className="text-2xl mr-1">{pet.gender === 'male' ? '♂' : '♀'}</span>
              {pet.name}
            </DynamicType>
            <DynamicType styleLevel="body"  className="mt-2">{pet.breed} · {calculateAge(pet.birthDate)} · {pet.weight}{pet.weightUnit}</DynamicType>
          </div>
          <div className="hidden sm:flex flex-col items-center gap-1">
            <AppleProgressRing progress={healthScore / 100} size={72} color={healthScore >= 80 ? 'var(--apple-green)' : 'var(--apple-orange)'}>
              <DynamicType styleLevel="footnote" weight={700}>{healthScore}%</DynamicType>
            </AppleProgressRing>
            <DynamicType styleLevel="caption2" >Health</DynamicType>
          </div>
        </div>
      </AppleCard>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Date of Birth', value: formatDate(pet.birthDate, { year: 'numeric', month: 'long', day: 'numeric' }) },
          { label: 'Color', value: pet.color ?? 'N/A' },
          { label: 'Microchip', value: pet.microchipId ?? 'N/A' },
          { label: 'Member Since', value: formatDate(pet.createdAt) },
        ].map(info => (
          <AppleCard key={info.label} padding="md" hoverable>
            <DynamicType styleLevel="caption1" >{info.label}</DynamicType>
            <DynamicType styleLevel="subhead" weight={600} className="mt-1">{info.value}</DynamicType>
          </AppleCard>
        ))}
      </div>

      <DynamicType styleLevel="title3" weight={600} className="mb-3">Health Overview</DynamicType>
      <AppleTable columns={[{ key: 'label', label: 'Record', render: (r: any) => <span className="font-medium">{r.label}</span> }, { key: 'value', label: 'Details' }]} data={healthData} keyExtractor={r => r.label} />
    </div>
  )
}

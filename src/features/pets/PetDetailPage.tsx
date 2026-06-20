import { useRef, useState, useEffect } from 'react'
import { usePets } from '@/store/pet-context'
import { AppleCard } from '@/components/ui/AppleCard'
import { AppleAvatar } from '@/components/ui/AppleAvatar'
import { AppleButton } from '@/components/ui/AppleButton'
import { AppleProgressRing } from '@/components/ui/AppleProgressRing'
import { AppleTable } from '@/components/ui/AppleTable'
import { DynamicType } from '@/components/ui/DynamicType'
import { LoadingState } from '@/components/common/LoadingState'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { calculateAge, formatDate } from '@/utils/date'
import { ArrowLeft, Edit3, Trash2, Camera, Loader2 } from 'lucide-react'
import { usePetGallery } from './hooks/usePetGallery'

interface PetDetailPageProps { petId: string; onBack?: () => void; onEdit?: (id: string) => void; onDelete?: (id: string) => void }

export function PetDetailPage({ petId, onBack, onEdit, onDelete }: PetDetailPageProps) {
  const { loading, error, getPet } = usePets()
  const pet = getPet(petId)

  if (loading) return <LoadingState lines={4} card />
  if (error) return <ErrorState message={error} />
  if (!pet) return <ErrorState title="Pet not found" message="The pet you're looking for doesn't exist." />

  const { moments, loading: momentsLoading, error: momentsError, addMoment, uploading, uploadError } = usePetGallery(petId)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [caption, setCaption] = useState('')
  const momentFileRef = useRef<HTMLInputElement>(null)
  const [momentPreview, setMomentPreview] = useState<string | null>(null)

  const handleMomentFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPendingFile(file)
    setCaption('')
    const url = URL.createObjectURL(file)
    setMomentPreview(url)
  }

  const handleSaveMoment = async () => {
    if (!pendingFile) return
    try {
      await addMoment(pendingFile, caption.trim() || undefined)
      setPendingFile(null)
      setCaption('')
      setMomentPreview(null)
    } catch {
      // error handled by hook
    }
  }

  const cancelPendingMoment = () => {
    if (momentPreview) URL.revokeObjectURL(momentPreview)
    setPendingFile(null)
    setCaption('')
    setMomentPreview(null)
  }

  useEffect(() => {
    return () => {
      if (momentPreview) URL.revokeObjectURL(momentPreview)
    }
  }, [momentPreview])

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
        <button onClick={onBack} className="flex items-center gap-1.5 text-mm-caption text-[var(--mm-link)] hover:opacity-80 transition-opacity">
          <ArrowLeft size={18} /> Back
        </button>
        <div className="flex gap-2">
          <AppleButton variant="secondary" size="sm" icon={<Edit3 size={14} />} onClick={() => onEdit?.(pet.id)}>Edit</AppleButton>
          <AppleButton variant="secondary" size="sm" icon={<Trash2 size={14} />} onClick={() => onDelete?.(pet.id)} className="text-[#FF3B30]">Delete</AppleButton>
        </div>
      </div>

      <AppleCard padding="lg" className="mb-6">
        <div className="flex items-start gap-6">
          <AppleAvatar src={pet.avatarUrl} name={pet.name} size="xl" />
          <div className="flex-1 min-w-0">
            <DynamicType styleLevel="cardTitle" weight={700}>
              <span className="text-2xl mr-1">{pet.gender === 'male' ? '♂' : '♀'}</span>
              {pet.name}
            </DynamicType>
            <DynamicType styleLevel="body" color="secondary" className="mt-2">{pet.breed} · {calculateAge(pet.birthDate)} · {pet.weight}{pet.weightUnit}</DynamicType>
          </div>
          <div className="hidden sm:flex flex-col items-center gap-1">
            <AppleProgressRing progress={healthScore / 100} size={72} color={healthScore >= 80 ? '#34C759' : '#FF9500'}>
              <DynamicType styleLevel="button" weight={700}>{healthScore}%</DynamicType>
            </AppleProgressRing>
            <DynamicType styleLevel="small" color="muted">Health</DynamicType>
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
            <DynamicType styleLevel="caption" color="secondary">{info.label}</DynamicType>
            <DynamicType styleLevel="bodyBold" weight={600} className="mt-1">{info.value}</DynamicType>
          </AppleCard>
        ))}
      </div>

      <DynamicType styleLevel="section" weight={600} className="mb-3">Health Overview</DynamicType>
      <AppleTable columns={[{ key: 'label', label: 'Record', render: (r: any) => <span className="font-medium">{r.label}</span> }, { key: 'value', label: 'Details' }]} data={healthData} keyExtractor={r => r.label} />

      {/* Moments Section */}
      <div className="mt-8">
        <DynamicType styleLevel="section" weight={600} className="mb-4">Moments</DynamicType>

        {/* Upload area */}
        <AppleCard padding="md" className="mb-4">
          {pendingFile && momentPreview ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <div className="w-20 h-20 rounded-mm-lg bg-[var(--mm-fill)] overflow-hidden shrink-0 border border-[var(--mm-separator)]">
                  <img src={momentPreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={caption}
                    onChange={e => setCaption(e.target.value)}
                    placeholder="Write a caption..."
                    className="w-full h-[36px] px-[12px] rounded-mm-md text-mm-caption text-[var(--mm-label)] bg-[var(--mm-fill)] placeholder:text-[var(--mm-tertiaryLabel)] border-0 focus:outline-none focus:bg-[var(--mm-secondaryBackground)] transition-colors duration-200"
                  />
                  {uploadError && (
                    <p className="mt-1 text-mm-small text-[#FF3B30]">{uploadError}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-end gap-2">
                <AppleButton variant="secondary" size="sm" onClick={cancelPendingMoment} disabled={uploading}>
                  Cancel
                </AppleButton>
                <AppleButton variant="primary" size="sm" onClick={handleSaveMoment} disabled={uploading}>
                  {uploading ? (
                    <span className="flex items-center gap-1.5"><Loader2 size={14} className="animate-spin" /> Saving...</span>
                  ) : 'Save Moment'}
                </AppleButton>
              </div>
            </div>
          ) : (
            <button
              onClick={() => momentFileRef.current?.click()}
              className="w-full flex flex-col items-center gap-2 py-6 rounded-mm-lg border-2 border-dashed border-[var(--mm-separator)] text-[var(--mm-secondaryLabel)] hover:border-[var(--mm-link)] hover:text-[var(--mm-link)] transition-colors duration-200 cursor-pointer"
            >
              <Camera size={24} />
              <DynamicType styleLevel="caption" color="secondary">Add a moment photo</DynamicType>
            </button>
          )}
          <input ref={momentFileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleMomentFileSelect} />
        </AppleCard>

        {/* Moments grid */}
        {momentsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="text-[var(--mm-link)] animate-spin" />
          </div>
        ) : momentsError ? (
          <ErrorState message={momentsError} />
        ) : moments.length === 0 ? (
          <EmptyState icon={<Camera size={32} />} title="No moments yet" description="Capture your pet's special moments with a photo!" />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {moments.map(moment => (
              <AppleCard key={moment.id} padding="sm" hoverable className="overflow-hidden group">
                <div className="aspect-square rounded-mm-md overflow-hidden bg-[var(--mm-fill)] -mx-2 -mt-2 mb-1.5">
                  <img
                    src={moment.imageUrl}
                    alt={moment.caption ?? 'Pet moment'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                {moment.caption && (
                  <DynamicType styleLevel="small" color="secondary" className="line-clamp-2 px-0.5 pb-0.5">
                    {moment.caption}
                  </DynamicType>
                )}
                <DynamicType styleLevel="small" color="muted" className="px-0.5">
                  {formatDate(moment.takenAt)}
                </DynamicType>
              </AppleCard>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

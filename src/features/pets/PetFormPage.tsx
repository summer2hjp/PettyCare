import { useState, useRef } from 'react'
import { usePets } from '@/store/pet-context'
import { AppleButton } from '@/components/ui/AppleButton'
import { AppleCard } from '@/components/ui/AppleCard'
import { AppleAvatar } from '@/components/ui/AppleAvatar'
import { AppleSegmentedControl } from '@/components/ui/AppleSegmentedControl'
import { DynamicType } from '@/components/ui/DynamicType'
import { cn } from '@/utils/cn'
import { ArrowLeft, Camera } from 'lucide-react'
import type { Pet, PetFormData, PetSpecies, PetGender } from '@/types/pet'

interface PetFormPageProps { pet?: Pet; onBack?: () => void; onSaved?: () => void }

const speciesOptions = [
  { value: 'dog', label: 'Dog' }, { value: 'cat', label: 'Cat' }, { value: 'bird', label: 'Bird' },
  { value: 'fish', label: 'Fish' }, { value: 'rabbit', label: 'Rabbit' }, { value: 'hamster', label: 'Hamster' }, { value: 'other', label: 'Other' },
]

export function PetFormPage({ pet, onBack, onSaved }: PetFormPageProps) {
  const { addPet, updatePet } = usePets()
  const isEdit = !!pet
  const [form, setForm] = useState<PetFormData>({
    name: pet?.name ?? '', species: pet?.species ?? 'dog' as PetSpecies, breed: pet?.breed ?? '',
    gender: pet?.gender ?? 'male' as PetGender, birthDate: pet?.birthDate ?? '', weight: pet?.weight ?? 0,
    weightUnit: pet?.weightUnit ?? 'kg', color: pet?.color ?? '', microchipId: pet?.microchipId ?? '', notes: pet?.notes ?? '',
  })
  const [errors, setErrors] = useState<Partial<Record<keyof PetFormData, string>>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => set('avatarUrl', reader.result as string)
    reader.readAsDataURL(file)
  }

  const set = <K extends keyof PetFormData>(key: K, value: PetFormData[K]) => {
    setForm(prev => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: undefined }))
  }

  const validate = () => {
    const errs: typeof errors = {}
    if (!form.name.trim()) errs.name = 'Required'
    if (!form.breed.trim()) errs.breed = 'Required'
    if (!form.birthDate) errs.birthDate = 'Required'
    if (form.weight <= 0) errs.weight = 'Must be positive'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    if (isEdit && pet) updatePet(pet.id, form)
    else addPet(form)
    onSaved?.()
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onBack} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--apple-fill)] dark:hover:bg-transparent transition-colors">
          <ArrowLeft size={18} className="text-apple-label" />
        </button>
        <DynamicType styleLevel="title1" weight={700}>{isEdit ? 'Edit Pet' : 'New Pet'}</DynamicType>
      </div>

      <div className="flex justify-center mb-4">
        <div className="relative cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
          <AppleAvatar
            name={form.name || 'Pet'}
            src={form.avatarUrl}
            size="lg"
            className="ring-2 ring-apple-blue ring-offset-2 ring-offset-[var(--apple-secondarySystemBackground)]"
          />
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-apple-blue rounded-full flex items-center justify-center shadow-apple-sm group-hover:scale-110 transition-transform duration-200">
            <Camera size={10} className="text-white" />
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
        </div>
      </div>

      <AppleCard padding="md" className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Name" error={errors.name}>
            <input type="text" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Pet's name" className={fieldInput(errors.name)} />
          </Field>
          <Field label="Breed" error={errors.breed}>
            <input type="text" value={form.breed} onChange={e => set('breed', e.target.value)} placeholder="e.g. Golden Retriever" className={fieldInput(errors.breed)} />
          </Field>
        </div>

        <div>
          <DynamicType styleLevel="caption1" weight={600} className="mb-1.5">Species</DynamicType>
          <AppleSegmentedControl segments={speciesOptions} value={form.species} onChange={v => set('species', v as PetSpecies)} className="flex-nowrap overflow-x-auto scrollbar-none" />
        </div>

        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <DynamicType styleLevel="caption1" weight={600} className="mb-1.5">Gender</DynamicType>
            <div className="flex gap-2">
              {(['male', 'female'] as PetGender[]).map(g => (
                <button key={g} onClick={() => set('gender', g)}
                  className={cn('flex-1 py-1.5 rounded-apple-lg text-apple-caption-1 font-medium transition-all duration-200', form.gender === g ? 'bg-apple-blue text-white' : 'bg-[var(--apple-fill)] text-apple-label')}>
                  {g === 'male' ? '♂' : '♀'} {g === 'male' ? 'Male' : 'Female'}
                </button>
              ))}
            </div>
          </div>
          <div className="w-28">
            <Field label="Weight" error={errors.weight}>
              <input type="number" step="0.1" min="0" value={form.weight || ''} onChange={e => set('weight', parseFloat(e.target.value) || 0)} placeholder="0.0" className={fieldInput(errors.weight)} />
            </Field>
          </div>
          <div className="w-20">
            <DynamicType styleLevel="caption1" weight={600} className="mb-1.5">Unit</DynamicType>
            <div className="flex gap-1 p-0.5 bg-[var(--apple-fill)] rounded-apple-lg">
              {(['kg', 'lb'] as const).map(u => (
                <button key={u} onClick={() => set('weightUnit', u)}
                  className={cn('flex-1 py-1 rounded-apple-lg text-apple-caption-2 font-medium transition-all duration-200', form.weightUnit === u ? 'bg-[var(--apple-secondarySystemBackground)] text-apple-label shadow-apple-sm' : 'text-apple-label')}>{u}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Date of Birth" error={errors.birthDate}>
            <input type="date" value={form.birthDate} onChange={e => set('birthDate', e.target.value)} className={fieldInput(errors.birthDate)} />
          </Field>
          <Field label="Color">
            <input type="text" value={form.color ?? ''} onChange={e => set('color', e.target.value)} placeholder="e.g. Golden" className={fieldInput()} />
          </Field>
        </div>

        <Field label="Microchip ID">
          <input type="text" value={form.microchipId ?? ''} onChange={e => set('microchipId', e.target.value)} placeholder="e.g. 985112001234567" className={fieldInput()} />
        </Field>
        <Field label="Notes">
          <textarea value={form.notes ?? ''} onChange={e => set('notes', e.target.value)} placeholder="Any additional info..." rows={1} className={cn(fieldInput(), 'resize-none', 'leading-[34px]')} />
        </Field>
      </AppleCard>

      <div className="flex justify-end gap-3 mt-4">
        <AppleButton variant="secondary" onClick={onBack}>Cancel</AppleButton>
        <AppleButton onClick={handleSubmit}>{isEdit ? 'Save Changes' : 'Add Pet'}</AppleButton>
      </div>
    </div>
  )
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <DynamicType styleLevel="footnote"  weight={600} className="mb-1.5">
        {label} {error && <span className="text-apple-red ml-1">{error}</span>}
      </DynamicType>
      {children}
    </div>
  )
}

function fieldInput(error?: string) {
  return cn('w-full h-[36px] px-[12px] rounded-apple-lg text-apple-footnote text-apple-label text-left bg-[var(--apple-fill)] placeholder:text-apple-placeholderText border-0 focus:outline-none focus:bg-[var(--apple-secondarySystemBackground)] transition-colors duration-200', error && 'ring-2 ring-apple-red')
}

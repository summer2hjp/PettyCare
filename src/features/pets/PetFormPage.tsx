import { useState, useEffect, useRef } from 'react'
import { usePets } from '@/store/pet-context'
import { AppleButton } from '@/components/ui/AppleButton'
import { AppleCard } from '@/components/ui/AppleCard'
import { DynamicType } from '@/components/ui/DynamicType'
import { cn } from '@/utils/cn'
import { ChevronDown } from 'lucide-react'
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
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(pet?.avatarUrl ? `/picture/${pet.avatarUrl}` : null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onBack?.() }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [onBack])

  const set = <K extends keyof PetFormData>(key: K, value: PetFormData[K]) => {
    setForm(prev => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: undefined }))
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
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

  const handleSubmit = async () => {
    if (!validate() || saving) return
    setSaving(true)
    setSaveError(null)
    try {
      if (isEdit && pet) await updatePet(pet.id, form)
      else await addPet(form)
      onSaved?.()
    } catch (err) {
      console.error('Save pet error:', err)
      const msg = err instanceof Error ? err.message : (err as Record<string, unknown>)?.message as string || JSON.stringify(err)
      setSaveError(msg)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto flex items-center min-h-[calc(100vh-120px)]">
      <div className="w-full">
      <AppleCard padding="md" className="space-y-3">
        {/* Header actions */}
        <div className="grid grid-cols-2 gap-3 mb-2">
          <AppleButton variant="secondary" size="sm" onClick={onBack} className="justify-self-start">Cancel</AppleButton>
          <div className="flex justify-end">
            <AppleButton variant="secondary" size="sm" onClick={handleSubmit} disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </AppleButton>
          </div>
        </div>
        {/* Avatar upload */}
        <div className="flex items-center gap-4 py-2">
          <div className="w-20 h-20 rounded-2xl bg-[var(--apple-fill)] flex items-center justify-center overflow-hidden shrink-0 border border-[var(--apple-separator)]">
            {previewUrl ? (
              <img src={previewUrl} alt="Pet preview" className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl">🐾</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <DynamicType styleLevel="body" weight={600}>Pet Photo</DynamicType>
            <DynamicType styleLevel="caption1" className="text-apple-secondaryLabel mt-0.5">Upload a photo of your pet</DynamicType>
            <div className="mt-2">
              <AppleButton variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
                {previewUrl ? 'Change Photo' : 'Upload Photo'}
              </AppleButton>
            </div>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
        </div>
        {saveError && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-2.5 mb-3">
            <p className="text-[13px] text-apple-red font-semibold">{saveError}</p>
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Name" error={errors.name}>
            <input type="text" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Pet's name" className={fieldInput(errors.name)} />
          </Field>
          <Field label="Breed" error={errors.breed}>
            <input type="text" value={form.breed} onChange={e => set('breed', e.target.value)} placeholder="e.g. Golden Retriever" className={fieldInput(errors.breed)} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Species">
            <FormSelect value={form.species} onChange={v => set('species', v as PetSpecies)} options={speciesOptions} />
          </Field>
          <Field label="Gender">
            <FormSelect value={form.gender} onChange={v => set('gender', v as PetGender)} options={[{ value: 'male', label: '♂ Male' }, { value: 'female', label: '♀ Female' }]} />
          </Field>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Field label="Date of Birth" error={errors.birthDate}>
            <input type="date" value={form.birthDate} onChange={e => set('birthDate', e.target.value)} className={fieldInput(errors.birthDate)} />
          </Field>
          <Field label="Weight" error={errors.weight}>
            <input type="number" step="0.1" min="0" value={form.weight || ''} onChange={e => set('weight', parseFloat(e.target.value) || 0)} placeholder="0.0" className={fieldInput(errors.weight)} />
          </Field>
          <Field label="Unit">
            <FormSelect value={form.weightUnit} onChange={v => set('weightUnit', v as 'kg' | 'lb')} options={[{ value: 'kg', label: 'kg' }, { value: 'lb', label: 'lb' }]} />
          </Field>
        </div>

        <Field label="Color">
          <input type="text" value={form.color ?? ''} onChange={e => set('color', e.target.value)} placeholder="e.g. Golden, White, Black" className={fieldInput()} />
        </Field>
        <Field label="Microchip ID">
          <input type="text" value={form.microchipId ?? ''} onChange={e => set('microchipId', e.target.value)} placeholder="e.g. 985112001234567" className={fieldInput()} />
        </Field>
        <Field label="Notes">
          <textarea value={form.notes ?? ''} onChange={e => set('notes', e.target.value)} placeholder="Any additional info..." rows={1} className={cn(fieldInput(), 'resize-none', 'leading-[34px]')} />
        </Field>
      </AppleCard>
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

function FormSelect({ value, onChange, options, placeholder }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; placeholder?: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const current = options.find(o => o.value === value)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    if (open) { document.addEventListener('mousedown', handleClick); document.addEventListener('keydown', handleEsc) }
    return () => { document.removeEventListener('mousedown', handleClick); document.removeEventListener('keydown', handleEsc) }
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen(!open)}
        className={cn('w-full h-[36px] px-[10px] rounded-apple-lg text-apple-footnote text-left bg-[var(--apple-fill)] border-0 flex items-center justify-between gap-1 cursor-pointer')}>
        <span className={cn(current ? 'text-apple-label' : 'text-apple-placeholderText')}>{current?.label ?? placeholder}</span>
        <ChevronDown size={14} className={cn('text-apple-secondaryLabel shrink-0 transition-transform duration-200', open && 'rotate-180')} />
      </button>
      {open && (
        <div className={cn('absolute left-0 top-full mt-1 w-full py-1 z-50 rounded-apple-xl shadow-apple-lg border border-[var(--apple-separator)] bg-[var(--apple-secondarySystemGroupedBackground)] animate-scale-in')}>
          {options.map(o => (
            <button key={o.value} type="button" onClick={() => { onChange(o.value); setOpen(false) }}
              className={cn('w-full flex items-center px-3 py-2 text-apple-footnote text-left transition-colors duration-100', o.value === value ? 'text-apple-label font-semibold' : 'text-apple-label hover:text-apple-blue')}>
              {o.label}
              {o.value === value && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-apple-blue" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function fieldInput(error?: string) {
  return cn('w-full h-[36px] px-[12px] rounded-apple-lg text-apple-footnote text-apple-label text-left bg-[var(--apple-fill)] placeholder:text-apple-placeholderText border-0 focus:outline-none focus:bg-[var(--apple-secondarySystemBackground)] transition-colors duration-200', error && 'ring-2 ring-apple-red')
}

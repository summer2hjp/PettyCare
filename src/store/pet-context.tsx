import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import type { Pet, PetFormData } from '@/types/pet'

interface PetContextType {
  pets: Pet[]
  loading: boolean
  error: string | null
  getPet: (id: string) => Pet | undefined
  addPet: (data: PetFormData) => Promise<void>
  updatePet: (id: string, data: Partial<PetFormData>) => Promise<void>
  deletePet: (id: string) => Promise<void>
}

const PetContext = createContext<PetContextType | null>(null)

export function PetProvider({ children }: { children: ReactNode }) {
  const [pets, setPets] = useState<Pet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    supabase.from('pets').select('*').then(({ data, error: err }) => {
      if (cancelled) return
      if (err) { setError(err.message) }
      else { setPets(data as Pet[]) }
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [])

  const getPet = useCallback((id: string) => pets.find(p => p.id === id), [pets])

  const addPet = useCallback(async (data: PetFormData) => {
    const { data: members } = await supabase
      .from('household_members')
      .select('household_id')
      .limit(1)
      .single()
    if (!members) throw new Error('No household found')

    const { data: newPet, error: err } = await supabase
      .from('pets')
      .insert({ ...data, household_id: members.household_id })
      .select()
      .single()
    if (err) throw err
    setPets(prev => [newPet as Pet, ...prev])
  }, [])

  const updatePet = useCallback(async (id: string, data: Partial<PetFormData>) => {
    const { error: err } = await supabase
      .from('pets')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (err) throw err
    setPets(prev => prev.map(p => p.id === id ? { ...p, ...data } as Pet : p))
  }, [])

  const deletePet = useCallback(async (id: string) => {
    const { error: err } = await supabase.from('pets').delete().eq('id', id)
    if (err) throw err
    setPets(prev => prev.filter(p => p.id !== id))
  }, [])

  return (
    <PetContext.Provider value={{ pets, loading, error, getPet, addPet, updatePet, deletePet }}>
      {children}
    </PetContext.Provider>
  )
}

export function usePets() {
  const ctx = useContext(PetContext)
  if (!ctx) throw new Error('usePets must be used within PetProvider')
  return ctx
}

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { Pet, PetFormData } from '@/types/pet'

const MOCK_PETS: Pet[] = [
  { id: '1', name: 'Luna', species: 'cat', breed: 'Persian', gender: 'female', birthDate: '2021-03-15', weight: 4.2, weightUnit: 'kg', color: '#F5F0EB', notes: 'Loves catnip', createdAt: '2023-01-10T08:00:00Z', updatedAt: '2024-12-01T10:00:00Z' },
  { id: '2', name: 'Max', species: 'dog', breed: 'Golden Retriever', gender: 'male', birthDate: '2019-07-20', weight: 32.5, weightUnit: 'kg', color: '#D4A574', createdAt: '2023-01-10T08:00:00Z', updatedAt: '2024-12-01T10:00:00Z' },
  { id: '3', name: 'Coco', species: 'dog', breed: 'Poodle', gender: 'female', birthDate: '2022-11-05', weight: 6.8, weightUnit: 'kg', color: '#FFFFFF', createdAt: '2023-06-15T08:00:00Z', updatedAt: '2024-12-01T10:00:00Z' },
  { id: '4', name: 'Bella', species: 'cat', breed: 'Siamese', gender: 'female', birthDate: '2020-09-12', weight: 3.8, weightUnit: 'kg', notes: 'Indoor only', createdAt: '2023-03-20T08:00:00Z', updatedAt: '2024-12-01T10:00:00Z' },
  { id: '5', name: 'Charlie', species: 'hamster', breed: 'Syrian', gender: 'male', birthDate: '2024-06-01', weight: 0.15, weightUnit: 'kg', createdAt: '2024-06-15T08:00:00Z', updatedAt: '2024-12-01T10:00:00Z' },
]

interface PetContextType {
  pets: Pet[]; loading: boolean; error: string | null
  getPet: (id: string) => Pet | undefined
  addPet: (data: PetFormData) => void
  updatePet: (id: string, data: Partial<PetFormData>) => void
  deletePet: (id: string) => void
}

const PetContext = createContext<PetContextType | null>(null)

export function PetProvider({ children }: { children: ReactNode }) {
  const [pets, setPets] = useState<Pet[]>(MOCK_PETS)
  const [loading] = useState(false)
  const [error] = useState<string | null>(null)
  const getPet = useCallback((id: string) => pets.find(p => p.id === id), [pets])
  const addPet = useCallback((data: PetFormData) => { setPets(prev => [{ id: String(Date.now()), ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, ...prev]) }, [])
  const updatePet = useCallback((id: string, data: Partial<PetFormData>) => { setPets(prev => prev.map(p => p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p)) }, [])
  const deletePet = useCallback((id: string) => { setPets(prev => prev.filter(p => p.id !== id)) }, [])
  return <PetContext.Provider value={{ pets, loading, error, getPet, addPet, updatePet, deletePet }}>{children}</PetContext.Provider>
}

export function usePets() {
  const ctx = useContext(PetContext)
  if (!ctx) throw new Error('usePets must be used within PetProvider')
  return ctx
}

export type PetSpecies = 'dog' | 'cat' | 'bird' | 'fish' | 'rabbit' | 'hamster' | 'other'
export type PetGender = 'male' | 'female'

export interface Pet {
  id: string
  name: string
  species: PetSpecies
  breed: string
  gender: PetGender
  birthDate: string
  weight: number
  weightUnit: 'kg' | 'lb'
  avatarUrl?: string
  color?: string
  microchipId?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface PetFormData {
  name: string
  species: PetSpecies
  breed: string
  gender: PetGender
  birthDate: string
  weight: number
  weightUnit: 'kg' | 'lb'
  avatarUrl?: string
  color?: string
  microchipId?: string
  notes?: string
}

export type PetListState = 'loading' | 'empty' | 'data' | 'error'

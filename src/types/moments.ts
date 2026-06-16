// src/types/moments.ts

export type MomentType = 'daily' | 'interaction' | 'growth'

export interface PetMoment {
  id: string
  petId: string
  imageUrl: string
  caption: string | null
  momentType: MomentType
  takenAt: string
  createdAt: string
}

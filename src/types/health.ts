import type { HealthStatus } from '../design-tokens/colors'

export type VaccinationStatus = 'upcoming' | 'overdue' | 'completed'

export interface Vaccination {
  id: string
  petId: string
  name: string
  scheduledDate: string
  administeredDate?: string
  status: VaccinationStatus
  vetName?: string
  notes?: string
}

export interface VetVisit {
  id: string
  petId: string
  date: string
  reason: string
  diagnosis?: string
  prescription?: string
  vetName: string
  cost?: number
  followUpDate?: string
  notes?: string
}

export interface Medication {
  id: string
  petId: string
  name: string
  dosage: string
  frequency: string
  startDate: string
  endDate?: string
  isActive: boolean
  notes?: string
}

export interface WeightRecord {
  id: string
  petId: string
  date: string
  weight: number
  unit: 'kg' | 'lb'
  notes?: string
}

export interface HealthOverview {
  petId: string
  overallStatus: HealthStatus
  lastVetVisit?: VetVisit
  upcomingVaccinations: Vaccination[]
  activeMedications: Medication[]
  weightTrend: WeightRecord[]
  healthScore: number
}

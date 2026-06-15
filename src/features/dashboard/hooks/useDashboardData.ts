// src/features/dashboard/hooks/useDashboardData.ts
import { useState, useEffect } from 'react'
import { usePets } from '@/store/pet-context'
import { supabase } from '@/lib/supabase'
import type { DashboardData, DashboardHealthData, DashboardActivityData, FeedingMeal, DashboardUpcomingEvent, TimelineEntry, DashboardInsight, DashboardAction, DashboardHealthStatus } from '@/features/dashboard/types/dashboard'
import type { Vaccination, VetVisit, Medication } from '@/types/health'

// Local type definitions for Supabase query results
interface ActivityRecord {
  date: string
  steps: number
  distance: number
  duration: number
  calories: number
}

interface FeedingRecord {
  id: string
  time: string
  food: string
  portion: string
}

interface Appointment {
  id: string
  petId: string
  date: string
  time: string
  type: string
  vet: string
}

const MS_PER_DAY = 86400000
const HEALTH_BASE_SCORE = 95
const HEALTH_UPCOMING_PENALTY = 5
const HEALTH_MEDICATION_PENALTY = 3

const URGENCY_ORDER: Record<DashboardUpcomingEvent['urgency'], number> = {
  tomorrow: 0,
  'within-3-days': 1,
  'next-week': 2,
  later: 3,
}

const STATIC_ACTIONS: DashboardAction[] = [
  { id: 'add-pet', label: 'Add Pet', icon: '➕', navigateTo: { page: 'pet-form' } },
  { id: 'log-feed', label: 'Log Feeding', icon: '🍽', navigateTo: { page: 'feeding' } },
  { id: 'log-vacc', label: 'Log Vaccination', icon: '💉', navigateTo: { page: 'health' } },
  { id: 'schedule', label: 'Schedule Visit', icon: '📅', navigateTo: { page: 'appointments' } },
  { id: 'add-visit', label: 'Add Vet Visit', icon: '🏥', navigateTo: { page: 'health' } },
]

function computeHealthScore(petCount: number, upcomingCount: number, activeMedCount: number): { score: number; status: DashboardHealthStatus } {
  if (petCount === 0) return { score: 0, status: 'No Data' }
  const deductions = upcomingCount * HEALTH_UPCOMING_PENALTY + activeMedCount * HEALTH_MEDICATION_PENALTY
  const score = Math.max(0, Math.min(100, HEALTH_BASE_SCORE - deductions))
  if (score >= 80) return { score, status: 'Excellent' }
  if (score >= 60) return { score, status: 'Good' }
  if (score >= 40) return { score, status: 'Fair' }
  return { score, status: 'Attention' }
}

function getUrgencyLabel(dateStr: string): DashboardUpcomingEvent['urgency'] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr)
  target.setHours(0, 0, 0, 0)
  const diffDays = Math.round((target.getTime() - today.getTime()) / MS_PER_DAY)
  if (diffDays <= 1) return 'tomorrow'
  if (diffDays <= 3) return 'within-3-days'
  if (diffDays <= 7) return 'next-week'
  return 'later'
}

export function useDashboardData(): DashboardData {
  const { pets } = usePets()
  const [data, setData] = useState<DashboardData>({
    loading: true,
    error: null,
    health: null,
    activity: null,
    feeding: [],
    events: [],
    timeline: [],
    insights: [],
    actions: STATIC_ACTIONS,
  })

  useEffect(() => {
    let cancelled = false

    async function loadData(): Promise<void> {
      try {
        // ── Health: Vaccinations ──
        const vaccQueries = pets.map(p =>
          supabase.from('vaccinations').select('*').eq('pet_id', p.id)
        )
        const vaccResults = await Promise.all(vaccQueries)
        const allVaccinations: Vaccination[] = vaccResults.flatMap((result, idx) => {
          const { data, error } = result
          if (error) throw error
          return (data ?? []).map(v => ({ ...(v as Vaccination), petId: pets[idx].id }))
        })

        // ── Health: Medications ──
        const medQueries = pets.map(p =>
          supabase.from('medications').select('*').eq('pet_id', p.id)
        )
        const medResults = await Promise.all(medQueries)
        const allMedications: Medication[] = medResults.flatMap((result, idx) => {
          const { data, error } = result
          if (error) throw error
          return (data ?? []).map(m => ({ ...(m as Medication), petId: pets[idx].id }))
        })

        // ── Health: Vet Visits ──
        const visitQueries = pets.map(p =>
          supabase.from('visits').select('*').eq('pet_id', p.id)
        )
        const visitResults = await Promise.all(visitQueries)
        const allVisits: VetVisit[] = visitResults.flatMap((result, idx) => {
          const { data, error } = result
          if (error) throw error
          return (data ?? []).map(v => ({ ...(v as VetVisit), petId: pets[idx].id }))
        })

        const totalUpcoming: number = allVaccinations.filter(
          (v: Vaccination) => v.status === 'upcoming' || v.status === 'overdue'
        ).length

        const totalActiveMed: number = allMedications.filter((m: Medication) => m.isActive).length

        const lastVisit: VetVisit | null = allVisits.length > 0
          ? [...allVisits].sort(
            (a: VetVisit, b: VetVisit) => new Date(b.date).getTime() - new Date(a.date).getTime()
          )[0]
          : null

        const { score, status } = computeHealthScore(pets.length, totalUpcoming, totalActiveMed)
        const health: DashboardHealthData = {
          score,
          status,
          upcomingVaccinations: totalUpcoming,
          lastVisit: lastVisit ? { date: lastVisit.date, vetName: lastVisit.vetName } : null,
          activeMedications: totalActiveMed,
        }

        // ── Activity ──
        const firstPetId = pets[0]?.id ?? ''
        let activity: DashboardActivityData = {
          steps: 0,
          distance: 0,
          duration: 0,
          calories: 0,
          weeklyAvg: 0,
          trendDirection: 'up',
          trendPercent: 0,
        }

        if (firstPetId) {
          const { data: activityData, error: activityError } = await supabase
            .from('activity_records')
            .select('*')
            .eq('pet_id', firstPetId)
            .order('date', { ascending: true })

          if (activityError) throw activityError
          const activityRecords: ActivityRecord[] = (activityData ?? []) as ActivityRecord[]

          if (activityRecords.length > 0) {
            const todayRecord: ActivityRecord = activityRecords[activityRecords.length - 1]
            const weekRecords: ActivityRecord[] = activityRecords.slice(-7)
            const weekAvg: number = weekRecords.length > 0
              ? Math.round(weekRecords.reduce<number>((s: number, r: ActivityRecord) => s + r.steps, 0) / weekRecords.length)
              : 0
            const prevWeekRecords: ActivityRecord[] = activityRecords.slice(-14, -7)
            const prevWeekAvg: number = prevWeekRecords.length > 0
              ? Math.round(prevWeekRecords.reduce<number>((s: number, r: ActivityRecord) => s + r.steps, 0) / prevWeekRecords.length)
              : 0
            const trendPercent: number = prevWeekAvg > 0
              ? Math.round(((weekAvg - prevWeekAvg) / prevWeekAvg) * 100)
              : 0

            activity = {
              steps: todayRecord.steps,
              distance: todayRecord.distance,
              duration: todayRecord.duration,
              calories: todayRecord.calories,
              weeklyAvg: weekAvg,
              trendDirection: trendPercent >= 0 ? 'up' : 'down',
              trendPercent: Math.abs(trendPercent),
            }
          }
        }

        // ── Feeding ──
        const feedingQueries = pets.map(p =>
          supabase.from('feeding_records').select('*').eq('pet_id', p.id)
        )
        const feedingResults = await Promise.all(feedingQueries)
        const feeding: FeedingMeal[] = feedingResults.flatMap((result, idx) => {
          const { data, error } = result
          if (error) throw error
          const records: FeedingRecord[] = (data ?? []) as FeedingRecord[]
          return records.map((r: FeedingRecord, i: number) => ({
            id: `feed-${pets[idx].id}-${i}`,
            time: r.time,
            label: '',
            food: r.food ?? '',
            portion: r.portion ?? '',
            petName: pets[idx].name,
            status: (new Date(r.time) < new Date() ? 'completed' : 'upcoming') as 'completed' | 'upcoming',
          }))
        }).sort((a: FeedingMeal, b: FeedingMeal) => new Date(a.time).getTime() - new Date(b.time).getTime())

        // ── Events ──
        const apptQueries = pets.map(p =>
          supabase.from('appointments').select('*').eq('pet_id', p.id)
        )
        const apptResults = await Promise.all(apptQueries)
        const allAppointments: Appointment[] = apptResults.flatMap((result, idx) => {
          const { data, error } = result
          if (error) throw error
          return (data ?? []).map(a => ({ ...(a as Appointment), petId: pets[idx].id }))
        })

        const events: DashboardUpcomingEvent[] = [
          ...allVaccinations
            .filter((v: Vaccination) => v.status === 'upcoming' || v.status === 'overdue')
            .map((v: Vaccination) => {
              const pet = pets.find(p => p.id === v.petId)
              return {
                id: `ev-vacc-${v.id}`,
                title: `${pet?.name ?? 'Unknown'}: ${v.name}`,
                date: v.scheduledDate,
                type: 'vaccination' as const,
                urgency: getUrgencyLabel(v.scheduledDate),
                petName: pet?.name ?? 'Unknown',
              }
            }),
          ...allAppointments.map((a: Appointment) => {
            const pet = pets.find(p => p.id === a.petId)
            return {
              id: `ev-appt-${a.id}`,
              title: `${pet?.name ?? 'Unknown'}: ${a.type}`,
              date: a.date,
              time: a.time,
              type: 'appointment' as const,
              urgency: getUrgencyLabel(a.date),
              petName: pet?.name ?? 'Unknown',
            }
          }),
        ].sort(
          (a: DashboardUpcomingEvent, b: DashboardUpcomingEvent) =>
            URGENCY_ORDER[a.urgency] - URGENCY_ORDER[b.urgency]
        )

        // ── Timeline & Insights (empty until Supabase data is richer) ──
        const timeline: TimelineEntry[] = []
        const insights: DashboardInsight[] = []

        if (!cancelled) {
          setData({
            loading: false,
            error: null,
            health,
            activity,
            feeding,
            events,
            timeline,
            insights,
            actions: STATIC_ACTIONS,
          })
        }
      } catch (err) {
        if (!cancelled) {
          setData(
            (prev: DashboardData): DashboardData => ({
              ...prev,
              loading: false,
              error: err instanceof Error ? err.message : 'Failed to load dashboard data',
            })
          )
        }
      }
    }

    loadData()
    return () => { cancelled = true }
  }, [pets])

  return data
}

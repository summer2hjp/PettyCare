// src/features/dashboard/hooks/useDashboardData.ts
import { useState, useEffect } from 'react'
import { usePets } from '@/store/pet-context'
import { mockVaccinations, mockVisits, mockMedications } from '@/features/health/HealthPage'
import { mockActivity } from '@/features/activity/ActivityPage'
import { schedules, mockFeedingRecords } from '@/features/feeding/FeedingPage'
import { mockAppointments } from '@/features/appointments/AppointmentsPage'
import { relativeTime } from '@/utils/date'
import type { DashboardData, DashboardHealthData, DashboardActivityData, FeedingMeal, DashboardUpcomingEvent, TimelineEntry, DashboardInsight, DashboardAction, DashboardHealthStatus } from '@/features/dashboard/types/dashboard'

const MS_PER_DAY = 86400000
const HEALTH_BASE_SCORE = 95
const HEALTH_UPCOMING_PENALTY = 5
const HEALTH_MEDICATION_PENALTY = 3
const TREND_WINDOW_DAYS = 7
const MAX_TIMELINE_ENTRIES = 10

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

function mockTimeline(pets: { id: string; name: string }[], feedingMeals: FeedingMeal[]): TimelineEntry[] {
  const entries: TimelineEntry[] = []

  // Add feeding entries
  feedingMeals.forEach(meal => {
    const mealDate = new Date(meal.time)
    entries.push({
      id: `tl-feed-${meal.id}`,
      type: 'feeding',
      description: `${meal.petName} fed ${meal.label}`,
      detail: `${meal.food} · ${meal.portion}`,
      timestamp: mealDate.toISOString(),
      relativeTime: relativeTime(mealDate.toISOString()),
      petName: meal.petName,
    })
  })

  // Add mock activity entries
  pets.forEach(pet => {
    const records = mockActivity(pet.id)
    const latest = records[records.length - 1]
    if (latest) {
      const activityDate = new Date()
      activityDate.setHours(activityDate.getHours() - 2)
      entries.push({
        id: `tl-act-${pet.id}`,
        type: 'activity',
        description: `${pet.name} walked ${latest.distance} km`,
        detail: `${latest.steps} steps · ${latest.duration} min`,
        timestamp: activityDate.toISOString(),
        relativeTime: relativeTime(activityDate.toISOString()),
        petName: pet.name,
      })
    }
  })

  // Add mock vaccination entries (completed ones as recent activity)
  pets.forEach(pet => {
    const vaccs = mockVaccinations(pet.id).filter(v => v.status === 'completed')
    vaccs.forEach(v => {
      entries.push({
        id: `tl-vacc-${v.id}`,
        type: 'vaccination',
        description: `${pet.name} got ${v.name}`,
        detail: v.vetName ? `by ${v.vetName}` : '',
        timestamp: v.administeredDate ?? v.scheduledDate,
        relativeTime: relativeTime(v.administeredDate ?? v.scheduledDate),
        petName: pet.name,
      })
    })
  })

  return entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, MAX_TIMELINE_ENTRIES)
}

function computeInsights(pets: { id: string; name: string }[]): DashboardInsight[] {
  const insights: DashboardInsight[] = []

  pets.forEach(pet => {
    const records = mockActivity(pet.id)
    if (records.length >= 14) {
      const thisWeek = records.slice(-TREND_WINDOW_DAYS).reduce((s, r) => s + r.steps, 0)
      const prevWeek = records.slice(-14, -TREND_WINDOW_DAYS).reduce((s, r) => s + r.steps, 0)
      if (prevWeek > 0) {
        const change = Math.round(((thisWeek - prevWeek) / prevWeek) * 100)
        insights.push({
          id: `insight-act-${pet.id}`,
          type: 'trend',
          title: `${pet.name} Activity Trend`,
          description: change > 0
            ? `This week's activity is up ${change}%`
            : `This week's activity is down ${Math.abs(change)}%`,
          trendData: records.slice(-7).map(r => r.steps),
        })
      }
    }
  })

  // Health tip for pets with upcoming/overdue vaccinations
  pets.forEach(pet => {
    const upcoming = mockVaccinations(pet.id).filter(v => v.status === 'upcoming' || v.status === 'overdue')
    if (upcoming.length > 0) {
      insights.push({
        id: `insight-tip-${pet.id}`,
        type: 'tip',
        title: `${pet.name} has ${upcoming.length} vaccination${upcoming.length > 1 ? 's' : ''} due`,
        description: upcoming.map(v => `${v.name} (${v.status === 'overdue' ? 'Overdue!' : v.scheduledDate})`).join(', '),
      })
    }
  })

  // Comparison for multiple pets
  if (pets.length >= 2) {
    const withActivity = pets.map(p => ({
      name: p.name,
      avgSteps: mockActivity(p.id).slice(-7).reduce((s, r) => s + r.steps, 0) / 7,
    })).filter(p => p.avgSteps > 0)
    if (withActivity.length >= 2) {
      const sorted = [...withActivity].sort((a, b) => b.avgSteps - a.avgSteps)
      insights.push({
        id: 'insight-compare',
        type: 'comparison',
        title: 'Activity Leader',
        description: `${sorted[0].name} is most active (${Math.round(sorted[0].avgSteps).toLocaleString()} avg steps vs ${Math.round(sorted[1].avgSteps).toLocaleString()})`,
      })
    }
  }

  return insights
}

const STATIC_ACTIONS: DashboardAction[] = [
  { id: 'add-pet', label: 'Add Pet', icon: '➕', navigateTo: { page: 'pet-form' } },
  { id: 'log-feed', label: 'Log Feeding', icon: '🍽', navigateTo: { page: 'feeding' } },
  { id: 'log-vacc', label: 'Log Vaccination', icon: '💉', navigateTo: { page: 'health' } },
  { id: 'schedule', label: 'Schedule Visit', icon: '📅', navigateTo: { page: 'appointments' } },
  { id: 'add-visit', label: 'Add Vet Visit', icon: '🏥', navigateTo: { page: 'health' } },
]

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
    Promise.resolve().then(() => {
      if (cancelled) return
      try {
        const petList = pets.map(p => ({ id: p.id, name: p.name }))

        // ── Health ──
        const totalUpcoming = pets.reduce((sum, p) =>
          sum + mockVaccinations(p.id).filter(v => v.status === 'upcoming' || v.status === 'overdue').length, 0)
        const totalActiveMed = pets.reduce((sum, p) =>
          sum + mockMedications(p.id).filter(m => m.isActive).length, 0)
        const allVisits = pets.flatMap(p => mockVisits(p.id))
        const lastVisit = allVisits.length > 0
          ? [...allVisits].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
          : null
        const { score, status } = computeHealthScore(pets.length, totalUpcoming, totalActiveMed)
        const health: DashboardHealthData = { score, status, upcomingVaccinations: totalUpcoming, lastVisit: lastVisit ? { date: lastVisit.date, vetName: lastVisit.vetName } : null, activeMedications: totalActiveMed }

        // ── Activity ──
        const firstPetId = pets[0]?.id ?? ''
        const activityRecords = firstPetId ? mockActivity(firstPetId) : []
        const todayRecord = activityRecords.length > 0 ? activityRecords[activityRecords.length - 1] : null
        const weekRecords = activityRecords.slice(-7)
        const weekAvg = weekRecords.length > 0 ? Math.round(weekRecords.reduce((s, r) => s + r.steps, 0) / weekRecords.length) : 0
        const prevWeekRecords = activityRecords.slice(-14, -7)
        const prevWeekAvg = prevWeekRecords.length > 0 ? Math.round(prevWeekRecords.reduce((s, r) => s + r.steps, 0) / prevWeekRecords.length) : 0
        const trendPercent = prevWeekAvg > 0 ? Math.round(((weekAvg - prevWeekAvg) / prevWeekAvg) * 100) : 0
        const activity: DashboardActivityData = {
          steps: todayRecord?.steps ?? 0,
          distance: todayRecord?.distance ?? 0,
          duration: todayRecord?.duration ?? 0,
          calories: todayRecord?.calories ?? 0,
          weeklyAvg: weekAvg,
          trendDirection: trendPercent >= 0 ? 'up' : 'down',
          trendPercent: Math.abs(trendPercent),
        }

        // ── Feeding ──
        const feeding: FeedingMeal[] = pets.flatMap(p => {
          const petSched = schedules[p.id] ?? []
          const records = mockFeedingRecords(p.id)
          const today = new Date().toISOString().slice(0, 10)
          return petSched.map((s, i) => {
            const record = records[i]
            const mealTime = `${today}T${s.time}:00`
            const mealDate = new Date(mealTime)
            const now = new Date()
            const isPast = mealDate < now
            return {
              id: `feed-${p.id}-${i}`,
              time: mealTime,
              label: s.label,
              food: record?.food ?? '',
              portion: record?.portion ?? '',
              petName: p.name,
              status: isPast ? 'completed' as const : 'upcoming' as const,
            }
          })
        }).sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())

        // ── Events ──
        const events: DashboardUpcomingEvent[] = [
          ...pets.flatMap(p =>
            mockVaccinations(p.id).filter(v => v.status === 'upcoming' || v.status === 'overdue').map(v => ({
              id: `ev-vacc-${v.id}`,
              title: `${p.name}: ${v.name}`,
              date: v.scheduledDate,
              type: 'vaccination' as const,
              urgency: getUrgencyLabel(v.scheduledDate),
              petName: p.name,
            }))
          ),
          ...pets.flatMap(p =>
            mockAppointments(p.id).map(a => ({
              id: `ev-appt-${a.id}`,
              title: `${p.name}: ${a.type}`,
              date: a.date,
              time: a.time,
              type: 'appointment' as const,
              urgency: getUrgencyLabel(a.date),
              petName: p.name,
            }))
          ),
        ].sort((a, b) => {
          const urgencyOrder = { tomorrow: 0, 'within-3-days': 1, 'next-week': 2, later: 3 }
          return urgencyOrder[a.urgency] - urgencyOrder[b.urgency]
        })

        // ── Timeline & Insights ──
        const timeline = mockTimeline(petList, feeding)
        const insights = computeInsights(petList)

        if (!cancelled) {
          setData({ loading: false, error: null, health, activity, feeding, events, timeline, insights, actions: STATIC_ACTIONS })
        }
      } catch (err) {
        if (!cancelled) {
          setData(prev => ({ ...prev, loading: false, error: err instanceof Error ? err.message : 'Failed to load dashboard data' }))
        }
      }
    })
    return () => { cancelled = true }
  }, [pets])

  return data
}

# Dashboard Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract the inline Dashboard code from App.tsx into a standalone feature module with Apple HIG-style horizontal scrolling card sections, aggregated data from all feature areas.

**Architecture:** Create `src/features/dashboard/` with reusable `DashboardSection` container, typed data hook `useDashboardData()`, and 7 independent section components. Each section pulls data from feature-page mock exports via the hook. App.tsx gets a single `<DashboardPage />` call replacing 90+ inline lines.

**Tech Stack:** React 19 + TypeScript, Tailwind CSS 3.4 (Apple HIG tokens), Framer Motion 11, Lucide React, `cn()` utility

---

### Task 1: Dashboard type definitions

**Files:**
- Create: `src/features/dashboard/types/dashboard.ts`

- [ ] **Create the file**

```typescript
// src/features/dashboard/types/dashboard.ts
export interface DashboardHealthData {
  score: number
  status: string
  upcomingVaccinations: number
  lastVisit: { date: string; vetName: string } | null
  activeMedications: number
}

export interface DashboardActivityData {
  steps: number
  distance: number
  duration: number
  calories: number
  weeklyAvg: number
  trendDirection: 'up' | 'down'
  trendPercent: number
}

export interface FeedingMeal {
  id: string
  time: string
  label: string
  food: string
  portion: string
  petName: string
  status: 'completed' | 'upcoming' | 'pending'
}

export interface DashboardUpcomingEvent {
  id: string
  title: string
  date: string
  time?: string
  type: 'vaccination' | 'appointment' | 'visit'
  urgency: 'tomorrow' | 'within-3-days' | 'next-week' | 'later'
  petName: string
}

export interface TimelineEntry {
  id: string
  type: 'vaccination' | 'feeding' | 'activity' | 'appointment' | 'visit'
  description: string
  detail: string
  timestamp: string
  relativeTime: string
  petName: string
}

export interface DashboardInsight {
  id: string
  type: 'trend' | 'tip' | 'comparison'
  title: string
  description: string
  trendData?: number[]
}

export interface DashboardAction {
  id: string
  label: string
  icon: string
  navigateTo: { page: string }
}

export interface DashboardData {
  loading: boolean
  error: string | null
  health: DashboardHealthData | null
  activity: DashboardActivityData | null
  feeding: FeedingMeal[]
  events: DashboardUpcomingEvent[]
  timeline: TimelineEntry[]
  insights: DashboardInsight[]
  actions: DashboardAction[]
}
```

- [ ] **Commit**

```bash
git add src/features/dashboard/types/dashboard.ts
git commit -m "feat(dashboard): add dashboard type definitions"
```

---

### Task 2: DashboardSection reusable container

**Files:**
- Create: `src/features/dashboard/components/DashboardSection.tsx`

- [ ] **Create the component**

This component handles all four states (loading/empty/error/data) and provides the horizontal scrolling wrapper.

```tsx
// src/features/dashboard/components/DashboardSection.tsx
import { type ReactNode } from 'react'
import { DynamicType } from '@/components/ui/DynamicType'
import { AppleCard } from '@/components/ui/AppleCard'
import { cn } from '@/utils/cn'
import { ChevronRight, AlertCircle, RefreshCw } from 'lucide-react'

interface DashboardSectionProps {
  title: string
  subtitle?: string
  action?: { label: string; onClick: () => void }
  loading?: boolean
  error?: string | null
  empty?: boolean
  emptyMessage?: string
  onRetry?: () => void
  children?: ReactNode
  className?: string
}

function SkeletonCard() {
  return (
    <div className="min-w-[140px] h-[120px] rounded-apple bg-apple-systemBackground animate-pulse p-4 shrink-0">
      <div className="h-3 rounded bg-apple-separator w-2/3 mb-3" />
      <div className="h-6 rounded bg-apple-separator w-1/2 mb-2" />
      <div className="h-3 rounded bg-apple-separator w-1/3" />
    </div>
  )
}

function ScrollIndicator({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex items-center justify-center gap-1.5 mt-3">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={cn(
            'w-1.5 h-1.5 rounded-full transition-all duration-300',
            i === current ? 'bg-apple-blue w-3' : 'bg-apple-separator'
          )}
        />
      ))}
    </div>
  )
}

export function DashboardSection({
  title,
  subtitle,
  action,
  loading = false,
  error = null,
  empty = false,
  emptyMessage,
  onRetry,
  children,
  className,
}: DashboardSectionProps) {
  return (
    <div className={cn('mb-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-baseline gap-2">
          <DynamicType styleLevel="title3" weight={600}>{title}</DynamicType>
          {subtitle && (
            <DynamicType styleLevel="caption1" className="text-apple-secondaryLabel">
              {subtitle}
            </DynamicType>
          )}
        </div>
        {action && (
          <button
            onClick={action.onClick}
            className="flex items-center gap-0.5 text-apple-blue text-apple-footnote hover:opacity-80 transition-opacity"
          >
            {action.label}
            <ChevronRight size={14} />
          </button>
        )}
      </div>

      {/* Content */}
      {error ? (
        <AppleCard padding="md" className="flex items-center gap-3">
          <AlertCircle size={20} className="text-apple-red shrink-0" />
          <div className="flex-1 min-w-0">
            <DynamicType styleLevel="footnote" weight={600}>Data load failed</DynamicType>
            <DynamicType styleLevel="caption2" className="text-apple-secondaryLabel">{error}</DynamicType>
          </div>
          {onRetry && (
            <button onClick={onRetry} className="p-1.5 rounded-full hover:bg-apple-separator transition-colors">
              <RefreshCw size={16} className="text-apple-blue" />
            </button>
          )}
        </AppleCard>
      ) : loading ? (
        <div className="flex gap-3 overflow-x-auto scrollbar-none snap-x snap-mandatory">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : empty ? (
        <AppleCard padding="md">
          <DynamicType styleLevel="caption1" className="text-apple-secondaryLabel text-center py-4">
            {emptyMessage ?? 'No data available'}
          </DynamicType>
        </AppleCard>
      ) : (
        <div className="flex gap-3 overflow-x-auto scrollbar-none snap-x snap-mandatory pb-1">
          {children}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Commit**

```bash
git add src/features/dashboard/components/DashboardSection.tsx
git commit -m "feat(dashboard): add reusable DashboardSection container with state handling"
```

---

### Task 3: Export mock data accessors from feature pages

**Files:**
- Modify: `src/features/health/HealthPage.tsx` (add exports)
- Modify: `src/features/activity/ActivityPage.tsx` (add exports)
- Modify: `src/features/feeding/FeedingPage.tsx` (add exports)
- Modify: `src/features/appointments/AppointmentsPage.tsx` (add exports)

- [ ] **Export mock functions from HealthPage**

Add `export` to the three mock wrapper functions (lines 76-78):

```typescript
// Before (lines 76-78):
const mockVaccinations = ...
const mockVisits = ...
const mockMedications = ...

// After:
export function mockVaccinations(petId: string): Vaccination[] { return perPetVaccinations[petId] ?? [] }
export function mockVisits(petId: string): VetVisit[] { return perPetVisits[petId] ?? [] }
export function mockMedications(petId: string): Medication[] { return perPetMedications[petId] ?? [] }
```

- [ ] **Export mock function from ActivityPage**

```typescript
// Before (line 16):
function mockActivity(_petId: string): ActivityRecord[] {

// After:
export function mockActivity(_petId: string): ActivityRecord[] {
```

Also export the `ActivityRecord` interface:
```typescript
export interface ActivityRecord { date: string; steps: number; distance: number; duration: number; calories: number }
```

- [ ] **Export mock functions from FeedingPage**

```typescript
// Before (line 15):
const schedules: Record<string, FeedingSchedule[]> = {

// After:
export const schedules: Record<string, FeedingSchedule[]> = {

// Before (line 23):
function mockFeedingRecords(petId: string): FeedingRecord[] {

// After:
export function mockFeedingRecords(petId: string): FeedingRecord[] {
```

Also export the `FeedingRecord` and `FeedingSchedule` interfaces:
```typescript
export interface FeedingRecord { id: string; petId: string; time: string; food: string; portion: string; notes?: string }
export interface FeedingSchedule { time: string; label: string }
```

- [ ] **Export mock function from AppointmentsPage**

```typescript
// Before (line 24):
function mockAppointments(petId: string): Appointment[] {

// After:
export function mockAppointments(petId: string): Appointment[] {
```

Also export the `Appointment` interface:
```typescript
export interface Appointment { id: string; petId: string; date: string; time: string; type: string; vet: string; notes?: string }
```

- [ ] **Commit**

```bash
git add src/features/health/HealthPage.tsx src/features/activity/ActivityPage.tsx src/features/feeding/FeedingPage.tsx src/features/appointments/AppointmentsPage.tsx
git commit -m "refactor: export mock data accessors for dashboard integration"
```

---

### Task 4: useDashboardData hook

**Files:**
- Create: `src/features/dashboard/hooks/useDashboardData.ts`

- [ ] **Create the hook**

This hook aggregates data from all feature mock sources and the pet context.

```typescript
// src/features/dashboard/hooks/useDashboardData.ts
import { useState, useEffect } from 'react'
import { usePets } from '@/store/pet-context'
import { mockVaccinations, mockVisits, mockMedications } from '@/features/health/HealthPage'
import { mockActivity } from '@/features/activity/ActivityPage'
import { schedules, mockFeedingRecords } from '@/features/feeding/FeedingPage'
import { mockAppointments } from '@/features/appointments/AppointmentsPage'
import { relativeTime } from '@/utils/date'
import type { DashboardData, DashboardHealthData, DashboardActivityData, FeedingMeal, DashboardUpcomingEvent, TimelineEntry, DashboardInsight, DashboardAction } from '@/features/dashboard/types/dashboard'

function computeHealthScore(petCount: number, upcomingCount: number, activeMedCount: number): { score: number; status: string } {
  if (petCount === 0) return { score: 0, status: 'No Data' }
  const deductions = upcomingCount * 5 + activeMedCount * 3
  const score = Math.max(0, Math.min(100, 95 - deductions))
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
  const diffDays = Math.round((target.getTime() - today.getTime()) / 86400000)
  if (diffDays <= 1) return 'tomorrow'
  if (diffDays <= 3) return 'within-3-days'
  if (diffDays <= 7) return 'next-week'
  return 'later'
}

function mockTimeline(pets: { id: string; name: string }[], feedingMeals: FeedingMeal[]): TimelineEntry[] {
  const entries: TimelineEntry[] = []
  const now = new Date()
  
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
        relativeTime: '2 hours ago',
        petName: pet.name,
      })
    }
  })

  // Add mock vaccination entries (just completed ones as recent activity)
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

  return entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10)
}

function computeInsights(pets: { id: string; name: string }[]): DashboardInsight[] {
  const insights: DashboardInsight[] = []
  
  pets.forEach(pet => {
    const records = mockActivity(pet.id)
    if (records.length >= 7) {
      const thisWeek = records.slice(-7).reduce((s, r) => s + r.steps, 0)
      const prevWeek = records.slice(-14, -7).reduce((s, r) => s + r.steps, 0)
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

  // Health tip for pets with upcoming vaccinations
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

        // Health
        const totalUpcoming = pets.reduce((sum, p) =>
          sum + mockVaccinations(p.id).filter(v => v.status === 'upcoming' || v.status === 'overdue').length, 0)
        const totalActiveMed = pets.reduce((sum, p) =>
          sum + mockMedications(p.id).filter(m => m.isActive).length, 0)
        const allVisits = pets.flatMap(p => mockVisits(p.id))
        const lastVisit = allVisits.length > 0
          ? allVisits.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
          : null
        const { score, status } = computeHealthScore(pets.length, totalUpcoming, totalActiveMed)
        const health: DashboardHealthData = {
          score, status,
          upcomingVaccinations: totalUpcoming,
          lastVisit: lastVisit ? { date: lastVisit.date, vetName: lastVisit.vetName } : null,
          activeMedications: totalActiveMed,
        }

        // Activity (first pet or aggregate)
        const firstPetId = pets[0]?.id ?? ''
        const activityRecords = firstPetId ? mockActivity(firstPetId) : []
        const todayRecord = activityRecords.length > 0 ? activityRecords[activityRecords.length - 1] : null
        const weekRecords = activityRecords.slice(-7)
        const weekAvg = weekRecords.length > 0
          ? Math.round(weekRecords.reduce((s, r) => s + r.steps, 0) / weekRecords.length)
          : 0
        const prevWeekRecords = activityRecords.slice(-14, -7)
        const prevWeekAvg = prevWeekRecords.length > 0
          ? Math.round(prevWeekRecords.reduce((s, r) => s + r.steps, 0) / prevWeekRecords.length)
          : 0
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

        // Feeding — aggregate across all pets
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
              status: isPast ? 'completed' : 'upcoming',
            }
          })
        }).sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())

        // Events — merge vaccinations + appointments
        const events: DashboardUpcomingEvent[] = [
          ...pets.flatMap(p =>
            mockVaccinations(p.id)
              .filter(v => v.status === 'upcoming' || v.status === 'overdue')
              .map(v => ({
                id: `ev-vacc-${v.id}`,
                title: `${p.name}: ${v.name}`,
                date: v.scheduledDate,
                time: undefined as string | undefined,
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

        // Timeline & Insights
        const timeline = mockTimeline(petList, feeding)
        const insights = computeInsights(petList)

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
          setData(prev => ({
            ...prev,
            loading: false,
            error: err instanceof Error ? err.message : 'Failed to load dashboard data',
          }))
        }
      }
    })
    return () => { cancelled = true }
  }, [pets])

  return data
}
```

- [ ] **Commit**

```bash
git add src/features/dashboard/hooks/useDashboardData.ts
git commit -m "feat(dashboard): add useDashboardData data aggregation hook"
```

---

### Task 5: QuickActionsSection

**Files:**
- Create: `src/features/dashboard/components/QuickActionsSection.tsx`

- [ ] **Create the component**

```tsx
// src/features/dashboard/components/QuickActionsSection.tsx
import { AppleCard } from '@/components/ui/AppleCard'
import { DynamicType } from '@/components/ui/DynamicType'
import type { DashboardAction } from '@/features/dashboard/types/dashboard'

interface QuickActionsSectionProps {
  actions: DashboardAction[]
  onAction: (action: DashboardAction) => void
}

export function QuickActionsSection({ actions, onAction }: QuickActionsSectionProps) {
  return (
    <div className="mb-6">
      <DynamicType styleLevel="title3" weight={600} className="mb-3 px-1">
        Quick Actions
      </DynamicType>
      <div className="flex gap-3 overflow-x-auto scrollbar-none snap-x snap-mandatory pb-1">
        {actions.map(action => (
          <button
            key={action.id}
            onClick={() => onAction(action)}
            className="snap-start shrink-0"
          >
            <AppleCard padding="md" hoverable className="flex items-center gap-2.5 min-w-[130px]">
              <span className="text-lg">{action.icon}</span>
              <DynamicType styleLevel="footnote" weight={600}>{action.label}</DynamicType>
            </AppleCard>
          </button>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Commit**

```bash
git add src/features/dashboard/components/QuickActionsSection.tsx
git commit -m "feat(dashboard): add QuickActionsSection component"
```

---

### Task 6: HealthSummarySection

**Files:**
- Create: `src/features/dashboard/components/HealthSummarySection.tsx`

- [ ] **Create the component**

```tsx
// src/features/dashboard/components/HealthSummarySection.tsx
import { AppleCard } from '@/components/ui/AppleCard'
import { AppleProgressRing } from '@/components/ui/AppleProgressRing'
import { AppleBadge } from '@/components/ui/AppleBadge'
import { DynamicType } from '@/components/ui/DynamicType'
import { Syringe, Stethoscope, Pill } from 'lucide-react'
import type { DashboardHealthData } from '@/features/dashboard/types/dashboard'

interface HealthSummarySectionProps {
  data: DashboardHealthData | null
}

export function HealthSummarySection({ data }: HealthSummarySectionProps) {
  if (!data) return null

  const statusColor = data.status === 'Excellent' ? 'var(--apple-green)' as const
    : data.status === 'Good' ? 'var(--apple-blue)' as const
    : data.status === 'Fair' ? 'var(--apple-orange)' as const
    : 'var(--apple-red)' as const

  return (
    <>
      <AppleCard padding="md" hoverable className="snap-start shrink-0 w-[160px]">
        <AppleProgressRing progress={data.score / 100} size={64} strokeWidth={5} color={statusColor}>
          <DynamicType styleLevel="footnote" weight={700} className="text-center">{data.score}%</DynamicType>
        </AppleProgressRing>
        <DynamicType styleLevel="caption1" className="text-center mt-2">Health Score</DynamicType>
        <DynamicType styleLevel="caption2" className="text-center" style={{ color: statusColor }}>
          {data.status}
        </DynamicType>
      </AppleCard>

      <AppleCard padding="md" hoverable className="snap-start shrink-0 w-[140px] flex flex-col items-center justify-center">
        <Syringe size={22} className="text-apple-blue mb-1" />
        <DynamicType styleLevel="title2" weight={700}>{data.upcomingVaccinations}</DynamicType>
        <DynamicType styleLevel="caption2" className="text-center">Vaccinations due</DynamicType>
        {data.upcomingVaccinations > 0 && (
          <AppleBadge count={data.upcomingVaccinations} variant="orange" />
        )}
      </AppleCard>

      {data.lastVisit && (
        <AppleCard padding="md" hoverable className="snap-start shrink-0 w-[160px] flex flex-col items-center justify-center">
          <Stethoscope size={22} className="text-apple-purple mb-1" />
          <DynamicType styleLevel="caption1" weight={600}>{data.lastVisit.date}</DynamicType>
          <DynamicType styleLevel="caption2">{data.lastVisit.vetName}</DynamicType>
          <DynamicType styleLevel="caption2" className="text-apple-secondaryLabel">Last visit</DynamicType>
        </AppleCard>
      )}

      <AppleCard padding="md" hoverable className="snap-start shrink-0 w-[140px] flex flex-col items-center justify-center">
        <Pill size={22} className="text-apple-orange mb-1" />
        <DynamicType styleLevel="title2" weight={700}>{data.activeMedications}</DynamicType>
        <DynamicType styleLevel="caption2" className="text-center">Active medications</DynamicType>
      </AppleCard>
    </>
  )
}
```

- [ ] **Commit**

```bash
git add src/features/dashboard/components/HealthSummarySection.tsx
git commit -m "feat(dashboard): add HealthSummarySection component"
```

---

### Task 7: ActivitySummarySection

**Files:**
- Create: `src/features/dashboard/components/ActivitySummarySection.tsx`

- [ ] **Create the component**

```tsx
// src/features/dashboard/components/ActivitySummarySection.tsx
import { AppleCard } from '@/components/ui/AppleCard'
import { DynamicType } from '@/components/ui/DynamicType'
import { Footprints, Flame, Timer, TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { DashboardActivityData } from '@/features/dashboard/types/dashboard'

interface ActivitySummarySectionProps {
  data: DashboardActivityData | null
}

const statConfig = [
  { key: 'steps', icon: Footprints, color: 'bg-apple-blue/10 text-apple-blue', suffix: '', decimals: 0 },
  { key: 'distance', icon: TrendingUp, color: 'bg-apple-green/10 text-apple-green', suffix: 'km', decimals: 1 },
  { key: 'duration', icon: Timer, color: 'bg-apple-orange/10 text-apple-orange', suffix: 'min', decimals: 0 },
  { key: 'calories', icon: Flame, color: 'bg-apple-red/10 text-apple-red', suffix: 'cal', decimals: 0 },
] as const

export function ActivitySummarySection({ data }: ActivitySummarySectionProps) {
  if (!data) return null

  const values: Record<string, string> = {
    steps: data.steps.toLocaleString(),
    distance: data.distance.toFixed(1),
    duration: data.duration.toString(),
    calories: data.calories.toString(),
  }

  return (
    <>
      {statConfig.map(({ key, icon: Icon, color, suffix, decimals }) => (
        <AppleCard key={key} padding="md" hoverable className="snap-start shrink-0 min-w-[130px]">
          <div className="flex items-center gap-3">
            <div className={cn('w-9 h-9 rounded-full flex items-center justify-center shrink-0', color)}>
              <Icon size={16} />
            </div>
            <div className="min-w-0">
              <DynamicType styleLevel="caption2" className="text-apple-secondaryLabel capitalize">{key}</DynamicType>
              <div className="flex items-baseline gap-1">
                <DynamicType styleLevel="title3" weight={700}>{values[key]}</DynamicType>
                <DynamicType styleLevel="caption2" className="text-apple-secondaryLabel">{suffix}</DynamicType>
              </div>
            </div>
          </div>
        </AppleCard>
      ))}
      {/* Trend card */}
      <AppleCard padding="md" hoverable className="snap-start shrink-0 min-w-[130px] flex items-center gap-2">
        {data.trendDirection === 'up'
          ? <TrendingUp size={20} className="text-apple-green" />
          : <TrendingDown size={20} className="text-apple-red" />
        }
        <div>
          <DynamicType styleLevel="caption2" className="text-apple-secondaryLabel">Weekly trend</DynamicType>
          <DynamicType styleLevel="title3" weight={700}>
            {data.trendDirection === 'up' ? '+' : '-'}{data.trendPercent}%
          </DynamicType>
        </div>
      </AppleCard>
    </>
  )
}
```

- [ ] **Commit**

```bash
git add src/features/dashboard/components/ActivitySummarySection.tsx
git commit -m "feat(dashboard): add ActivitySummarySection component"
```

---

### Task 8: FeedingScheduleSection

**Files:**
- Create: `src/features/dashboard/components/FeedingScheduleSection.tsx`

- [ ] **Create the component**

```tsx
// src/features/dashboard/components/FeedingScheduleSection.tsx
import { AppleCard } from '@/components/ui/AppleCard'
import { DynamicType } from '@/components/ui/DynamicType'
import { cn } from '@/utils/cn'
import { Check, Clock } from 'lucide-react'
import type { FeedingMeal } from '@/features/dashboard/types/dashboard'

interface FeedingScheduleSectionProps {
  meals: FeedingMeal[]
}

function getTimeRemaining(timeStr: string): string {
  const mealTime = new Date(timeStr)
  const now = new Date()
  const diffMs = mealTime.getTime() - now.getTime()
  if (diffMs <= 0) return ''
  const hours = Math.floor(diffMs / 3600000)
  const minutes = Math.floor((diffMs % 3600000) / 60000)
  if (hours > 0) return `${hours}h ${minutes}m left`
  return `${minutes}m left`
}

export function FeedingScheduleSection({ meals }: FeedingScheduleSectionProps) {
  if (meals.length === 0) return null

  return (
    <>
      {meals.map(meal => {
        const isUpcoming = meal.status === 'upcoming'
        const isCompleted = meal.status === 'completed'
        const timeRemaining = isUpcoming ? getTimeRemaining(meal.time) : ''

        return (
          <AppleCard
            key={meal.id}
            padding="md"
            hoverable
            className={cn(
              'snap-start shrink-0 min-w-[180px]',
              isUpcoming && !timeRemaining && 'opacity-60',
              isUpcoming && timeRemaining && 'ring-2 ring-apple-blue'
            )}
          >
            <div className="flex items-center gap-2 mb-1">
              {isCompleted ? (
                <span className="w-5 h-5 rounded-full bg-apple-green/20 flex items-center justify-center">
                  <Check size={12} className="text-apple-green" />
                </span>
              ) : (
                <Clock size={14} className={cn(isUpcoming && timeRemaining ? 'text-apple-blue' : 'text-apple-secondaryLabel')} />
              )}
              <DynamicType styleLevel="caption2" className={cn(isCompleted ? 'text-apple-green' : 'text-apple-secondaryLabel')}>
                {isCompleted ? 'Completed' : isUpcoming && timeRemaining ? 'Next meal' : 'Pending'}
              </DynamicType>
            </div>
            <DynamicType styleLevel="footnote" weight={600}>{meal.label}</DynamicType>
            <DynamicType styleLevel="caption2" className="block text-apple-secondaryLabel">{meal.petName}</DynamicType>
            <DynamicType styleLevel="caption2" className="block text-apple-secondaryLabel">{meal.food}</DynamicType>
            <div className="flex items-center justify-between mt-1">
              <DynamicType styleLevel="caption2" className="text-apple-secondaryLabel">{meal.portion}</DynamicType>
              {timeRemaining && (
                <DynamicType styleLevel="caption2" className="text-apple-blue font-medium">{timeRemaining}</DynamicType>
              )}
            </div>
          </AppleCard>
        )
      })}
    </>
  )
}
```

- [ ] **Commit**

```bash
git add src/features/dashboard/components/FeedingScheduleSection.tsx
git commit -m "feat(dashboard): add FeedingScheduleSection component"
```

---

### Task 9: UpcomingEventsSection

**Files:**
- Create: `src/features/dashboard/components/UpcomingEventsSection.tsx`

- [ ] **Create the component**

```tsx
// src/features/dashboard/components/UpcomingEventsSection.tsx
import { AppleCard } from '@/components/ui/AppleCard'
import { DynamicType } from '@/components/ui/DynamicType'
import { cn } from '@/utils/cn'
import { Syringe, Stethoscope, Calendar } from 'lucide-react'
import type { DashboardUpcomingEvent } from '@/features/dashboard/types/dashboard'

interface UpcomingEventsSectionProps {
  events: DashboardUpcomingEvent[]
}

const urgencyConfig: Record<string, { label: string; color: string }> = {
  tomorrow: { label: 'Tomorrow', color: 'bg-apple-blue text-white' },
  'within-3-days': { label: 'In 3 days', color: 'bg-apple-orange text-white' },
  'next-week': { label: 'Next week', color: 'bg-apple-green text-white' },
  later: { label: 'Later', color: 'bg-apple-separator text-apple-secondaryLabel' },
}

const typeIcon: Record<string, React.ReactNode> = {
  vaccination: <Syringe size={14} className="text-apple-blue" />,
  appointment: <Stethoscope size={14} className="text-apple-purple" />,
  visit: <Calendar size={14} className="text-apple-teal" />,
}

export function UpcomingEventsSection({ events }: UpcomingEventsSectionProps) {
  if (events.length === 0) return null

  return (
    <>
      {events.map(event => {
        const urgency = urgencyConfig[event.urgency] ?? urgencyConfig.later
        return (
          <AppleCard key={event.id} padding="md" hoverable className="snap-start shrink-0 min-w-[220px]">
            <span className={cn('inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full mb-2', urgency.color)}>
              {urgency.label}
            </span>
            <div className="flex items-center gap-1.5 mb-1">
              {typeIcon[event.type] ?? null}
              <DynamicType styleLevel="footnote" weight={600}>{event.title}</DynamicType>
            </div>
            <DynamicType styleLevel="caption2" className="block text-apple-secondaryLabel">
              {event.date}{event.time ? ` · ${event.time}` : ''}
            </DynamicType>
            <DynamicType styleLevel="caption2" className="text-apple-secondaryLabel">{event.petName}</DynamicType>
          </AppleCard>
        )
      })}
    </>
  )
}
```

- [ ] **Commit**

```bash
git add src/features/dashboard/components/UpcomingEventsSection.tsx
git commit -m "feat(dashboard): add UpcomingEventsSection component"
```

---

### Task 10: RecentActivitySection

**Files:**
- Create: `src/features/dashboard/components/RecentActivitySection.tsx`

- [ ] **Create the component**

```tsx
// src/features/dashboard/components/RecentActivitySection.tsx
import { AppleCard } from '@/components/ui/AppleCard'
import { DynamicType } from '@/components/ui/DynamicType'
import { cn } from '@/utils/cn'
import { Syringe, Utensils, Footprints, Calendar, Stethoscope } from 'lucide-react'
import type { TimelineEntry } from '@/features/dashboard/types/dashboard'

interface RecentActivitySectionProps {
  entries: TimelineEntry[]
}

const typeStyle: Record<string, { icon: React.ReactNode; bg: string }> = {
  vaccination: { icon: <Syringe size={14} />, bg: 'bg-blue-100 dark:bg-blue-900/30 text-apple-blue' },
  feeding: { icon: <Utensils size={14} />, bg: 'bg-amber-100 dark:bg-amber-900/30 text-apple-orange' },
  activity: { icon: <Footprints size={14} />, bg: 'bg-green-100 dark:bg-green-900/30 text-apple-green' },
  appointment: { icon: <Calendar size={14} />, bg: 'bg-purple-100 dark:bg-purple-900/30 text-apple-purple' },
  visit: { icon: <Stethoscope size={14} />, bg: 'bg-rose-100 dark:bg-rose-900/30 text-apple-red' },
}

export function RecentActivitySection({ entries }: RecentActivitySectionProps) {
  if (entries.length === 0) return null

  return (
    <>
      {entries.map(entry => {
        const style = typeStyle[entry.type] ?? typeStyle.visit
        return (
          <AppleCard key={entry.id} padding="md" hoverable className="snap-start shrink-0 min-w-[240px]">
            <div className="flex items-start gap-3">
              <div className={cn('w-8 h-8 rounded-full flex items-center justify-center shrink-0', style.bg)}>
                {style.icon}
              </div>
              <div className="min-w-0">
                <DynamicType styleLevel="footnote" weight={600}>{entry.description}</DynamicType>
                <DynamicType styleLevel="caption2" className="block text-apple-secondaryLabel">{entry.detail}</DynamicType>
                <DynamicType styleLevel="caption2" className="block text-apple-tertiaryLabel">{entry.relativeTime}</DynamicType>
              </div>
            </div>
          </AppleCard>
        )
      })}
    </>
  )
}
```

- [ ] **Commit**

```bash
git add src/features/dashboard/components/RecentActivitySection.tsx
git commit -m "feat(dashboard): add RecentActivitySection component"
```

---

### Task 11: InsightsSection

**Files:**
- Create: `src/features/dashboard/components/InsightsSection.tsx`

- [ ] **Create the component**

```tsx
// src/features/dashboard/components/InsightsSection.tsx
import { AppleCard } from '@/components/ui/AppleCard'
import { DynamicType } from '@/components/ui/DynamicType'
import { TrendingUp, Lightbulb, BarChart3 } from 'lucide-react'
import type { DashboardInsight } from '@/features/dashboard/types/dashboard'

interface InsightsSectionProps {
  insights: DashboardInsight[]
}

const insightMeta: Record<string, { icon: React.ReactNode; label: string }> = {
  trend: { icon: <TrendingUp size={16} />, label: 'Trend' },
  tip: { icon: <Lightbulb size={16} />, label: 'Tip' },
  comparison: { icon: <BarChart3 size={16} />, label: 'Comparison' },
}

function MiniBarChart({ data }: { data: number[] }) {
  const max = Math.max(...data, 1)
  return (
    <div className="flex items-end gap-[3px] h-10 mt-2">
      {data.map((val, i) => (
        <div
          key={i}
          className="flex-1 rounded-t-sm bg-apple-blue/60"
          style={{ height: `${(val / max) * 100}%` }}
        />
      ))}
    </div>
  )
}

export function InsightsSection({ insights }: InsightsSectionProps) {
  if (insights.length === 0) return null

  return (
    <>
      {insights.map(insight => {
        const meta = insightMeta[insight.type] ?? insightMeta.tip
        return (
          <AppleCard key={insight.id} padding="md" hoverable className="snap-start shrink-0 min-w-[180px]">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-apple-blue">{meta.icon}</span>
              <DynamicType styleLevel="caption2" className="text-apple-secondaryLabel">{meta.label}</DynamicType>
            </div>
            <DynamicType styleLevel="footnote" weight={600}>{insight.title}</DynamicType>
            <DynamicType styleLevel="caption2" className="block text-apple-secondaryLabel mt-0.5">
              {insight.description}
            </DynamicType>
            {insight.trendData && insight.trendData.length > 0 && (
              <MiniBarChart data={insight.trendData} />
            )}
          </AppleCard>
        )
      })}
    </>
  )
}
```

- [ ] **Commit**

```bash
git add src/features/dashboard/components/InsightsSection.tsx
git commit -m "feat(dashboard): add InsightsSection component"
```

---

### Task 12: DashboardPage — orchestrate all sections

**Files:**
- Create: `src/features/dashboard/DashboardPage.tsx`

- [ ] **Create the page component**

This assembles all 7 sections using `DashboardSection` wrapper and the `useDashboardData` hook.

```tsx
// src/features/dashboard/DashboardPage.tsx
import { usePets } from '@/store/pet-context'
import { DashboardSection } from '@/features/dashboard/components/DashboardSection'
import { HealthSummarySection } from '@/features/dashboard/components/HealthSummarySection'
import { ActivitySummarySection } from '@/features/dashboard/components/ActivitySummarySection'
import { FeedingScheduleSection } from '@/features/dashboard/components/FeedingScheduleSection'
import { UpcomingEventsSection } from '@/features/dashboard/components/UpcomingEventsSection'
import { RecentActivitySection } from '@/features/dashboard/components/RecentActivitySection'
import { InsightsSection } from '@/features/dashboard/components/InsightsSection'
import { QuickActionsSection } from '@/features/dashboard/components/QuickActionsSection'
import { useDashboardData } from '@/features/dashboard/hooks/useDashboardData'
import type { DashboardAction } from '@/features/dashboard/types/dashboard'

interface DashboardPageProps {
  onNavigate: (page: string) => void
}

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { pets } = usePets()
  const data = useDashboardData()

  const handleAction = (action: DashboardAction) => {
    onNavigate(action.navigateTo.page)
  }

  return (
    <div>
      {/* Quick Actions (no loading/empty/error wrapper — always shown) */}
      <QuickActionsSection actions={data.actions} onAction={handleAction} />

      {/* Health Overview */}
      <DashboardSection
        title="Health Overview"
        subtitle={pets.length > 0 ? `${pets.length} pet${pets.length > 1 ? 's' : ''}` : undefined}
        action={{ label: 'View All', onClick: () => onNavigate('health') }}
        loading={data.loading}
        error={data.error}
        empty={!data.health}
        emptyMessage="Add health records to see an overview"
        onRetry={() => window.location.reload()}
      >
        {data.health && <HealthSummarySection data={data.health} />}
      </DashboardSection>

      {/* Activity Summary */}
      <DashboardSection
        title="Activity"
        action={{ label: 'View All', onClick: () => onNavigate('activity') }}
        loading={data.loading}
        empty={!data.activity || data.activity.steps === 0}
        emptyMessage="No activity data yet — take your pet for a walk!"
      >
        {data.activity && <ActivitySummarySection data={data.activity} />}
      </DashboardSection>

      {/* Feeding Schedule */}
      <DashboardSection
        title="Feeding Schedule"
        action={{ label: 'View All', onClick: () => onNavigate('feeding') }}
        loading={data.loading}
        empty={data.feeding.length === 0}
        emptyMessage="No feeding schedule set up"
      >
        <FeedingScheduleSection meals={data.feeding} />
      </DashboardSection>

      {/* Upcoming Events */}
      <DashboardSection
        title="Upcoming Events"
        action={{ label: 'View All', onClick: () => onNavigate('appointments') }}
        loading={data.loading}
        empty={data.events.length === 0}
        emptyMessage="No upcoming appointments or vaccinations"
      >
        <UpcomingEventsSection events={data.events} />
      </DashboardSection>

      {/* Recent Activity */}
      <DashboardSection
        title="Recent Activity"
        loading={data.loading}
        empty={data.timeline.length === 0}
        emptyMessage="No recent activity to show"
      >
        <RecentActivitySection entries={data.timeline} />
      </DashboardSection>

      {/* Insights */}
      <DashboardSection
        title="Insights"
        loading={data.loading}
        empty={data.insights.length === 0}
        emptyMessage="Check back later for data insights"
      >
        <InsightsSection insights={data.insights} />
      </DashboardSection>
    </div>
  )
}
```

- [ ] **Commit**

```bash
git add src/features/dashboard/DashboardPage.tsx
git commit -m "feat(dashboard): add DashboardPage orchestrating all sections"
```

---

### Task 13: App.tsx — replace inline dashboard with DashboardPage

**Files:**
- Modify: `src/App.tsx`

- [ ] **Update imports**

Remove unused imports and add DashboardPage:

```typescript
// Remove these imports (lines 12-25):
import { GlassPanel } from '@/components/ui/GlassPanel'
import { AppleCard } from '@/components/ui/AppleCard'
import { AppleButton } from '@/components/ui/AppleButton'
import { AppleSwitch } from '@/components/ui/AppleSwitch'
import { AppleAvatar } from '@/components/ui/AppleAvatar'
import { AppleBadge } from '@/components/ui/AppleBadge'
import { AppleSegmentedControl } from '@/components/ui/AppleSegmentedControl'
import { AppleProgressRing } from '@/components/ui/AppleProgressRing'
import { AppleTable, type TableColumn } from '@/components/ui/AppleTable'
import { DynamicType } from '@/components/ui/DynamicType'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { ContextMenu } from '@/components/common/ContextMenu'
import { Plus, Dog, Eye, Edit3, LayoutDashboard, PawPrint, Heart, Activity, UtensilsCrossed, Calendar, Settings } from 'lucide-react'

// Add after line 10 (AppointmentsPage import):
import { DashboardPage } from '@/features/dashboard/DashboardPage'

// Replace lucide-react import with minimal set:
import { LayoutDashboard, PawPrint, Heart, Activity, UtensilsCrossed, Calendar, Settings } from 'lucide-react'
```

- [ ] **Remove demo data and unused state**

```typescript
// Remove lines 41-58 (PetRow interface, petData, petColumns)

// Remove line 64: const [dashboardSegment, setDashboardSegment] = useState('all')
// Remove line 65: const [switchOn, setSwitchOn] = useState(false)

// Remove line 69: const filteredPetData = ...

// Replace the dashboard content (lines 86-177) with:
{page.page === 'dashboard' && (
  <DashboardPage onNavigate={(navPage) => {
    setCurrentNav(navPage)
    setPage({ page: navPage as any })
  }} />
)}
```

The final App.tsx should look like this:

```tsx
import { useState } from 'react'
import { usePets } from '@/store/pet-context'
import { RootLayout } from '@/layouts/RootLayout'
import { PetListPage } from '@/features/pets/PetListPage'
import { PetDetailPage } from '@/features/pets/PetDetailPage'
import { PetFormPage } from '@/features/pets/PetFormPage'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { HealthPage } from '@/features/health/HealthPage'
import { ActivityPage } from '@/features/activity/ActivityPage'
import { FeedingPage } from '@/features/feeding/FeedingPage'
import { AppointmentsPage } from '@/features/appointments/AppointmentsPage'
import { SettingsPage } from '@/features/settings/SettingsPage'
import { LayoutDashboard, PawPrint, Heart, Activity, UtensilsCrossed, Calendar, Settings } from 'lucide-react'
import type { NavItem } from '@/components/ui/AppleSidebar'

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'pets', label: 'Pets', icon: PawPrint },
  { id: 'health', label: 'Health', icon: Heart },
  { id: 'activity', label: 'Activity', icon: Activity },
  { id: 'feeding', label: 'Feeding', icon: UtensilsCrossed },
  { id: 'appointments', label: 'Appointments', icon: Calendar },
  { id: 'settings', label: 'Settings', icon: Settings },
]

type PetPageContext = { page: 'pets' } | { page: 'pet-detail'; petId: string } | { page: 'pet-form'; petId?: string } | { page: 'dashboard' } | { page: 'health' } | { page: 'activity' } | { page: 'feeding' } | { page: 'appointments' } | { page: 'settings' }

export default function App() {
  const { getPet } = usePets()
  const [currentNav, setCurrentNav] = useState('dashboard')
  const [page, setPage] = useState<PetPageContext>({ page: 'dashboard' })

  const editingPet = page.page === 'pet-form' && page.petId ? getPet(page.petId) : undefined

  const navigateTo = (navId: string) => {
    setCurrentNav(navId)
    if (navId === 'pets') setPage({ page: 'pets' })
    else setPage({ page: navId as any })
  }

  const pageTitle = page.page === 'dashboard' ? 'Welcome back 👋' : ''

  return (
    <RootLayout
        navItems={navItems}
        activeItem={currentNav}
        pageTitle={pageTitle}
        onNavigate={navigateTo}
      >
        {page.page === 'dashboard' && (
          <DashboardPage onNavigate={(navPage) => {
            setCurrentNav(navPage)
            setPage({ page: navPage as any })
          }} />
        )}

        {page.page === 'pets' && (
          <PetListPage
            onSelect={(id) => setPage({ page: 'pet-detail', petId: id })}
            onAdd={() => setPage({ page: 'pet-form' })}
          />
        )}

        {page.page === 'pet-detail' && (
          <PetDetailPage
            petId={page.petId}
            onBack={() => setPage({ page: 'pets' })}
            onEdit={(id) => setPage({ page: 'pet-form', petId: id })}
          />
        )}

        {page.page === 'pet-form' && (
          <PetFormPage
            pet={editingPet}
            onBack={() => setPage({ page: 'pets' })}
            onSaved={() => setPage({ page: 'pets' })}
          />
        )}

        {page.page === 'health' && <HealthPage />}
        {page.page === 'activity' && <ActivityPage />}
        {page.page === 'feeding' && <FeedingPage />}
        {page.page === 'appointments' && <AppointmentsPage />}
        {page.page === 'settings' && <SettingsPage />}
    </RootLayout>
  )
}
```

- [ ] **Commit**

```bash
git add src/App.tsx
git commit -m "refactor: replace inline dashboard with DashboardPage component"
```

---

### Task 14: Verify build

**Files:**
- Verify: `npm run build`

- [ ] **Run TypeScript check**

```bash
npx tsc --noEmit
```
Expected: No type errors.

- [ ] **Run full build**

```bash
npm run build
```
Expected: `tsc -b && vite build` completes with no errors.

- [ ] **If type errors occur**, check:
  - The `DashboardSection` import path is correct
  - All exports from feature pages match the expected function signatures
  - All `DashboardData` fields are properly typed in each section component
  - The `DashboardAction.navigateTo.page` type matches the `PetPageContext` union

- [ ] **Commit any build fixes**

```bash
git add -A
git commit -m "fix: resolve type errors after dashboard refactor"
```

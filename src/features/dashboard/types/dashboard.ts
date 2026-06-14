// src/features/dashboard/types/dashboard.ts
export type DashboardHealthStatus = 'Excellent' | 'Good' | 'Fair' | 'Attention' | 'No Data'
export type DashboardPageName = 'dashboard' | 'pets' | 'health' | 'activity' | 'feeding' | 'appointments' | 'settings' | 'pet-form'

export interface DashboardHealthData {
  score: number
  status: DashboardHealthStatus
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
  navigateTo: { page: DashboardPageName }
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

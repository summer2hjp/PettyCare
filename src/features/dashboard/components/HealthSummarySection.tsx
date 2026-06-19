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

  const statusColor = data.status === 'Excellent' ? '#34C759'
    : data.status === 'Good' ? '#3b82f6'
    : data.status === 'Fair' ? '#FF9500'
    : '#FF3B30'

  return (
    <>
      <AppleCard padding="md" hoverable className="snap-start shrink-0 w-[160px]">
        <AppleProgressRing progress={data.score / 100} size={64} strokeWidth={5} color={statusColor}>
          <DynamicType styleLevel="button" weight={700} className="text-center">{data.score}%</DynamicType>
        </AppleProgressRing>
        <DynamicType styleLevel="caption" className="text-center mt-2">Health Score</DynamicType>
        <DynamicType styleLevel="small" className="text-center" style={{ color: statusColor }}>
          {data.status}
        </DynamicType>
      </AppleCard>

      <AppleCard padding="md" hoverable className="snap-start shrink-0 w-[140px] flex flex-col items-center justify-center">
        <Syringe size={22} className="text-[var(--mm-link)] mb-1" />
        <DynamicType styleLevel="title2" weight={700}>{data.upcomingVaccinations}</DynamicType>
        <DynamicType styleLevel="small" className="text-center">Vaccinations due</DynamicType>
        {data.upcomingVaccinations > 0 && (
          <AppleBadge count={data.upcomingVaccinations} variant="orange" />
        )}
      </AppleCard>

      {data.lastVisit && (
        <AppleCard padding="md" hoverable className="snap-start shrink-0 w-[160px] flex flex-col items-center justify-center">
          <Stethoscope size={22} className="text-[#AF52DE] mb-1" />
          <DynamicType styleLevel="caption" weight={600}>{data.lastVisit.date}</DynamicType>
          <DynamicType styleLevel="small">{data.lastVisit.vetName}</DynamicType>
          <DynamicType styleLevel="small" className="text-[var(--mm-secondaryLabel)]">Last visit</DynamicType>
        </AppleCard>
      )}

      <AppleCard padding="md" hoverable className="snap-start shrink-0 w-[140px] flex flex-col items-center justify-center">
        <Pill size={22} className="text-[#FF9500] mb-1" />
        <DynamicType styleLevel="title2" weight={700}>{data.activeMedications}</DynamicType>
        <DynamicType styleLevel="small" className="text-center">Active medications</DynamicType>
      </AppleCard>
    </>
  )
}

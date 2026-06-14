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

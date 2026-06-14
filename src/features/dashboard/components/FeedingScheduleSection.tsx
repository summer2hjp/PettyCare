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

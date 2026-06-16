import { useState } from 'react'
import { cn } from '@/utils/cn'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { DynamicType } from '@/components/ui/DynamicType'
import { Heart, Footprints, TrendingUp, TrendingDown } from 'lucide-react'
import type { Pet } from '@/types/pet'
import type { DashboardHealthData, DashboardActivityData } from '@/features/dashboard/types/dashboard'

interface PetHeroCardProps {
  pet: Pet
  health: DashboardHealthData | null
  activity: DashboardActivityData | null
  loading?: boolean
}

function getAge(birthDate: string): string {
  const now = new Date()
  const birth = new Date(birthDate)
  const years = now.getFullYear() - birth.getFullYear()
  const months = now.getMonth() - birth.getMonth()
  if (years > 0) return `${years}岁${months > 0 ? `${months}个月` : ''}`
  return `${months + 12}个月`
}

function SkeletonHero() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
      {[1, 2, 3].map(i => (
        <GlassPanel key={i} intensity="light" className="p-5 animate-pulse">
          <div className="w-full h-full space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20" />
            <div className="h-4 w-2/3 bg-white/20 rounded" />
            <div className="h-3 w-1/2 bg-white/20 rounded" />
          </div>
        </GlassPanel>
      ))}
    </div>
  )
}

export function PetHeroCard({ pet, health, activity, loading }: PetHeroCardProps) {
  if (loading) return <SkeletonHero />

  const speciesEmoji: Record<string, string> = {
    dog: '🐕', cat: '🐱', bird: '🐦', fish: '🐟', rabbit: '🐰', hamster: '🐹', other: '🐾',
  }

  const healthScoreColor = !health ? 'text-white/40' :
    health.score >= 80 ? 'text-green-400' :
    health.score >= 60 ? 'text-yellow-400' :
    'text-red-400'

  // Progress ring SVG
  const score = health?.score ?? 0
  const circumference = 2 * Math.PI * 28
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
      {/* Pet Profile Card */}
      <GlassPanel intensity="medium" className="relative overflow-hidden p-0" as="div">
        <div className="aspect-[16/9] relative bg-gradient-to-br from-white/10 to-white/5">
          {pet.avatarUrl ? (
            <img
              src={`/picture/${pet.avatarUrl}`}
              alt={pet.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fall back to local image, then emoji
                (e.target as HTMLImageElement).src = `/picture/${pet.name.toLowerCase()}-1.jpeg`
                e.target.onerror = () => {
                  (e.target as HTMLImageElement).style.display = 'none'
                }
              }}
            />
          ) : (
            <LocalPetImage pet={pet} speciesEmoji={speciesEmoji[pet.species] ?? '🐾'} />
          )}
          {/* Glass overlay with pet info */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent p-4">
            <DynamicType styleLevel="title2" weight={700} className="text-white">
              {pet.name}
            </DynamicType>
            <div className="flex items-center gap-2 mt-1">
              <DynamicType styleLevel="footnote" className="text-white/80">
                {speciesEmoji[pet.species] ?? ''} {pet.species} · {pet.breed}
              </DynamicType>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <DynamicType styleLevel="caption2" className="text-white/60">
                {getAge(pet.birthDate)} · {pet.weight}{pet.weightUnit}
              </DynamicType>
            </div>
          </div>
        </div>
      </GlassPanel>

      {/* Health Score Card */}
      <GlassPanel intensity="light" className="p-5 flex flex-col items-center justify-center" as="div">
        <div className="flex items-center gap-2 mb-3">
          <Heart size={16} className="text-apple-red" />
          <DynamicType styleLevel="footnote" weight={600}>健康评分</DynamicType>
        </div>
        <div className="relative w-[64px] h-[64px] mb-2">
          <svg width="64" height="64" viewBox="0 0 64 64" className="transform -rotate-90">
            <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
            <circle
              cx="32" cy="32" r="28"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className={healthScoreColor}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <DynamicType styleLevel="title2" weight={700} className={healthScoreColor}>
              {health?.score ?? '--'}
            </DynamicType>
          </div>
        </div>
        <DynamicType styleLevel="footnote" weight={600} className={healthScoreColor}>
          {health?.status ?? 'No Data'}
        </DynamicType>
        {health && (
          <div className="flex items-center gap-3 mt-2 text-[11px] text-white/50">
            <span>💉 {health.upcomingVaccinations} pending</span>
            <span>💊 {health.activeMedications} active</span>
          </div>
        )}
      </GlassPanel>

      {/* Activity Card */}
      <GlassPanel intensity="light" className="p-5" as="div">
        <div className="flex items-center gap-2 mb-3">
          <Footprints size={16} />
          <DynamicType styleLevel="footnote" weight={600}>今日活动</DynamicType>
        </div>
        {activity ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <DynamicType styleLevel="caption2" className="text-white/60">步数</DynamicType>
              <DynamicType styleLevel="body" weight={600}>
                {activity.steps.toLocaleString()}
              </DynamicType>
            </div>
            <div className="flex items-center justify-between">
              <DynamicType styleLevel="caption2" className="text-white/60">距离</DynamicType>
              <DynamicType styleLevel="body" weight={600}>
                {activity.distance}km
              </DynamicType>
            </div>
            <div className="flex items-center justify-between">
              <DynamicType styleLevel="caption2" className="text-white/60">消耗</DynamicType>
              <DynamicType styleLevel="body" weight={600}>
                {activity.calories}cal
              </DynamicType>
            </div>
            {activity.weeklyAvg > 0 && (
              <div className="flex items-center justify-between pt-1 border-t border-white/10">
                <DynamicType styleLevel="caption2" className="text-white/60">周均</DynamicType>
                <div className="flex items-center gap-1">
                  <DynamicType styleLevel="footnote" weight={600}>
                    {activity.weeklyAvg.toLocaleString()}
                  </DynamicType>
                  {activity.trendDirection === 'up' ? (
                    <TrendingUp size={14} className="text-green-400" />
                  ) : (
                    <TrendingDown size={14} className="text-red-400" />
                  )}
                  <DynamicType styleLevel="caption2" className={cn(
                    activity.trendDirection === 'up' ? 'text-green-400' : 'text-red-400'
                  )}>
                    {activity.trendPercent}%
                  </DynamicType>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-[100px]">
            <DynamicType styleLevel="caption1" className="text-white/40">
              暂无活动数据
            </DynamicType>
          </div>
        )}
      </GlassPanel>
    </div>
  )
}

/** Tries to load public/picture/{petName}-1.jpeg, falls back to species emoji */
function LocalPetImage({ pet, speciesEmoji }: { pet: Pet; speciesEmoji: string }) {
  const [failed, setFailed] = useState(false)
  if (failed) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/10 to-white/5">
        <span className="text-5xl">{speciesEmoji}</span>
      </div>
    )
  }
  return (
    <img
      src={`/picture/${pet.name.toLowerCase()}-1.jpeg`}
      alt={pet.name}
      className="w-full h-full object-cover"
      onError={() => setFailed(true)}
    />
  )
}

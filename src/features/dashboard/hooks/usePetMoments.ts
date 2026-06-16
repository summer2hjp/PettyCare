// src/features/dashboard/hooks/usePetMoments.ts

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { PetMoment, MomentType } from '@/types/moments'
import type { Pet } from '@/types/pet'

interface UsePetMomentsOptions {
  petId: string | null  // null = all pets
  type: MomentType
  limit?: number
  pets?: Pet[]          // for generating local fallback images
}

interface UsePetMomentsResult {
  moments: PetMoment[]
  loading: boolean
  error: string | null
  refresh: () => void
}

function mapRow(row: Record<string, unknown>): PetMoment {
  return {
    id: row.id as string,
    petId: row.pet_id as string,
    imageUrl: row.image_url as string,
    caption: row.caption as string | null,
    momentType: row.moment_type as MomentType,
    takenAt: row.taken_at as string,
    createdAt: row.created_at as string,
  }
}

function generateLocalMoments(pets: Pet[], type: MomentType): PetMoment[] {
  const momentCaptions: Record<MomentType, string[]> = {
    daily: ['晒太阳 🌤️', '玩耍时间 🎾', '打个盹 💤'],
    interaction: ['一起散步 🚶', '摸摸头 🤗', '喂食时光 🍽️'],
    growth: ['第一天到家 🐣', '慢慢长大 🌱', '现在的样子 ✨'],
  }
  const captions = momentCaptions[type]
  const moments: PetMoment[] = []

  for (const pet of pets) {
    // Try up to 2 local images per pet, with descending dates for display order
    for (let i = 1; i <= 2; i++) {
      const imageUrl = `/picture/${pet.name.toLowerCase()}-${i}.jpeg`
      const date = new Date()
      date.setDate(date.getDate() - (i - 1)) // newest first
      moments.push({
        id: `local-${pet.id}-${type}-${i}`,
        petId: pet.id,
        imageUrl,
        caption: captions[(i - 1) % captions.length],
        momentType: type,
        takenAt: date.toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
      })
    }
  }

  return moments
}

export function usePetMoments({ petId, type, limit = 20, pets = [] }: UsePetMomentsOptions): UsePetMomentsResult {
  const [moments, setMoments] = useState<PetMoment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMoments = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      let query = supabase
        .from('pet_moments')
        .select('*')
        .eq('moment_type', type)
        .order('taken_at', { ascending: false })
        .limit(limit)

      if (petId) {
        query = query.eq('pet_id', petId)
      }

      const { data, error: queryError } = await query
      if (queryError) throw queryError

      const dbMoments = (data ?? []).map(r => mapRow(r as Record<string, unknown>))

      // If DB has data, use it; otherwise fall back to local images from public/picture/
      if (dbMoments.length > 0) {
        setMoments(dbMoments)
      } else {
        // Filter pets if a specific pet is selected
        const targetPets = petId ? pets.filter(p => p.id === petId) : pets
        setMoments(generateLocalMoments(targetPets, type))
      }
    } catch (err) {
      // On error, fall back to local images instead of showing error
      const targetPets = petId ? pets.filter(p => p.id === petId) : pets
      if (targetPets.length > 0) {
        setMoments(generateLocalMoments(targetPets, type))
      } else {
        setError(err instanceof Error ? err.message : 'Failed to load moments')
      }
    } finally {
      setLoading(false)
    }
  }, [petId, type, limit, pets])

  useEffect(() => {
    fetchMoments()
  }, [fetchMoments])

  return { moments, loading, error, refresh: fetchMoments }
}

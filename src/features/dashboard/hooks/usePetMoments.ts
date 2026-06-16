// src/features/dashboard/hooks/usePetMoments.ts

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { PetMoment, MomentType } from '@/types/moments'

interface UsePetMomentsOptions {
  petId: string | null  // null = all pets
  type: MomentType
  limit?: number
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

export function usePetMoments({ petId, type, limit = 20 }: UsePetMomentsOptions): UsePetMomentsResult {
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

      setMoments((data ?? []).map(r => mapRow(r as Record<string, unknown>)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load moments')
    } finally {
      setLoading(false)
    }
  }, [petId, type, limit])

  useEffect(() => {
    fetchMoments()
  }, [fetchMoments])

  return { moments, loading, error, refresh: fetchMoments }
}

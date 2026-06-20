import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { uploadImage } from '@/lib/upload'

interface PetGalleryMoment {
  id: string
  petId: string
  imageUrl: string
  caption: string | null
  momentType: string
  takenAt: string
  createdAt: string
}

interface UsePetGalleryResult {
  moments: PetGalleryMoment[]
  loading: boolean
  error: string | null
  addMoment: (file: File, caption?: string) => Promise<void>
  uploading: boolean
  uploadError: string | null
}

export function usePetGallery(petId: string): UsePetGalleryResult {
  const [moments, setMoments] = useState<PetGalleryMoment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const fetchMoments = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: queryError } = await supabase
        .from('pet_moments')
        .select('*')
        .eq('pet_id', petId)
        .order('taken_at', { ascending: false })
        .limit(50)

      if (queryError) throw queryError

      setMoments(
        (data ?? []).map(r => ({
          id: r.id as string,
          petId: r.pet_id as string,
          imageUrl: r.image_url as string,
          caption: r.caption as string | null,
          momentType: r.moment_type as string,
          takenAt: r.taken_at as string,
          createdAt: r.created_at as string,
        })),
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load moments')
    } finally {
      setLoading(false)
    }
  }, [petId])

  const addMoment = useCallback(
    async (file: File, caption?: string) => {
      setUploading(true)
      setUploadError(null)
      try {
        const imageUrl = await uploadImage(
          file,
          'avatars',
          `${petId}/moments/${crypto.randomUUID()}`,
        )

        const { error: insertError } = await supabase
          .from('pet_moments')
          .insert({
            pet_id: petId,
            image_url: imageUrl,
            caption: caption ?? null,
            moment_type: 'daily',
            taken_at: new Date().toISOString(),
          })

        if (insertError) throw insertError

        await fetchMoments()
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : 'Failed to upload moment'
        setUploadError(msg)
        throw err
      } finally {
        setUploading(false)
      }
    },
    [petId, fetchMoments],
  )

  useEffect(() => {
    fetchMoments()
  }, [fetchMoments])

  return { moments, loading, error, addMoment, uploading, uploadError }
}

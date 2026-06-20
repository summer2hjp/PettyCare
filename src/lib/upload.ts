import { supabase } from './supabase'

export class UploadError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'UploadError'
  }
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_DIMENSION = 800
const JPEG_QUALITY = 0.85

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

export function getExtension(mimeType: string): string {
  return MIME_TO_EXT[mimeType] ?? 'jpg'
}

export function validateImageFile(file: File): void {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new UploadError('Only JPEG, PNG, and WebP images are allowed')
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new UploadError('File must be under 5MB')
  }
}

function resizeImage(file: File, maxDimension: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)
      let { width, height } = img

      if (width <= maxDimension && height <= maxDimension) {
        resolve(file)
        return
      }

      const ratio = Math.min(maxDimension / width, maxDimension / height)
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(width * ratio)
      canvas.height = Math.round(height * ratio)

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new UploadError('Failed to get canvas context'))
        return
      }

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(
        blob => {
          if (blob) resolve(blob)
          else reject(new UploadError('Failed to encode resized image'))
        },
        file.type,
        JPEG_QUALITY,
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new UploadError('Failed to decode image'))
    }

    img.src = url
  })
}

/**
 * Upload an image file to Supabase Storage with client-side resize.
 * Validates file type (JPEG/PNG/WebP) and size (max 5MB).
 * Resizes to max 800px on the longest side.
 *
 * @returns The public URL of the uploaded image.
 */
export async function uploadImage(
  file: File,
  bucket: string,
  path: string,
): Promise<string> {
  validateImageFile(file)
  const resized = await resizeImage(file, MAX_DIMENSION)
  const ext = getExtension(file.type)
  const fullPath = `${path}.${ext}`

  const { error } = await supabase.storage
    .from(bucket)
    .upload(fullPath, resized, { upsert: true })

  if (error) throw new UploadError(error.message)

  const { data } = supabase.storage.from(bucket).getPublicUrl(fullPath)
  return data.publicUrl
}

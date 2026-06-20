import { describe, it, expect } from 'vitest'
import { getExtension, validateImageFile, UploadError } from '@/lib/upload'

describe('getExtension', () => {
  it('maps image/jpeg to jpg', () => {
    expect(getExtension('image/jpeg')).toBe('jpg')
  })

  it('maps image/png to png', () => {
    expect(getExtension('image/png')).toBe('png')
  })

  it('maps image/webp to webp', () => {
    expect(getExtension('image/webp')).toBe('webp')
  })

  it('defaults to jpg for unknown types', () => {
    expect(getExtension('image/gif')).toBe('jpg')
  })
})

describe('validateImageFile', () => {
  it('throws UploadError for unsupported image types', () => {
    const file = new File([''], 'test.gif', { type: 'image/gif' })
    expect(() => validateImageFile(file)).toThrow(UploadError)
  })

  it('rejects files over 5MB', () => {
    const oversized = new File([''], 'test.jpg', { type: 'image/jpeg' })
    Object.defineProperty(oversized, 'size', { value: 10 * 1024 * 1024 })
    expect(() => validateImageFile(oversized)).toThrow(UploadError)
  })

  it('accepts valid JPEG files under 5MB', () => {
    const valid = new File([''], 'test.jpg', { type: 'image/jpeg' })
    expect(() => validateImageFile(valid)).not.toThrow()
  })
})

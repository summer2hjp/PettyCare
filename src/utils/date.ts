export function formatDate(iso: string, options?: Intl.DateTimeFormatOptions): string {
  const date = new Date(iso)
  const opts: Intl.DateTimeFormatOptions = options ?? {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }
  return date.toLocaleDateString('en-US', opts)
}

export function calculateAge(birthDate: string): string {
  const birth = new Date(birthDate)
  const now = new Date()
  const diffMs = now.getTime() - birth.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays < 30) return `${diffDays} days`
  const diffMonths = Math.floor(diffDays / 30)
  if (diffMonths < 12) return `${diffMonths} months`
  const years = Math.floor(diffMonths / 12)
  const remainingMonths = diffMonths % 12
  return remainingMonths > 0 ? `${years}y ${remainingMonths}m` : `${years} years`
}

export function relativeTime(iso: string): string {
  const date = new Date(iso)
  const now = new Date()
  const diffMs = date.getTime() - now.getTime()
  const isPast = diffMs < 0
  const absMs = Math.abs(diffMs)
  const minutes = Math.floor(absMs / (1000 * 60))
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  const suffix = isPast ? 'ago' : 'from now'

  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ${suffix}`
  if (hours < 24) return `${hours}h ${suffix}`
  if (days < 30) return `${days}d ${suffix}`
  return formatDate(iso)
}

export function isToday(iso: string): boolean {
  const date = new Date(iso)
  const now = new Date()
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  )
}

export function isOverdue(iso: string): boolean {
  return new Date(iso).getTime() < Date.now()
}

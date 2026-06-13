export function formatWeight(weight: number, unit: 'kg' | 'lb'): string {
  return `${weight} ${unit}`
}

export function formatHealthScore(score: number): {
  label: string
  color: 'green' | 'yellow' | 'orange' | 'red'
} {
  if (score >= 80) return { label: 'Excellent', color: 'green' }
  if (score >= 60) return { label: 'Good', color: 'green' }
  if (score >= 40) return { label: 'Fair', color: 'yellow' }
  if (score >= 20) return { label: 'Poor', color: 'orange' }
  return { label: 'Critical', color: 'red' }
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trimEnd() + '…'
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

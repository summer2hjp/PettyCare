import { useState } from 'react'
import { useAuth } from '@/store/auth-context'
import { AppleCard } from '@/components/ui/AppleCard'
import { AppleButton } from '@/components/ui/AppleButton'
import { DynamicType } from '@/components/ui/DynamicType'

interface LoginPageProps {
  onRegister: () => void
}

export function LoginPage({ onRegister }: LoginPageProps) {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const err = await signIn(email, password)
    if (err) setError(err)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--apple-secondarySystemBackground)]">
      <AppleCard padding="lg" className="w-full max-w-sm">
        <DynamicType styleLevel="title2" weight={700} className="mb-6 text-center">
          Sign in to PettyCare
        </DynamicType>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <DynamicType styleLevel="footnote" weight={600} className="mb-1">Email</DynamicType>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full h-9 px-3 rounded-apple bg-apple-systemBackground text-apple-label border border-apple-separator"
              placeholder="your@email.com" required />
          </div>
          <div>
            <DynamicType styleLevel="footnote" weight={600} className="mb-1">Password</DynamicType>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full h-9 px-3 rounded-apple bg-apple-systemBackground text-apple-label border border-apple-separator"
              placeholder="••••••••" required />
          </div>
          {error && <DynamicType styleLevel="caption1" className="text-apple-red">{error}</DynamicType>}
          <AppleButton type="submit" disabled={loading} className="w-full justify-center">
            {loading ? 'Signing in...' : 'Sign In'}
          </AppleButton>
        </form>
        <button onClick={onRegister} className="w-full text-center mt-4 text-apple-blue text-apple-footnote">
          Don't have an account? Register
        </button>
      </AppleCard>
    </div>
  )
}

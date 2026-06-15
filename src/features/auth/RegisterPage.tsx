import { useState } from 'react'
import { useAuth } from '@/store/auth-context'
import { AppleCard } from '@/components/ui/AppleCard'
import { AppleButton } from '@/components/ui/AppleButton'
import { DynamicType } from '@/components/ui/DynamicType'

interface RegisterPageProps {
  onLogin: () => void
}

export function RegisterPage({ onLogin }: RegisterPageProps) {
  const { signUp } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const err = await signUp(email, password)
    if (err) { setError(err) } else { setSuccess(true) }
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--apple-secondarySystemBackground)]">
        <AppleCard padding="lg" className="w-full max-w-sm text-center">
          <DynamicType styleLevel="title2" weight={700} className="mb-3">Registration successful!</DynamicType>
          <DynamicType styleLevel="body" className="mb-4">You can now sign in with your email and password.</DynamicType>
          <AppleButton onClick={onLogin}>Go to Sign In</AppleButton>
        </AppleCard>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--apple-secondarySystemBackground)]">
      <AppleCard padding="lg" className="w-full max-w-sm">
        <DynamicType styleLevel="title2" weight={700} className="mb-6 text-center">
          Create Account
        </DynamicType>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <DynamicType styleLevel="footnote" weight={600} className="mb-1">Email</DynamicType>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full h-9 px-3 rounded-apple bg-apple-systemBackground text-apple-label border border-apple-separator" required />
          </div>
          <div>
            <DynamicType styleLevel="footnote" weight={600} className="mb-1">Password</DynamicType>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full h-9 px-3 rounded-apple bg-apple-systemBackground text-apple-label border border-apple-separator"
              minLength={6} required />
          </div>
          {error && <DynamicType styleLevel="caption1" className="text-apple-red">{error}</DynamicType>}
          <AppleButton type="submit" disabled={loading} className="w-full justify-center">
            {loading ? 'Creating account...' : 'Register'}
          </AppleButton>
        </form>
        <button onClick={onLogin} className="w-full text-center mt-4 text-apple-blue text-apple-footnote">
          Already have an account? Sign In
        </button>
      </AppleCard>
    </div>
  )
}

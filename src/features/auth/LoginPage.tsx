import { useState } from 'react'
import { useAuth } from '@/store/auth-context'
import { PetBackground } from './PetBackground'
import { AppleButton } from '@/components/ui/AppleButton'
import { DynamicType } from '@/components/ui/DynamicType'
import { cn } from '@/utils/cn'
import { PawPrint, Eye, EyeOff } from 'lucide-react'

interface LoginPageProps {
  onRegister: () => void
}

export function LoginPage({ onRegister }: LoginPageProps) {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const err = await signIn(email, password)
    if (err) setError(err)
    setLoading(false)
  }

  const inputClass = "w-full h-11 px-4 rounded-apple-xl bg-white/10 text-white placeholder:text-white/40 border border-white/20 focus:border-white/50 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-200 text-apple-body"

  return (
    <PetBackground>
      <div className="w-full max-w-sm mx-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-apple-2xl bg-white/10 backdrop-blur-xl flex items-center justify-center mx-auto mb-4 border border-white/20">
            <PawPrint size={32} className="text-white" />
          </div>
          <DynamicType styleLevel="title1" weight={700} className="text-white">
            PettyCare
          </DynamicType>
          <DynamicType styleLevel="subhead" className="text-white/60 mt-1">
            Your pet's health companion
          </DynamicType>
        </div>

        {/* Login card */}
        <div className="rounded-apple-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-8 shadow-2xl">
          <DynamicType styleLevel="title3" weight={600} className="text-white mb-6">
            Welcome back
          </DynamicType>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <DynamicType styleLevel="caption1" weight={600} className="text-white/70 mb-1.5 block">
                Email
              </DynamicType>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className={inputClass}
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <DynamicType styleLevel="caption1" weight={600} className="text-white/70 mb-1.5 block">
                Password
              </DynamicType>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className={cn(inputClass, 'pr-11')}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-apple-xl bg-red-500/20 border border-red-500/30 px-4 py-2.5">
                <DynamicType styleLevel="caption1" className="text-red-200">{error}</DynamicType>
              </div>
            )}

            <AppleButton
              type="submit"
              disabled={loading}
              className="w-full justify-center h-11 rounded-apple-xl bg-white text-black hover:bg-white/90 active:scale-[0.98] transition-all font-semibold"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </AppleButton>
          </form>
        </div>

        {/* Register link */}
        <button
          onClick={onRegister}
          className="w-full text-center mt-6 text-white/60 hover:text-white transition-colors text-apple-footnote"
        >
          Don't have an account?{' '}
          <span className="text-white font-medium underline underline-offset-2">Register</span>
        </button>
      </div>
    </PetBackground>
  )
}

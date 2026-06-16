// src/features/auth/AuthPage.tsx
import { useState, useCallback } from 'react'
import { useAuth } from '@/store/auth-context'
import { supabase } from '@/lib/supabase'
import { PetBackground } from './PetBackground'
import { cn } from '@/utils/cn'
import { PawPrint, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'

type AuthMode = 'login' | 'register'

function AuthForm({
  mode,
  onModeChange,
  onSubmit,
  isSuccess,
}: {
  mode: AuthMode
  onModeChange: (m: AuthMode) => void
  onSubmit: (email: string, password: string) => Promise<string | null>
  isSuccess: boolean
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const err = await onSubmit(email, password)
    if (err) setError(err)
    setLoading(false)
  }, [email, password, onSubmit])

  const inputBase =
    'w-full h-[46px] px-4 rounded-full bg-black/25 backdrop-blur-sm text-white placeholder:text-white/35 text-[14px] ' +
    'border border-white/[0.10] transition-all duration-200 outline-none ' +
    'focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35]/25'

  return (
    <div className="w-full max-w-[340px]">
      {/* Brand: Blue paw + PettyCare */}
      <div className="flex items-center gap-3 mb-5">
        <PawPrint size={40} className="text-[#FF6B35]" />
        <span className="text-[#FF6B35] text-[26px] font-bold tracking-tight">PettyCare</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Email */}
        <div className="relative">
          <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/90 pointer-events-none" />
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className={cn(inputBase, 'pl-10')}
            placeholder="Email"
            autoComplete="email"
            required
          />
        </div>

        {/* Password */}
        <div className="relative">
          <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/90 pointer-events-none" />
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            className={cn(inputBase, 'pl-10 pr-10')}
            placeholder="Password"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/60 hover:text-white/90 transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-full bg-red-500/10 border border-red-500/20 px-4 py-2.5">
            <p className="text-[13px] text-white font-semibold">{error}</p>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || isSuccess}
          className={cn(
            'w-full h-[44px] rounded-full text-[14px] font-semibold transition-all duration-200',
            isSuccess
              ? 'bg-[#34C759] text-white'
              : 'bg-[#FF6B35] text-white hover:bg-[#E85D2C] active:scale-[0.99]',
            loading && 'opacity-80 cursor-not-allowed',
          )}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 size={16} className="animate-spin" />
              <span>{mode === 'login' ? 'Signing in...' : 'Creating account...'}</span>
            </span>
          ) : isSuccess ? (
            'Account created!'
          ) : (
            mode === 'login' ? 'Sign in' : 'Create account'
          )}
        </button>
      </form>

      {/* Toggle mode */}
      <div className="flex items-center justify-center gap-1 mt-5 text-sm text-white/35">
        {mode === 'login' ? (
          <>
            <span className="font-medium">Don't have an account?</span>
            <button type="button" onClick={() => onModeChange('register')} className="text-[#FF6B35] hover:text-[#E85D2C] font-medium transition-colors">
              Sign up
            </button>
          </>
        ) : (
          <>
            <span>Already have an account?</span>
            <button type="button" onClick={() => onModeChange('login')} className="text-[#FF6B35] hover:text-[#E85D2C] font-medium transition-colors">
              Sign in
            </button>
          </>
        )}
      </div>

      {/* Social */}
      <div className="mt-6 text-center">
        <p className="text-[14px] text-[#FF6B35] mb-4">Or continue with</p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })}
            className="flex-1 h-[44px] rounded-full bg-black/20 backdrop-blur-sm border border-white/[0.08] flex items-center justify-center gap-1.5 hover:bg-white/[0.06] transition-colors text-[13px] text-white/85">
            <svg width="19" height="19" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Google
          </button>
          <button
            type="button"
            onClick={() => supabase.auth.signInWithOAuth({ provider: 'github' })}
            className="flex-1 h-[44px] rounded-full bg-black/20 backdrop-blur-sm border border-white/[0.08] flex items-center justify-center gap-1.5 hover:bg-white/[0.06] transition-colors text-[13px] text-white/85">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            GitHub
          </button>
        </div>
      </div>
    </div>
  )
}

export function AuthPage() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<AuthMode>('login')
  const [loginSuccess, setLoginSuccess] = useState(false)
  const [formKey, setFormKey] = useState(0)

  const handleModeChange = (newMode: AuthMode) => {
    setMode(newMode)
    setFormKey(k => k + 1)
  }

  if (loginSuccess) {
    return (
      <PetBackground>
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-[#34C759]/15 flex items-center justify-center mx-auto mb-4">
            <PawPrint size={28} className="text-[#34C759]" />
          </div>
          <h1 className="text-white text-xl font-bold">Welcome back!</h1>
          <p className="text-[#6B6B6D] text-sm mt-1">Redirecting...</p>
        </div>
      </PetBackground>
    )
  }

  return (
    <PetBackground>
      <div key={formKey}>
        <AuthForm
          key={formKey}
          mode={mode}
          onModeChange={handleModeChange}
          onSubmit={async (email, password) => {
            if (mode === 'login') {
              const err = await signIn(email, password)
              if (!err) setLoginSuccess(true)
              return err
            } else {
              const err = await signUp(email, password)
              if (!err) {
                setMode('login')
                setFormKey(k => k + 1)
              }
              return err
            }
          }}
          isSuccess={false}
        />
      </div>
    </PetBackground>
  )
}

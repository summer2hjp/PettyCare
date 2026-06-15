// src/features/auth/AuthPage.tsx
import { useState, useCallback } from 'react'
import { useAuth } from '@/store/auth-context'
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
            <p className="text-[13px] text-red-400">{error}</p>
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
      <div className="mt-6">
        <p className="text-[14px] text-[#FF6B35] text-center mb-4">Or continue with</p>

        <div className="flex items-start gap-4">
          {/* Left: Google + Apple stacked */}
          <div className="flex-1 space-y-2.5">
            <button className="w-full h-[44px] rounded-full bg-black/20 backdrop-blur-sm border border-white/[0.08] flex items-center justify-center gap-2.5 hover:bg-white/[0.06] transition-colors text-[13px] text-white/85">
              <svg width="19" height="19" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Google
            </button>
            <button className="w-full h-[44px] rounded-full bg-black/20 backdrop-blur-sm border border-white/[0.08] flex items-center justify-center gap-2.5 hover:bg-white/[0.06] transition-colors text-[13px] text-white/85">
              <svg width="19" height="19" viewBox="0 0 24 24"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.38-1.66 4.22-3.74 4.25z" fill="currentColor"/></svg>
              Apple
            </button>
          </div>

          {/* Right: WeChat QR code */}
          <div className="flex flex-col items-center gap-2 pt-0.5">
            <div className="w-[90px] h-[90px] rounded-xl overflow-hidden bg-black/30 ring-1 ring-white/[0.08] flex items-center justify-center">
              <img
                src="https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=PettyCare"
                alt="WeChat QR code"
                className="w-full h-full"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#07C160">
                <path d="M8.5 2C4.36 2 1 4.98 1 8.5c0 1.92.99 3.64 2.58 4.8L3 15.5l2.89-1.45c.78.22 1.6.36 2.45.36l.33-.01C9.27 12.3 8.5 10.45 8.5 8.5 8.5 4.98 11.86 2 16 2l.5.01C15.36 2.78 13.5 5.36 13.5 8.5c0 3.14 2.5 5.5 5.5 5.5 3.14 0 5.5-2.36 5.5-5.5C24 4.98 20.64 2 16.5 2H8.5z"/>
                <path d="M8.5 6.5c-.69 0-1.25.56-1.25 1.25S7.81 9 8.5 9s1.25-.56 1.25-1.25S9.19 6.5 8.5 6.5zm5 0c-.69 0-1.25.56-1.25 1.25S12.81 9 13.5 9s1.25-.56 1.25-1.25S14.19 6.5 13.5 6.5z"/>
              </svg>
              <span className="text-[11px] text-white/40">Scan with WeChat to login</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function AuthPage() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<AuthMode>('login')
  const [registerSuccess, setRegisterSuccess] = useState(false)
  const [loginSuccess, setLoginSuccess] = useState(false)
  const [formKey, setFormKey] = useState(0)

  const handleModeChange = (newMode: AuthMode) => {
    setMode(newMode)
    setFormKey(k => k + 1)
    if (newMode === 'login') setRegisterSuccess(false)
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
              if (!err) setRegisterSuccess(true)
              return err
            }
          }}
          isSuccess={registerSuccess}
        />
      </div>
    </PetBackground>
  )
}

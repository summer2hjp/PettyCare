// src/features/auth/AuthPage.tsx
import { useState } from 'react'
import { useAuth } from '@/store/auth-context'
import { PetBackground } from './PetBackground'
import { AppleButton } from '@/components/ui/AppleButton'
import { DynamicType } from '@/components/ui/DynamicType'
import { cn } from '@/utils/cn'
import { PawPrint, Eye, EyeOff, Mail, Lock } from 'lucide-react'

function AuthForm({
  mode,
  onSubmit,
}: {
  mode: 'login' | 'register'
  onSubmit: (email: string, password: string) => Promise<string | null>
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const err = await onSubmit(email, password)
    if (err) setError(err)
    setLoading(false)
  }

  const inputBase =
    'w-full h-10 px-3.5 rounded-[10px] bg-white/10 text-white placeholder:text-white/35 text-[15px] ' +
    'border border-white/15 focus:border-white/50 focus:outline-none focus:ring-2 focus:ring-white/15 ' +
    'transition-all duration-200'

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      <div className="relative">
        <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/35" />
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className={cn(inputBase, 'pl-9')}
          placeholder="Email"
          required
        />
      </div>

      <div className="relative">
        <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/35" />
        <input
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={e => setPassword(e.target.value)}
          className={cn(inputBase, 'pl-9 pr-10')}
          placeholder={mode === 'register' ? 'Password (min 6 chars)' : 'Password'}
          minLength={6}
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/35 hover:text-white/70 transition-colors"
        >
          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>

      {error && (
        <div className="rounded-[10px] bg-red-500/15 border border-red-500/20 px-3.5 py-2">
          <span className="text-[13px] text-red-200">{error}</span>
        </div>
      )}

      <AppleButton
        type="submit"
        disabled={loading}
        className="w-full justify-center h-10 rounded-[10px] bg-white text-black hover:bg-white/90 active:scale-[0.98] transition-all text-[15px] font-semibold"
      >
        {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
      </AppleButton>
    </form>
  )
}

function Divider() {
  return (
    <div className="flex items-center gap-3 my-5">
      <div className="flex-1 h-px bg-white/10" />
      <span className="text-[13px] text-white/30 font-medium">OR</span>
      <div className="flex-1 h-px bg-white/10" />
    </div>
  )
}

export function AuthPage() {
  const { signIn, signUp } = useAuth()
  // login success state removed
  const [registerSuccess, setRegisterSuccess] = useState(false)

  if (registerSuccess) {
    return (
      <PetBackground>
        <div className="w-full max-w-sm mx-4">
          <div className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-8 shadow-2xl text-center">
            <div className="w-14 h-14 rounded-full bg-green-400/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl text-green-300">✓</span>
            </div>
            <DynamicType styleLevel="title2" weight={700} className="text-white mb-3">
              Registration successful!
            </DynamicType>
            <DynamicType styleLevel="body" className="text-white/70 mb-6">
              You can now sign in with your email and password.
            </DynamicType>
            <AppleButton
              onClick={() => setRegisterSuccess(false)}
              className="w-full justify-center h-10 rounded-[10px] bg-white text-black hover:bg-white/90 font-semibold"
            >
              Go to Sign In
            </AppleButton>
          </div>
        </div>
      </PetBackground>
    )
  }

  return (
    <PetBackground>
      {/* Header — icon + title */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-3 z-20">
        <div className="w-10 h-10 rounded-[12px] bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/20">
          <PawPrint size={22} className="text-white" />
        </div>
        <DynamicType styleLevel="title1" weight={700} className="text-white tracking-tight">
          PettyCare
        </DynamicType>
      </div>

      {/* Split forms */}
      <div className="w-full max-w-[880px] mx-4 flex gap-6 items-start relative z-10 mt-16">
        {/* ─── Register (left) ─── */}
        <div className="flex-1 rounded-2xl bg-white/8 backdrop-blur-xl border border-white/15 p-7 shadow-2xl">
          <DynamicType styleLevel="title3" weight={600} className="text-white mb-4">
            Create Account
          </DynamicType>
          <AuthForm
            mode="register"
            onSubmit={async (email, password) => {
              const err = await signUp(email, password)
              if (!err) setRegisterSuccess(true)
              return err
            }}
          />
        </div>

        {/* Vertical divider */}
        <div className="w-px self-stretch bg-gradient-to-b from-white/0 via-white/15 to-white/0" />

        {/* ─── Login (right) ─── */}
        <div className="flex-1 rounded-2xl bg-white/8 backdrop-blur-xl border border-white/15 p-7 shadow-2xl">
          <DynamicType styleLevel="title3" weight={600} className="text-white mb-4">
            Welcome Back
          </DynamicType>
          <AuthForm
            mode="login"
            onSubmit={async (email, password) => {
              const err = await signIn(email, password)
              return err
            }}
          />
          <Divider />
          <DynamicType styleLevel="caption1" className="text-white/40 text-center">
            PettyCare — your pet's health companion
          </DynamicType>
        </div>
      </div>
    </PetBackground>
  )
}

# Pet Companion Auth Login — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the existing auth login/register page with an interactive pet companion design where a geometric SVG cat reacts to user input with Framer Motion animations.

**Architecture:** Three files change — `PetBackground.tsx` simplifies to warm solid background, new `PetCharacter.tsx` holds the animated SVG pet, `AuthPage.tsx` is fully rewritten with tab-based login/register, pet integration, and all interaction states.

**Tech Stack:** React 19 + TypeScript + Framer Motion 11 (already installed) + Tailwind CSS + Lucide React

---

### Task 1: Simplify PetBackground to warm solid color

**Files:**
- Modify: `src/features/auth/PetBackground.tsx`

- [ ] **Step 1: Rewrite PetBackground.tsx**

Replace rotating Unsplash background with warm solid `#FAF8F5` + subtle ambient gradient:

```tsx
// src/features/auth/PetBackground.tsx
import type { ReactNode } from 'react'

export function PetBackground({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen relative bg-[#FAF8F5] dark:bg-[#1C1C1E] overflow-hidden">
      {/* Subtle ambient gradient — mint-to-indigo whisper */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00C7BE]/[0.03] to-[#5856D6]/[0.05] dark:via-[#00C7BE]/[0.05] dark:to-[#5856D6]/[0.08]" />
      <div className="relative z-10 min-h-screen flex items-center justify-center">
        {children}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors related to PetBackground.tsx

- [ ] **Step 3: Commit**

```bash
git add src/features/auth/PetBackground.tsx
git commit -m "feat: simplify PetBackground to warm solid gradient"
```

---

### Task 2: Create PetCharacter SVG component with Framer Motion animations

**Files:**
- Create: `src/features/auth/PetCharacter.tsx`

This is the emotional heart of the page — a minimalist geometric cat in Indigo `#5856D6` with Orange `#FF9F0A` ear accents.

- [ ] **Step 1: Create PetCharacter.tsx with SVG body parts and mood variants**

```tsx
// src/features/auth/PetCharacter.tsx
import { motion, type Variants } from 'framer-motion'

type PetMood = 'idle' | 'happy' | 'curious' | 'shy' | 'confused' | 'excited' | 'sad'

interface PetCharacterProps {
  mood: PetMood
  isTyping?: boolean
  activeField?: 'email' | 'password' | null
  passwordVisible?: boolean
}

// ── Animation variants ──

const headVariants: Variants = {
  idle: { rotate: 0, y: 0 },
  curious: { rotate: 8, y: -4, transition: { type: 'spring', stiffness: 200, damping: 15 } },
  shy: { rotate: -6, y: 0 },
  confused: { rotate: -15, y: 0 },
  happy: { rotate: 0, y: -4 },
  excited: { rotate: 0, y: -8 },
  sad: { rotate: 0, y: 2 },
}

const earVariants: Variants = {
  idle: { rotate: 0, scaleY: 1, originY: 1 },
  curious: { rotate: 0, scaleY: 1.15, originY: 1 },
  shy: { rotate: 12, scaleY: 0.85, originY: 1 },
  confused: { rotate: -8, scaleY: 0.85, originY: 1 },
  sad: { y: 4, scaleY: 0.8, originY: 1 },
  happy: { rotate: 0, scaleY: 1.05, originY: 1 },
  excited: { rotate: 0, scaleY: 1.1, originY: 1 },
}

const tailVariants: Variants = {
  idle: {
    rotate: [0, -8, 0, 8, 0],
    transition: { repeat: Infinity, duration: 3, ease: 'easeInOut' },
  },
  curious: {
    rotate: [0, -4, 0, 4, 0],
    transition: { repeat: Infinity, duration: 2.5, ease: 'easeInOut' },
  },
  happy: {
    rotate: [0, -15, 0, 15, 0],
    transition: { repeat: Infinity, duration: 1.5, ease: 'easeInOut' },
  },
  excited: {
    rotate: [0, -20, 0, 20, 0],
    transition: { repeat: Infinity, duration: 0.8, ease: 'easeInOut' },
  },
  shy: {
    rotate: [0, -3, 0, 3, 0],
    transition: { repeat: Infinity, duration: 4, ease: 'easeInOut' },
  },
  confused: {
    rotate: 0,
    transition: { duration: 0 },
  },
  sad: {
    rotate: 0,
    transition: { duration: 0 },
  },
}

const eyeVariants: Variants = {
  idle: { scaleY: 1, scaleX: 1 },
  curious: { scaleX: 1.4, scaleY: 1.4 },
  shy: { scaleY: 0.15, scaleX: 1 },
  confused: { scaleX: 0.85, scaleY: 0.85 },
  happy: { scaleY: 0.3, scaleX: 1.1 },
  excited: { scaleY: 0.25, scaleX: 1.1 },
  sad: { scaleY: 0.85, scaleX: 0.95 },
}

const bodyBounceVariants: Variants = {
  idle: { y: 0 },
  happy: {
    y: [0, -6, 0],
    transition: { repeat: Infinity, duration: 1.2, ease: 'easeInOut' },
  },
  excited: {
    y: [0, -12, 0, -8, 0],
    transition: { repeat: Infinity, duration: 0.6, ease: 'easeInOut' },
  },
}

const entranceVariants: Variants = {
  hidden: { y: 40, opacity: 0, scale: 0.9 },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', damping: 12, stiffness: 180, mass: 0.8 },
  },
}

const pawVariants: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 0.6,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
}

const sparkleVariants: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: (i: number) => ({
    scale: [0, 1.2, 0],
    opacity: [0, 1, 0],
    y: [-10, -30],
    transition: { duration: 0.8, delay: i * 0.15, ease: 'easeOut' },
  }),
}

export function PetCharacter({ mood, isTyping, activeField, passwordVisible }: PetCharacterProps) {
  const showSparkles = mood === 'excited' || mood === 'happy'
  const isShy = mood === 'shy' || (activeField === 'password' && !passwordVisible)

  return (
    <motion.svg
      viewBox="0 0 120 130"
      width="120"
      height="130"
      className="select-none"
      variants={entranceVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ── Tail ── */}
      <motion.g variants={tailVariants} animate={mood} style={{ originX: 88, originY: 95 }}>
        <path
          d="M88,92 Q108,82 104,64"
          stroke="#5856D6"
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
        />
      </motion.g>

      {/* ── Body ── */}
      <motion.g variants={bodyBounceVariants} animate={mood}>
        <ellipse cx="60" cy="94" rx="27" ry="20" fill="#5856D6" />

        {/* Belly accent */}
        <ellipse cx="60" cy="96" rx="18" ry="13" fill="#6B6BD6" opacity={0.4} />

        {/* Back legs */}
        <ellipse cx="42" cy="112" rx="7" ry="5" fill="#5856D6" />
        <ellipse cx="78" cy="112" rx="7" ry="5" fill="#5856D6" />
        <ellipse cx="42" cy="113" rx="4" ry="3" fill="#7A7AD6" opacity={0.3} />
        <ellipse cx="78" cy="113" rx="4" ry="3" fill="#7A7AD6" opacity={0.3} />

        {/* Front legs */}
        <ellipse cx="48" cy="113" rx="5" ry="4" fill="#5856D6" />
        <ellipse cx="72" cy="113" rx="5" ry="4" fill="#5856D6" />
      </motion.g>

      {/* ── Head group ── */}
      <motion.g variants={headVariants} animate={mood} style={{ originX: 60, originY: 50 }}>
        {/* Left ear */}
        <motion.g variants={earVariants} animate={mood} style={{ originX: 44, originY: 30 }}>
          <polygon points="44,34 36,8 52,26" fill="#5856D6" />
          <polygon points="44,32 38,14 49,26" fill="#FF9F0A" opacity={0.55} />
        </motion.g>

        {/* Right ear */}
        <motion.g variants={earVariants} animate={mood} style={{ originX: 76, originY: 30 }}>
          <polygon points="76,34 84,8 68,26" fill="#5856D6" />
          <polygon points="76,32 82,14 71,26" fill="#FF9F0A" opacity={0.55} />
        </motion.g>

        {/* Head */}
        <circle cx="60" cy="48" r="25" fill="#5856D6" />

        {/* Face accent */}
        <circle cx="60" cy="50" r="19" fill="#6B6BD6" opacity={0.2} />

        {/* Eyes */}
        <motion.g variants={eyeVariants} animate={mood} style={{ originX: 60, originY: 45 }}>
          <ellipse cx="50" cy="44" rx="4" ry="4.5" fill="#1C1C1E" />
          <ellipse cx="70" cy="44" rx="4" ry="4.5" fill="#1C1C1E" />
        </motion.g>

        {/* Eye highlights */}
        <circle cx="51" cy="42.5" r="1.8" fill="white" opacity={0.85} />
        <circle cx="71" cy="42.5" r="1.8" fill="white" opacity={0.85} />

        {/* Nose */}
        <ellipse cx="60" cy="52" rx="3" ry="2.2" fill="#FF9500" />

        {/* Mouth */}
        <path
          d="M57,55 Q60,59 63,55"
          stroke="#1C1C1E"
          strokeWidth="1.5"
          fill="none"
          opacity={0.35}
          strokeLinecap="round"
        />

        {/* Whiskers */}
        <g opacity={0.25} stroke="#8E8E93" strokeWidth="1" strokeLinecap="round">
          <line x1="28" y1="48" x2="42" y2="50" />
          <line x1="28" y1="54" x2="42" y2="53" />
          <line x1="92" y1="48" x2="78" y2="50" />
          <line x1="92" y1="54" x2="78" y2="53" />
        </g>

        {/* Paws (遮眼) */}
        <motion.path
          d="M48,58 Q44,48 48,40"
          stroke="#5856D6"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          variants={pawVariants}
          initial="hidden"
          animate={isShy ? 'visible' : 'hidden'}
        />
      </motion.g>

      {/* ── Sparkles (happy/excited) ── */}
      {showSparkles && (
        <g>
          {[0, 1, 2].map((i) => (
            <motion.text
              key={i}
              x={[40, 70, 55][i]}
              y={[10, 8, 2][i]}
              fontSize="10"
              fill="#FF9F0A"
              custom={i}
              variants={sparkleVariants}
              initial="hidden"
              animate="visible"
            >
              ✦
            </motion.text>
          ))}
        </g>
      )}
    </motion.svg>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/features/auth/PetCharacter.tsx
git commit -m "feat: add PetCharacter SVG component with framer-motion mood animations"
```

---

### Task 3: Rewrite AuthPage with Pet Companion design

**Files:**
- Modify: `src/features/auth/AuthPage.tsx`

- [ ] **Step 1: Rewrite AuthPage.tsx with new layout, tab system, and pet integration**

This is the largest change — complete replacement of the file with the new design:

```tsx
// src/features/auth/AuthPage.tsx
import { useState, useCallback } from 'react'
import { useAuth } from '@/store/auth-context'
import { PetBackground } from './PetBackground'
import { PetCharacter } from './PetCharacter'
import { AppleButton } from '@/components/ui/AppleButton'
import { DynamicType } from '@/components/ui/DynamicType'
import { cn } from '@/utils/cn'
import {
  PawPrint,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
} from 'lucide-react'

type AuthMode = 'login' | 'register'
type FormStatus = 'idle' | 'loading' | 'error' | 'success'
type PetMood = 'idle' | 'happy' | 'curious' | 'shy' | 'confused' | 'excited' | 'sad'

function usePetMood(status: FormStatus, activeField: 'email' | 'password' | null, error: string | null, showPassword: boolean): PetMood {
  if (status === 'loading') return 'excited'
  if (status === 'success') return 'happy'
  if (status === 'error') {
    if (error?.includes('network') || error?.includes('server')) return 'sad'
    return 'confused'
  }
  if (activeField === 'password' && !showPassword) return 'shy'
  if (activeField) return 'curious'
  return 'idle'
}

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
  const [activeField, setActiveField] = useState<'email' | 'password' | null>(null)

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const err = await onSubmit(email, password)
    if (err) setError(err)
    setLoading(false)
  }, [email, password, onSubmit])

  const petMood = usePetMood(
    loading ? 'loading' : isSuccess ? 'success' : error ? 'error' : 'idle',
    activeField,
    error,
    showPassword,
  )

  const inputBase =
    'w-full h-10 px-3.5 rounded-apple bg-white dark:bg-white/10 text-[#1C1C1E] dark:text-white ' +
    'placeholder:text-[#8E8E93] dark:placeholder:text-white/35 text-[15px] ' +
    'border border-[#E5E5EA] dark:border-white/15 ' +
    'transition-all duration-200 outline-none '

  const inputFocus =
    'focus:border-[#00C7BE] focus:shadow-[0_0_0_3px_rgba(0,199,190,0.12)] dark:focus:shadow-[0_0_0_3px_rgba(0,199,190,0.2)]'

  const inputError =
    'border-[#FF9500] shadow-[0_0_0_3px_rgba(255,149,0,0.1)] dark:shadow-[0_0_0_3px_rgba(255,149,0,0.15)]'

  return (
    <>
      {/* ── Pet Character ── */}
      <div className="flex justify-center mb-6">
        <PetCharacter
          mood={petMood}
          isTyping={activeField !== null}
          activeField={activeField}
          passwordVisible={showPassword}
        />
      </div>

      {/* ── Mode Tabs ── */}
      <div className="flex bg-[#F2F2F7] dark:bg-white/[0.06] rounded-[9px] p-[3px] mb-6">
        {(['login', 'register'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => onModeChange(tab)}
            className={cn(
              'flex-1 h-9 rounded-[7px] text-[14px] font-medium transition-all duration-200',
              mode === tab
                ? 'bg-white dark:bg-white/15 text-[#1C1C1E] dark:text-white shadow-apple-sm'
                : 'text-[#8E8E93] dark:text-white/40 hover:text-[#1C1C1E] dark:hover:text-white/70',
            )}
          >
            {tab === 'login' ? 'Sign In' : 'Register'}
          </button>
        ))}
      </div>

      {/* ── Form ── */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Email */}
        <div className="relative">
          <Mail
            size={15}
            className={cn(
              'absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200',
              activeField === 'email' ? 'text-[#00C7BE]' : 'text-[#8E8E93] dark:text-white/35',
            )}
          />
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onFocus={() => setActiveField('email')}
            onBlur={() => setActiveField(null)}
            className={cn(inputBase, inputFocus, error && error.includes('email') && inputError, 'pl-10')}
            placeholder="Email address"
            autoComplete="email"
            required
          />
        </div>

        {/* Password */}
        <div className="relative">
          <Lock
            size={15}
            className={cn(
              'absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200',
              activeField === 'password' ? 'text-[#00C7BE]' : 'text-[#8E8E93] dark:text-white/35',
            )}
          />
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            onFocus={() => setActiveField('password')}
            onBlur={() => setActiveField(null)}
            className={cn(inputBase, inputFocus, error && error.includes('password') && inputError, 'pl-10 pr-10')}
            placeholder={mode === 'register' ? 'Password (min 6 characters)' : 'Password'}
            minLength={6}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8E8E93] dark:text-white/35 hover:text-[#1C1C1E] dark:hover:text-white/70 transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {/* Error message */}
        {error && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-apple bg-[#FF9500]/10 border border-[#FF9500]/20 px-3.5 py-2">
              <span className="text-[13px] text-[#FF9500]">{error}</span>
            </div>
          </motion.div>
        )}

        {/* Forgot password link (login mode only) */}
        {mode === 'login' && (
          <div className="text-right">
            <button
              type="button"
              className="text-[13px] text-[#00C7BE] hover:text-[#00A8A0] transition-colors font-medium"
            >
              Forgot password?
            </button>
          </div>
        )}

        {/* Submit button */}
        <AppleButton
          type="submit"
          disabled={loading || isSuccess}
          className={cn(
            'w-full justify-center h-10 rounded-apple text-[15px] font-semibold transition-all duration-300',
            isSuccess
              ? 'bg-[#34C759] text-white'
              : 'bg-[#00C7BE] text-white hover:bg-[#00A8A0] active:scale-[0.98]',
            (loading || isSuccess) && 'opacity-80 cursor-not-allowed',
          )}
        >
          {loading ? (
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              <span className="ml-1">{mode === 'login' ? 'Signing in' : 'Creating account'}</span>
            </span>
          ) : isSuccess ? (
            <span className="flex items-center gap-2">
              <CheckCircle2 size={18} />
              {mode === 'login' ? 'Welcome!' : 'Account created!'}
            </span>
          ) : (
            <span>{mode === 'login' ? 'Let\'s Go' : 'Join Now'}</span>
          )}
        </AppleButton>

        {/* Success message (registration) */}
        {isSuccess && mode === 'register' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-apple bg-[#34C759]/10 border border-[#34C759]/20 px-4 py-3 text-center"
          >
            <DynamicType styleLevel="footnote" className="text-[#34C759]">
              Please check your email to verify your account.
            </DynamicType>
          </motion.div>
        )}
      </form>
    </>
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
    setFormKey(k => k + 1) // Reset form state on tab switch
    if (newMode === 'login') setRegisterSuccess(false)
  }

  // Show success screen briefly before transition
  if (loginSuccess) {
    return (
      <PetBackground>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm mx-4 text-center"
        >
          <CheckCircle2 size={48} className="text-[#34C759] mx-auto mb-4" />
          <DynamicType styleLevel="title2" weight={700} className="text-[#1C1C1E] dark:text-white mb-2">
            Welcome back!
          </DynamicType>
          <DynamicType styleLevel="body" className="text-[#8E8E93]">
            Redirecting to your dashboard...
          </DynamicType>
        </motion.div>
      </PetBackground>
    )
  }

  return (
    <PetBackground>
      {/* Brand header */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-2.5 z-20">
        <div className="w-9 h-9 rounded-[10px] bg-[#00C7BE]/10 dark:bg-[#00C7BE]/20 flex items-center justify-center">
          <PawPrint size={20} className="text-[#00C7BE]" />
        </div>
        <DynamicType styleLevel="title3" weight={700} className="text-[#1C1C1E] dark:text-white tracking-tight">
          PettyCare
        </DynamicType>
      </div>

      {/* Auth card */}
      <div className="w-full max-w-sm mx-4 mt-10">
        <motion.div
          key={formKey}
          initial={{ opacity: 0, x: mode === 'login' ? -16 : 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 22 }}
          className="rounded-apple-2xl bg-white/78 dark:bg-[#2C2C2E]/85 backdrop-blur-[20px] border border-white/50 dark:border-white/10 shadow-apple-xl dark:shadow-dark-apple-xl p-7"
        >
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

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-[#E5E5EA] dark:bg-white/10" />
            <span className="text-[13px] text-[#8E8E93] dark:text-white/30 font-medium">OR</span>
            <div className="flex-1 h-px bg-[#E5E5EA] dark:bg-white/10" />
          </div>

          {/* Social buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              className="flex-1 h-10 rounded-apple border border-[#E5E5EA] dark:border-white/15 flex items-center justify-center gap-2 hover:bg-[#F2F2F7] dark:hover:bg-white/5 transition-colors text-[13px] text-[#8E8E93] dark:text-white/50 font-medium"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>
            <button
              type="button"
              className="flex-1 h-10 rounded-apple border border-[#E5E5EA] dark:border-white/15 flex items-center justify-center gap-2 hover:bg-[#F2F2F7] dark:hover:bg-white/5 transition-colors text-[13px] text-[#8E8E93] dark:text-white/50 font-medium"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.38-1.66 4.22-3.74 4.25z" fill="currentColor"/>
              </svg>
              Apple
            </button>
          </div>
        </motion.div>

        {/* Footer */}
        <DynamicType styleLevel="caption1" className="text-center mt-6 text-[#8E8E93] dark:text-white/30">
          PettyCare — your pet's health companion
        </DynamicType>
      </div>
    </PetBackground>
  )
}
```

> **Note:** The first `motion` import will need to be added at the top of the file. The code above uses `motion.div` for animations — this requires Framer Motion to be imported. The AppleButton import is already there. The `cn` utility is already imported.

- [ ] **Step 2: Add missing Framer Motion import to AuthPage.tsx**

Add to the top imports:

```tsx
import { motion, AnimatePresence } from 'framer-motion'
```

(Insert after `import { cn } from '@/utils/cn'`)

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors — all dependencies (framer-motion, lucide-react, cn, DynamicType, AppleButton) are already installed.

- [ ] **Step 4: Commit**

```bash
git add src/features/auth/AuthPage.tsx
git commit -m "feat: rewrite AuthPage with pet companion login design"
```

---

### Task 4: Visual verification

- [ ] **Step 1: Start dev server**

Run: `npm run dev`
Wait for: `http://localhost:5173` ready message

- [ ] **Step 2: Take screenshot of auth page**

Using Puppeteer to capture the new login page:

```bash
npx tsx -e "
import puppeteer from 'puppeteer';
const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 800 });
await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
await page.screenshot({ path: 'tests/auth-login-page.png', fullPage: true });
console.log('Screenshot saved to tests/auth-login-page.png');
await browser.close();
"
```

- [ ] **Step 3: Confirm screenshot shows the new warm-colored login page with pet character**

Verify visually that:
- Background is warm `#FAF8F5` (not dark pet photos)
- Indigo cat character is visible above the form
- "Sign In" / "Register" tabs appear as segmented control
- Email and password inputs with icons
- "Let's Go" button in Mint `#00C7BE`
- Google and Apple social buttons at bottom
- PettyCare branding top-center
- Card has subtle glass border and shadow

- [ ] **Step 4: Run existing tests to confirm no regressions**

```bash
npx tsx tests/chrome-visual.spec.ts
```

Expected: Auth-related tests pass (or are skipped if auth previously blocked tests).

- [ ] **Step 5: Final commit (if changes needed from verification)**

```bash
git add -A
git commit -m "fix: visual adjustments from verification"
```

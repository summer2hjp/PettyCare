import { type ReactNode } from 'react'
import { useAuth } from '@/store/auth-context'
import { LoginPage } from './LoginPage'
import { RegisterPage } from './RegisterPage'
import { LoadingState } from '@/components/common/LoadingState'
import { useState } from 'react'

export function AuthGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const [showRegister, setShowRegister] = useState(false)

  if (loading) return <LoadingState message="Loading..." />
  if (!user) {
    return showRegister
      ? <RegisterPage onLogin={() => setShowRegister(false)} />
      : <LoginPage onRegister={() => setShowRegister(true)} />
  }
  return <>{children}</>
}

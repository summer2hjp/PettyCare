import { type ReactNode } from 'react'
import { useAuth } from '@/store/auth-context'
import { AuthPage } from './AuthPage'
import { LoadingState } from '@/components/common/LoadingState'

export function AuthGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) return <LoadingState message="Loading..." />
  if (!user) return <AuthPage />
  return <>{children}</>
}

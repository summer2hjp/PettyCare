import { type ReactNode, useState } from 'react'
import { AppleSidebar, type NavItem } from '@/components/ui/AppleSidebar'
import { AppleToolbar } from '@/components/ui/AppleToolbar'
import { useTheme } from '@/hooks/useTheme'
import { useAuth } from '@/store/auth-context'
import { cn } from '@/utils/cn'

interface RootLayoutProps {
  children?: ReactNode
  navItems?: NavItem[]
  activeItem?: string
  pageTitle?: string
  onNavigate?: (id: string) => void
  className?: string
}

export function RootLayout({
  children,
  navItems,
  activeItem = 'home',
  pageTitle = 'Dashboard',
  onNavigate,
  className,
}: RootLayoutProps) {
  const { theme, toggleTheme } = useTheme()
  const { user, signOut } = useAuth()
  const [searchValue, setSearchValue] = useState('')

  return (
    <div className="h-dvh flex overflow-hidden bg-[var(--mm-background)]">
      <AppleSidebar
        activeItem={activeItem}
        navItems={navItems}
        onNavigate={onNavigate}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <AppleToolbar
          title={pageTitle}
          searchValue={searchValue}
          onSearch={setSearchValue}
          isDark={theme === 'dark'}
          onThemeToggle={toggleTheme}
          userEmail={user?.email}
          onSignOut={signOut}
        />

        <main className={cn('flex-1 overflow-y-auto p-6 bg-[var(--mm-background)]', className)}>
          {children}
        </main>
      </div>
    </div>
  )
}

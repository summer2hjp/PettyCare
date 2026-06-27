import { type ReactNode, useState } from 'react'
import { AppleSidebar, type NavItem } from '@/components/ui/AppleSidebar'
import { AppleToolbar } from '@/components/ui/AppleToolbar'
import { ShapeGrid } from '@/components/ui/ShapeGrid'
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
    <div className="h-dvh flex overflow-hidden relative bg-[var(--mm-background)]">
      {/* ShapeGrid background layer – only renders in dark mode */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <ShapeGrid className="w-full h-full" />
      </div>

      <AppleSidebar
        activeItem={activeItem}
        navItems={navItems}
        onNavigate={onNavigate}
        className="relative z-10"
      />

      <div className="flex-1 flex flex-col min-w-0 relative z-10">
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

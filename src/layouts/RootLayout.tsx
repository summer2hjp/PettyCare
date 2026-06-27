import { type ReactNode, useState } from 'react'
import { AppleSidebar, type NavItem } from '@/components/ui/AppleSidebar'
import { AppleToolbar } from '@/components/ui/AppleToolbar'
import { Dock, type DockItem } from '@/components/ui/Dock'
import GradientBlinds from '@/components/ui/GradientBlinds'
import { Search, Bell, Sun } from 'lucide-react'
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
  const [searchOpen, setSearchOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const isDark = theme === 'dark'

  const dockItems: DockItem[] = [
    { id: 'search', icon: <Search size={20} />, label: 'Search', onClick: () => setSearchOpen(true) },
    { id: 'notifications', icon: <Bell size={20} />, label: 'Notifications' },
    { id: 'theme', icon: <Sun size={18} />, label: 'Light Mode', onClick: toggleTheme },
    { id: 'user', icon: <span>👤</span>, label: user?.email ?? 'Account', onClick: () => setUserMenuOpen(v => !v) },
  ]

  return (
    <div className="h-dvh flex overflow-hidden relative bg-[var(--mm-background)]">
      {/* GradientBlinds background layer – fullscreen WebGL gradient */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <GradientBlinds className="w-full h-full" />
      </div>

      <AppleSidebar
        activeItem={activeItem}
        navItems={navItems}
        onNavigate={onNavigate}
        className="relative z-10"
        dockContent={isDark ? (
          <Dock
            items={dockItems}
            panelHeight={56}
            baseItemSize={40}
            magnification={60}
          />
        ) : undefined}
      />

      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <AppleToolbar
          title={pageTitle}
          searchValue={searchValue}
          onSearch={setSearchValue}
          isDark={isDark}
          onThemeToggle={toggleTheme}
          userEmail={user?.email}
          onSignOut={signOut}
          searchOpen={searchOpen}
          onSearchOpenChange={setSearchOpen}
          userMenuOpen={userMenuOpen}
          onUserMenuOpenChange={setUserMenuOpen}
        />

        <main className={cn('flex-1 overflow-y-auto p-6 bg-[var(--mm-background)]', className)}>
          {children}
        </main>
      </div>
    </div>
  )
}
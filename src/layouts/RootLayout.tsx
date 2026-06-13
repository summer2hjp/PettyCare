import { type ReactNode, useState } from 'react'
import { AppleSidebar, type NavItem } from '@/components/ui/AppleSidebar'
import { AppleToolbar } from '@/components/ui/AppleToolbar'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/utils/cn'

interface RootLayoutProps {
  children?: ReactNode
  navItems?: NavItem[]
  activeItem?: string
  pageTitle?: string
  className?: string
}

export function RootLayout({
  children,
  navItems,
  activeItem = 'home',
  pageTitle = 'Dashboard',
  className,
}: RootLayoutProps) {
  const { theme, toggleTheme } = useTheme()
  const [currentNav, setCurrentNav] = useState(activeItem)
  const [searchValue, setSearchValue] = useState('')

  return (
    <div className="h-dvh flex overflow-hidden bg-[var(--apple-secondarySystemBackground)]">
      <AppleSidebar
        activeItem={currentNav}
        navItems={navItems}
        onNavigate={setCurrentNav}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <AppleToolbar
          title={pageTitle}
          searchValue={searchValue}
          onSearch={setSearchValue}
          isDark={theme === 'dark'}
          onThemeToggle={toggleTheme}
        />

        <main className={cn('flex-1 overflow-y-auto p-6 bg-[var(--apple-secondarySystemBackground)]', className)}>
          {children}
        </main>
      </div>
    </div>
  )
}

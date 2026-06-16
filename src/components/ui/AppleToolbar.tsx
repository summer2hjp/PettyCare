import { Search, Bell, Sun, Moon, X, LogOut } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useState, useRef, useEffect } from 'react'

interface AppleToolbarProps {
  title?: string
  searchValue?: string
  onSearch?: (value: string) => void
  notificationCount?: number
  userAvatar?: string
  userEmail?: string
  isDark?: boolean
  onThemeToggle?: () => void
  onSignOut?: () => void
  className?: string
}

const searchLinks = [
  { label: 'Vaccination Schedule', icon: '💉', keywords: ['vaccination', 'vaccine', 'vaccinate', 'shot'] },
  { label: 'Weight Tracking', icon: '⚖️', keywords: ['weight', 'weigh', 'kg', 'lb'] },
  { label: 'Vet Appointments', icon: '🏥', keywords: ['vet', 'appointment', 'doctor', 'checkup'] },
  { label: 'Medication Reminders', icon: '💊', keywords: ['medication', 'medicine', 'pill', 'drug', 'reminder'] },
  { label: 'Feeding Plan', icon: '🍖', keywords: ['feed', 'food', 'meal', 'diet', 'eating'] },
  { label: 'Activity Log', icon: '🏃', keywords: ['activity', 'walk', 'exercise', 'play'] },
]

function DynamicSearchLinks({ query, onSelect }: { query: string; onSelect: () => void }) {
  const q = query.trim().toLowerCase()
  const filtered = q
    ? searchLinks.filter(l => l.label.toLowerCase().includes(q) || l.keywords.some(k => k.includes(q)))
    : searchLinks

  if (q && filtered.length === 0) return null

  return (
    <div className="mt-5">
      <p className="text-apple-subhead text-apple-label font-semibold mb-2.5">
        {q ? 'Suggested Links' : 'Quick Links'}
      </p>
      <div className="flex flex-wrap gap-x-5 gap-y-2">
        {filtered.map(link => (
          <button
            key={link.label}
            onClick={onSelect}
            className={cn(
              'inline-flex items-center gap-1.5 py-1',
              'text-apple-footnote text-apple-label font-medium',
              'hover:text-apple-blue',
              'transition-colors duration-200',
            )}
          >
            <span className="text-base">{link.icon}</span>
            <span>{link.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export function AppleToolbar({
  title = 'Dashboard',
  searchValue = '',
  onSearch,
  notificationCount = 0,
  userAvatar,
  userEmail,
  isDark = false,
  onThemeToggle,
  onSignOut,
  className,
}: AppleToolbarProps) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (searchOpen) {
      inputRef.current?.focus()
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [searchOpen])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setSearchOpen(false)
      }
    }
    if (searchOpen) {
      setTimeout(() => document.addEventListener('mousedown', handleClick), 0)
    }
    return () => document.removeEventListener('mousedown', handleClick)
  }, [searchOpen])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClick)
    }
    return () => document.removeEventListener('mousedown', handleClick)
  }, [userMenuOpen])

  return (
    <>
      <header
        className={cn(
          'h-14 flex items-center px-6 relative z-30',
          'bg-[var(--apple-secondarySystemBackground)]',
          className,
        )}
      >
        {title && (
          <div className="flex items-center gap-2 min-w-0">
            <h1 className="text-apple-title-3 text-apple-label truncate">{title}</h1>
          </div>
        )}

        <div className="flex items-center gap-1 ml-auto">
          {/* Search trigger */}
          <button
            onClick={() => setSearchOpen(true)}
            className={cn(
              'w-9 h-9 flex items-center justify-center',
              'rounded-full transition-colors duration-200',
              'hover:[&>svg]:stroke-[2.5]',
            )}
          >
            <Search size={20} className="text-apple-label" />
          </button>

          <button
            className={cn(
              'relative w-9 h-9 flex items-center justify-center',
              'rounded-full transition-colors duration-200',
              'hover:[&>svg]:stroke-[2.5]',
            )}
          >
            <Bell size={20} className="text-apple-label" />
            {notificationCount > 0 && (
              <span className={cn(
                'absolute -top-0.5 -right-0.5',
                'min-w-[18px] h-[18px] px-1',
                'flex items-center justify-center',
                'bg-apple-red rounded-apple-full',
                'text-[11px] font-semibold text-white',
                'shadow-apple-sm',
              )}>
                {notificationCount > 99 ? '99+' : notificationCount}
              </span>
            )}
          </button>

          <button
            onClick={onThemeToggle}
            className={cn(
              'w-9 h-9 flex items-center justify-center',
              'rounded-full transition-colors duration-200',
              'hover:[&>svg]:stroke-[2.5]',
            )}
          >
            {isDark ? <Sun size={18} className="text-apple-label" /> : <Moon size={18} className="text-apple-label" />}
          </button>

          <div className="relative shrink-0" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="w-8 h-8 flex items-center justify-center rounded-full transition-colors"
            >
              {userAvatar ? (
                <img src={userAvatar} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-lg">👤</span>
              )}
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 top-10 w-56 rounded-xl bg-[var(--apple-systemBackground)] shadow-apple-xl dark:shadow-dark-apple-xl border border-apple-separator py-1.5 z-50">
                {userEmail && (
                  <div className="px-4 py-2 border-b border-apple-separator">
                    <p className="text-sm text-apple-label font-medium truncate">{userEmail}</p>
                  </div>
                )}
                <button
                  onClick={() => { setUserMenuOpen(false); onSignOut?.() }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-apple-label hover:bg-apple-secondaryFill transition-colors"
                >
                  <LogOut size={15} />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Apple-style search overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex flex-col">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

          {/* Search panel — drops down from top */}
          <div
            ref={panelRef}
            className="relative w-full bg-[var(--apple-secondarySystemBackground)] shadow-apple-xl animate-slide-down"
          >
            <div className="max-w-3xl mx-auto px-6 py-8">
              {/* Search input row */}
              <div className="flex items-center gap-3">
                <Search size={22} className="text-apple-label shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search pets, health records, reminders..."
                  value={searchValue}
                  onChange={e => onSearch?.(e.target.value)}
                  onKeyDown={e => e.key === 'Escape' && setSearchOpen(false)}
                  className={cn(
                    'flex-1 h-10 text-apple-title-3 text-apple-label text-left',
                    'bg-transparent',
                    'placeholder:text-apple-placeholderText',
                    'border-none outline-none',
                  )}
                />
                <button
                  onClick={() => setSearchOpen(false)}
                  className={cn(
                    'w-8 h-8 flex items-center justify-center',
                    'rounded-full transition-colors duration-200',
                    'hover:[&>svg]:stroke-[2.5]',
                  )}
                >
                  <X size={20} className="text-apple-secondaryLabel" />
                </button>
              </div>

              {/* Divider */}
              <div className="mt-4 border-t border-[var(--apple-separator)]" />

              {/* Dynamic Links */}
              <DynamicSearchLinks
                query={searchValue}
                onSelect={() => setSearchOpen(false)}
              />
            </div>
          </div>

          {/* Clickable rest of page to close */}
          <div
            className="flex-1 cursor-pointer"
            onClick={() => setSearchOpen(false)}
          />
        </div>
      )}

      {/* Keyframes for slide-down animation */}
      <style>{`
        @keyframes slide-down {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-down {
          animation: slide-down 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
        }
      `}</style>
    </>
  )
}

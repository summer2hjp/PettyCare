import { type LucideIcon, LayoutDashboard, PawPrint, Heart, Activity, UtensilsCrossed, Calendar, Settings } from 'lucide-react'
import { cn } from '@/utils/cn'

export interface NavItem {
  id: string
  label: string
  icon: LucideIcon
  href?: string
}

const defaultNavItems: NavItem[] = [
  { id: 'home', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'pets', label: 'Pets', icon: PawPrint },
  { id: 'health', label: 'Health', icon: Heart },
  { id: 'activity', label: 'Activity', icon: Activity },
  { id: 'feeding', label: 'Feeding', icon: UtensilsCrossed },
  { id: 'appointments', label: 'Appointments', icon: Calendar },
  { id: 'settings', label: 'Settings', icon: Settings },
]

interface AppleSidebarProps {
  activeItem?: string
  navItems?: NavItem[]
  appName?: string
  onNavigate?: (itemId: string) => void
  className?: string
}

export function AppleSidebar({
  activeItem = 'home',
  navItems = defaultNavItems,
  appName = 'PettyCare',
  onNavigate,
  className,
}: AppleSidebarProps) {
  return (
    <aside
      className={cn(
        'w-60 h-full flex flex-col',
        'bg-[var(--mm-background)] border-r border-[var(--mm-separator)]',
        'select-none',
        className,
      )}
    >
      <a
        href="https://github.com/summer2hjp/PettyCare"
        target="_blank"
        rel="noopener noreferrer"
        className="px-5 pt-6 pb-4 block hover:opacity-80 transition-opacity duration-200"
      >
        <div className="flex items-center gap-1.5">
          <span className="text-2xl">🐾</span>
          <span className="text-mm-card-title font-display text-[var(--mm-label)] font-bold">{appName}</span>
        </div>
      </a>

      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto scrollbar-none">
        {navItems.map(item => {
          const Icon = item.icon
          const isActive = item.id === activeItem
          return (
            <button
              key={item.id}
              onClick={() => onNavigate?.(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-mm-md',
                'text-mm-body text-[var(--mm-label)] font-medium',
                'transition-all duration-200',
                'hover:bg-[var(--mm-fill)]',
                isActive && [
                  'bg-[var(--mm-fill)] font-semibold',
                  'border border-[var(--mm-separator)]',
                ],
              )}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} className={isActive ? 'text-[var(--mm-link)]' : 'text-[var(--mm-secondaryLabel)]'} />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>
    </aside>
  )
}

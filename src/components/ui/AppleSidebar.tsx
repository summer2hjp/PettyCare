import { type LucideIcon, LayoutDashboard, PawPrint, Heart, Activity, UtensilsCrossed, Calendar, Settings } from 'lucide-react'
import { cn } from '@/utils/cn'
import { ShinyText } from '@/components/ui/ShinyText'
import TrueFocus from '@/components/ui/TrueFocus'

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
          <TrueFocus
            sentence={appName}
            separator=""
            blurAmount={3}
            borderColor="var(--mm-link)"
            glowColor="rgba(59, 130, 246, 0.5)"
            animationDuration={0.8}
            pauseBetweenAnimations={2}
          />
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
                'text-mm-body font-medium',
                'transition-all duration-200',
                'hover:bg-[var(--mm-fill)]',
                isActive && 'bg-[var(--mm-fill)] font-semibold',
              )}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} className={isActive ? 'text-[var(--mm-link)]' : 'text-[var(--mm-secondaryLabel)]'} />
              <ShinyText
                text={item.label}
                disabled={!isActive}
                speed={3}
                color="#b5b5b5"
                shineColor="#ffffff"
                spread={120}
                className="text-[var(--mm-label)]"
              />
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
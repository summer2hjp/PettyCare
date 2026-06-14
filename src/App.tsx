import { useState } from 'react'
import { usePets } from '@/store/pet-context'
import { RootLayout } from '@/layouts/RootLayout'
import { PetListPage } from '@/features/pets/PetListPage'
import { PetDetailPage } from '@/features/pets/PetDetailPage'
import { PetFormPage } from '@/features/pets/PetFormPage'
import { HealthPage } from '@/features/health/HealthPage'
import { ActivityPage } from '@/features/activity/ActivityPage'
import { FeedingPage } from '@/features/feeding/FeedingPage'
import { AppointmentsPage } from '@/features/appointments/AppointmentsPage'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { SettingsPage } from '@/features/settings/SettingsPage'
import { LayoutDashboard, PawPrint, Heart, Activity, UtensilsCrossed, Calendar, Settings } from 'lucide-react'
import type { NavItem } from '@/components/ui/AppleSidebar'

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'pets', label: 'Pets', icon: PawPrint },
  { id: 'health', label: 'Health', icon: Heart },
  { id: 'activity', label: 'Activity', icon: Activity },
  { id: 'feeding', label: 'Feeding', icon: UtensilsCrossed },
  { id: 'appointments', label: 'Appointments', icon: Calendar },
  { id: 'settings', label: 'Settings', icon: Settings },
]

type PetPageContext = { page: 'pets' } | { page: 'pet-detail'; petId: string } | { page: 'pet-form'; petId?: string } | { page: 'dashboard' } | { page: 'health' } | { page: 'activity' } | { page: 'feeding' } | { page: 'appointments' } | { page: 'settings' }

export default function App() {
  const { getPet } = usePets()
  const [currentNav, setCurrentNav] = useState('dashboard')
  const [page, setPage] = useState<PetPageContext>({ page: 'dashboard' })

  const editingPet = page.page === 'pet-form' && page.petId ? getPet(page.petId) : undefined

  const navigateTo = (navId: string) => {
    setCurrentNav(navId)
    if (navId === 'pets') setPage({ page: 'pets' })
    else setPage({ page: navId as any })
  }

  const pageTitle = page.page === 'dashboard' ? 'Welcome back 👋' : ''

  return (
    <RootLayout
        navItems={navItems}
        activeItem={currentNav}
        pageTitle={pageTitle}
        onNavigate={navigateTo}
      >
        {page.page === 'dashboard' && (
          <DashboardPage onNavigate={(navPage) => {
            // Map sub-pages to parent sidebar nav items for correct highlight
            const navId = navPage === 'pet-form' || navPage === 'pet-detail' ? 'pets' : navPage
            setCurrentNav(navId)
            setPage({ page: navPage as any })
          }} />
        )}

        {page.page === 'pets' && (
          <PetListPage
            onSelect={(id) => setPage({ page: 'pet-detail', petId: id })}
            onAdd={() => setPage({ page: 'pet-form' })}
          />
        )}

        {page.page === 'pet-detail' && (
          <PetDetailPage
            petId={page.petId}
            onBack={() => setPage({ page: 'pets' })}
            onEdit={(id) => setPage({ page: 'pet-form', petId: id })}
          />
        )}

        {page.page === 'health' && (
          <HealthPage />
        )}

        {page.page === 'activity' && (
          <ActivityPage />
        )}

        {page.page === 'feeding' && (
          <FeedingPage />
        )}

        {page.page === 'appointments' && (
          <AppointmentsPage />
        )}

        {page.page === 'settings' && (
          <SettingsPage />
        )}

        {page.page === 'pet-form' && (
          <PetFormPage
            pet={editingPet}
            onBack={() => setPage({ page: 'pets' })}
            onSaved={() => setPage({ page: 'pets' })}
          />
        )}
    </RootLayout>
  )
}

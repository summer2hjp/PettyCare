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
import { SettingsPage } from '@/features/settings/SettingsPage'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { AppleCard } from '@/components/ui/AppleCard'
import { AppleButton } from '@/components/ui/AppleButton'
import { AppleSwitch } from '@/components/ui/AppleSwitch'
import { AppleAvatar } from '@/components/ui/AppleAvatar'
import { AppleBadge } from '@/components/ui/AppleBadge'
import { AppleSegmentedControl } from '@/components/ui/AppleSegmentedControl'
import { AppleProgressRing } from '@/components/ui/AppleProgressRing'
import { AppleTable, type TableColumn } from '@/components/ui/AppleTable'
import { DynamicType } from '@/components/ui/DynamicType'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { ContextMenu } from '@/components/common/ContextMenu'
import { Plus, Dog, Eye, Edit3, LayoutDashboard, PawPrint, Heart, Activity, UtensilsCrossed, Calendar, Settings } from 'lucide-react'
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

// ---- Demo data ----
interface PetRow { id: string; name: string; species: string; breed: string; age: string; status: string }
const petData: PetRow[] = [
  { id: '1', name: 'Luna', species: 'Cat', breed: 'Persian', age: '3y', status: 'Healthy' },
  { id: '2', name: 'Max', species: 'Dog', breed: 'Golden Retriever', age: '5y', status: 'Healthy' },
  { id: '3', name: 'Coco', species: 'Dog', breed: 'Poodle', age: '2y', status: 'Attention' },
]
const petColumns: TableColumn<PetRow>[] = [
  { key: 'name', label: 'Name', render: (r) => <span className="font-semibold">{r.name}</span> },
  { key: 'species', label: 'Species', width: '100px' },
  { key: 'breed', label: 'Breed' },
  { key: 'age', label: 'Age', width: '60px', align: 'center' },
  { key: 'status', label: 'Status', render: (r) => (
    <span className={`inline-flex items-center gap-1 text-apple-footnote ${r.status === 'Healthy' ? 'text-apple-green' : 'text-apple-orange'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${r.status === 'Healthy' ? 'bg-apple-green' : 'bg-apple-orange'}`} />
      {r.status}
    </span>
  )},
]

export default function App() {
  const { getPet } = usePets()
  const [currentNav, setCurrentNav] = useState('dashboard')
  const [page, setPage] = useState<PetPageContext>({ page: 'dashboard' })
  const [dashboardSegment, setDashboardSegment] = useState('all')
  const [switchOn, setSwitchOn] = useState(false)

  const editingPet = page.page === 'pet-form' && page.petId ? getPet(page.petId) : undefined

  const filteredPetData = dashboardSegment === 'all' ? petData : petData.filter(p => p.species.toLowerCase() === dashboardSegment.replace(/s$/, ''))

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
          <>
            <div className="flex mb-6">
              <AppleButton icon={<Plus size={16} />} onClick={() => setPage({ page: 'pet-form' })}>Add Pet</AppleButton>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <AppleCard padding="lg" hoverable>
                <div className="flex items-center justify-between mb-3">
                  <DynamicType styleLevel="subhead" weight={600}>Health Score</DynamicType>
                  <AppleBadge variant="green" dot />
                </div>
                <div className="flex items-center gap-4">
                  <AppleProgressRing progress={0.85} size={64} strokeWidth={5} color="var(--apple-green)">
                    <DynamicType styleLevel="footnote" weight={700}>85%</DynamicType>
                  </AppleProgressRing>
                  <div>
                    <DynamicType styleLevel="caption1">Overall</DynamicType>
                    <DynamicType styleLevel="headline" className="text-apple-green">Excellent</DynamicType>
                  </div>
                </div>
              </AppleCard>
              <AppleCard padding="lg" hoverable>
                <div className="flex items-center justify-between mb-3">
                  <DynamicType styleLevel="subhead" weight={600}>Vaccinations</DynamicType>
                  <AppleBadge count={2} variant="orange" />
                </div>
                <DynamicType styleLevel="title1" weight={700} className="mb-1">2</DynamicType>
                <DynamicType styleLevel="caption1">Upcoming this month</DynamicType>
              </AppleCard>
              <AppleCard padding="lg" hoverable>
                <div className="flex items-center justify-between mb-3">
                  <DynamicType styleLevel="subhead" weight={600}>Appointments</DynamicType>
                  <AppleBadge count={1} />
                </div>
                <DynamicType styleLevel="title1" weight={700} className="mb-1">1</DynamicType>
                <DynamicType styleLevel="caption1">Vet visit tomorrow</DynamicType>
              </AppleCard>
            </div>

            <div className="flex items-center justify-between mb-4">
              <DynamicType styleLevel="title3" weight={600}>Your Pets</DynamicType>
              <AppleSegmentedControl segments={[{ value: 'all', label: 'All' }, { value: 'dogs', label: 'Dogs' }, { value: 'cats', label: 'Cats' }]} value={dashboardSegment} onChange={setDashboardSegment} />
            </div>

            <div className="flex gap-4 mb-6 flex-wrap">
              {filteredPetData.map(p => (
                <ContextMenu key={p.id} items={[
                  { id: 'view', label: 'View Profile', icon: <Eye size={14} />, onClick: () => { setCurrentNav('pets'); setPage({ page: 'pet-detail', petId: p.id }) } },
                  { id: 'edit', label: 'Edit', icon: <Edit3 size={14} />, onClick: () => { setCurrentNav('pets'); setPage({ page: 'pet-form', petId: p.id }) } },
                  { id: 'delete', label: 'Remove', icon: <Dog size={14} />, danger: true, onClick: () => {} },
                ]}>
                  <AppleCard padding="sm" hoverable className="w-32 text-center">
                    <AppleAvatar name={p.name} className="mx-auto mb-2" size="lg" />
                    <DynamicType styleLevel="footnote" weight={600}>{p.name}</DynamicType>
                    <DynamicType styleLevel="caption2" >{p.species}</DynamicType>
                  </AppleCard>
                </ContextMenu>
              ))}
            </div>

            <GlassPanel intensity="light" className="mb-8">
              <div className="px-5 pt-4 pb-2"><DynamicType styleLevel="headline">Recent Health Records</DynamicType></div>
              <AppleTable columns={petColumns} data={filteredPetData} keyExtractor={r => r.id} />
            </GlassPanel>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <AppleCard padding="lg">
                <div className="flex items-center justify-between mb-3">
                  <DynamicType styleLevel="subhead">Notifications</DynamicType>
                  <AppleSwitch checked={switchOn} onChange={() => setSwitchOn(!switchOn)} />
                </div>
                <DynamicType styleLevel="caption1" >{switchOn ? 'All notifications enabled' : 'Notifications silenced'}</DynamicType>
              </AppleCard>
              <AppleCard padding="lg">
                <DynamicType styleLevel="subhead" className="mb-2">Appearance</DynamicType>
                <GlassPanel intensity="light" className="p-3 text-center">
                  <DynamicType styleLevel="caption1" >Glass panel with blur effect</DynamicType>
                </GlassPanel>
              </AppleCard>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AppleCard padding="sm" className="!p-0">
                <EmptyState title="No upcoming reminders" description="Add a vaccination or checkup reminder" />
              </AppleCard>
              <AppleCard padding="sm" className="!p-0">
                <ErrorState title="Connection error" message="Could not sync health data" onRetry={() => {}} />
              </AppleCard>
            </div>
          </>
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

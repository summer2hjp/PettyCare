import { RootLayout } from '@/layouts/RootLayout'
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
import { useState } from 'react'
import { Plus, Dog, Eye, Edit3 } from 'lucide-react'

// ---- Demo data ----
interface PetRow {
  id: string; name: string; species: string; breed: string; age: string; status: string
}
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
  { key: 'status', label: 'Status', width: '100px', render: (r) => (
    <span className={`inline-flex items-center gap-1 text-apple-footnote ${r.status === 'Healthy' ? 'text-apple-green' : 'text-apple-orange'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${r.status === 'Healthy' ? 'bg-apple-green' : 'bg-apple-orange'}`} />
      {r.status}
    </span>
  )},
]

export default function App() {
  const [segment, setSegment] = useState('all')
  const [switchOn, setSwitchOn] = useState(false)

  return (
    <RootLayout pageTitle="Dashboard">
      {/* Welcome + Pet count */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <DynamicType styleLevel="title1" weight={700}>Welcome back 👋</DynamicType>
          <DynamicType styleLevel="subhead" color="secondaryLabel">You have 3 pets under your care</DynamicType>
        </div>
        <AppleButton icon={<Plus size={18} />}>Add Pet</AppleButton>
      </div>

      {/* Health overview cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <AppleCard padding="lg" hoverable>
          <div className="flex items-center justify-between mb-3">
            <DynamicType styleLevel="subhead" color="secondaryLabel">Health Score</DynamicType>
            <AppleBadge variant="green" dot />
          </div>
          <div className="flex items-center gap-4">
            <AppleProgressRing progress={0.85} size={64} strokeWidth={5} color="var(--apple-green)">
              <DynamicType styleLevel="footnote" weight={700}>85%</DynamicType>
            </AppleProgressRing>
            <div>
              <DynamicType styleLevel="caption1" color="tertiaryLabel">Overall</DynamicType>
              <DynamicType styleLevel="headline" className="text-apple-green">Excellent</DynamicType>
            </div>
          </div>
        </AppleCard>

        <AppleCard padding="lg" hoverable>
          <div className="flex items-center justify-between mb-3">
            <DynamicType styleLevel="subhead" color="secondaryLabel">Vaccinations</DynamicType>
            <AppleBadge count={2} variant="orange" />
          </div>
          <DynamicType styleLevel="title1" weight={700} className="mb-1">2</DynamicType>
          <DynamicType styleLevel="caption1" color="tertiaryLabel">Upcoming this month</DynamicType>
        </AppleCard>

        <AppleCard padding="lg" hoverable>
          <div className="flex items-center justify-between mb-3">
            <DynamicType styleLevel="subhead" color="secondaryLabel">Appointments</DynamicType>
            <AppleBadge count={1} />
          </div>
          <DynamicType styleLevel="title1" weight={700} className="mb-1">1</DynamicType>
          <DynamicType styleLevel="caption1" color="tertiaryLabel">Vet visit tomorrow</DynamicType>
        </AppleCard>
      </div>

      {/* Section: Pets Overview */}
      <div className="flex items-center justify-between mb-4">
        <DynamicType styleLevel="title3" weight={600}>Your Pets</DynamicType>
        <AppleSegmentedControl
          segments={[{ value: 'all', label: 'All' }, { value: 'dogs', label: 'Dogs' }, { value: 'cats', label: 'Cats' }]}
          value={segment} onChange={setSegment}
        />
      </div>

      {/* Pet avatars row */}
      <div className="flex gap-4 mb-6">
        {petData.map(p => (
          <ContextMenu key={p.id} items={[
            { id: 'view', label: 'View Profile', icon: <Eye size={14} />, onClick: () => {} },
            { id: 'edit', label: 'Edit', icon: <Edit3 size={14} />, onClick: () => {} },
            { id: 'delete', label: 'Remove', icon: <Dog size={14} />, danger: true, onClick: () => {} },
          ]}>
            <AppleCard padding="sm" hoverable className="w-32 text-center">
              <AppleAvatar name={p.name} className="mx-auto mb-2" size="lg" />
              <DynamicType styleLevel="footnote" weight={600}>{p.name}</DynamicType>
              <DynamicType styleLevel="caption2" color="tertiaryLabel">{p.species}</DynamicType>
            </AppleCard>
          </ContextMenu>
        ))}
      </div>

      {/* Glass Panel with table */}
      <GlassPanel intensity="light" className="mb-8">
        <div className="px-5 pt-4 pb-2">
          <DynamicType styleLevel="headline">Recent Health Records</DynamicType>
        </div>
        <AppleTable columns={petColumns} data={petData} keyExtractor={r => r.id} />
      </GlassPanel>

      {/* Feature demo: switch + states */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <AppleCard padding="lg">
          <div className="flex items-center justify-between mb-3">
            <DynamicType styleLevel="subhead">Notifications</DynamicType>
            <AppleSwitch checked={switchOn} onChange={() => setSwitchOn(!switchOn)} />
          </div>
          <DynamicType styleLevel="caption1" color="tertiaryLabel">
            {switchOn ? 'All notifications enabled' : 'Notifications silenced'}
          </DynamicType>
        </AppleCard>

        <AppleCard padding="lg">
          <DynamicType styleLevel="subhead" className="mb-2">Appearance</DynamicType>
          <GlassPanel intensity="light" className="p-3 text-center">
            <DynamicType styleLevel="caption1" color="secondaryLabel">Glass panel with blur effect</DynamicType>
          </GlassPanel>
        </AppleCard>
      </div>

      {/* Empty state & Error state demo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AppleCard padding="sm" className="!p-0">
          <EmptyState title="No upcoming reminders" description="Add a vaccination or checkup reminder" />
        </AppleCard>
        <AppleCard padding="sm" className="!p-0">
          <ErrorState title="Connection error" message="Could not sync health data" onRetry={() => {}} />
        </AppleCard>
      </div>
    </RootLayout>
  )
}

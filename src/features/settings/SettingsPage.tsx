import { useState, useEffect } from 'react'
import { usePets } from '@/store/pet-context'
import { supabase } from '@/lib/supabase'
import { AppleCard } from '@/components/ui/AppleCard'
import { AppleSwitch } from '@/components/ui/AppleSwitch'
import { AppleAvatar } from '@/components/ui/AppleAvatar'
import { DynamicType } from '@/components/ui/DynamicType'
import { ShinyText } from '@/components/ui/ShinyText'
import { cn } from '@/utils/cn'
import { useTheme } from '@/hooks/useTheme'
import { Sun, Moon, Bell, Shield, Palette, ChevronRight, Info, LogOut, Users, UserPlus } from 'lucide-react'

function SettingRow({ icon, label, description, right, onClick, className }: {
  icon: React.ReactNode; label: string; description?: string; right?: React.ReactNode; onClick?: () => void; className?: string
}) {
  return (
    <div onClick={onClick} className={cn('group flex items-center gap-3 px-5 py-2.5 transition-colors duration-150', onClick && 'cursor-pointer', className)}>
      <div className="w-8 h-8 rounded-full bg-[var(--mm-fill)] flex items-center justify-center shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <DynamicType styleLevel="button" weight={600} className="group-hover:text-[var(--mm-link)]">{label}</DynamicType>
        {description && <DynamicType styleLevel="small" color="muted" className="mt-0.5 group-hover:text-[var(--mm-link)]">{description}</DynamicType>}
      </div>
      {right ?? <ChevronRight size={16} className="text-[var(--mm-tertiaryLabel)] group-hover:text-[var(--mm-link)]" />}
    </div>
  )
}

export function SettingsPage() {
  const { pets } = usePets()
  const { theme, toggleTheme } = useTheme()
  const [pushEnabled, setPushEnabled] = useState(true)
  const [emailEnabled, setEmailEnabled] = useState(false)
  const [reminderEnabled, setReminderEnabled] = useState(true)
  const [householdName, setHouseholdName] = useState('')
  const [memberCount, setMemberCount] = useState(0)

  useEffect(() => {
    supabase.from('household_members').select('household_id').limit(1).single()
      .then(({ data: membership }) => {
        if (!membership) return
        supabase.from('households').select('name').eq('id', membership.household_id).single()
          .then(({ data: hh }) => { if (hh) setHouseholdName(hh.name) })
        supabase.from('household_members').select('id', { count: 'exact' }).eq('household_id', membership.household_id)
          .then(({ count }) => setMemberCount(count ?? 0))
      })
  }, [])

  return (
    <div className="max-w-2xl">
      <DynamicType styleLevel="cardTitle" weight={700} className="mb-4">Settings</DynamicType>

      <AppleCard padding="lg" hoverable className="mb-4">
        <div className="group flex items-center gap-4">
          <AppleAvatar name="Owner" size="lg" />
          <div>
            <DynamicType styleLevel="bodyBold" weight={600} className="group-hover:text-[var(--mm-link)]">Pet Parent</DynamicType>
            <DynamicType styleLevel="caption" color="secondary" className="mt-0.5 group-hover:text-[var(--mm-link)]">{pets.length} pets · Premium Member</DynamicType>
          </div>
          <ChevronRight size={18} className="ml-auto text-[var(--mm-tertiaryLabel)] group-hover:text-[var(--mm-link)]" />
        </div>
      </AppleCard>

      <ShinyText text="Appearance" as="div" className="text-mm-body text-[var(--mm-secondaryLabel)] font-semibold mb-2.5 px-1" />
      <AppleCard padding="sm" className="!p-0 divide-y divide-[var(--mm-separator)] mb-4">
        <SettingRow icon={theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />} label="Dark Mode" description={theme === 'dark' ? 'Dark theme active' : 'Switch to dark theme'} right={<AppleSwitch checked={theme === 'dark'} onChange={toggleTheme} />} />
        <SettingRow icon={<Palette size={16} />} label="Accent Color" description="Blue (default)" />
      </AppleCard>

      <AppleCard padding="sm" className="!p-0 mb-4">
        <div className="px-5 pt-4 pb-2">
          <DynamicType styleLevel="bodyBold" weight={600}>Household</DynamicType>
        </div>
        <SettingRow
          icon={<Users size={18} className="text-[var(--mm-link)]" />}
          label={householdName || 'My Household'}
          description={`${memberCount} member${memberCount !== 1 ? 's' : ''}`}
        />
        <SettingRow
          icon={<UserPlus size={18} className="text-[#34C759]" />}
          label="Invite Member"
          description="Share pet management with family"
        />
      </AppleCard>

      <ShinyText text="Notifications" as="div" className="text-mm-body text-[var(--mm-secondaryLabel)] font-semibold mb-2.5 px-1" />
      <AppleCard padding="sm" className="!p-0 divide-y divide-[var(--mm-separator)] mb-4">
        <SettingRow icon={<Bell size={16} />} label="Push Notifications" right={<AppleSwitch checked={pushEnabled} onChange={() => setPushEnabled(!pushEnabled)} />} />
        <SettingRow icon={<Bell size={16} />} label="Email Reminders" right={<AppleSwitch checked={emailEnabled} onChange={() => setEmailEnabled(!emailEnabled)} />} />
        <SettingRow icon={<Bell size={16} />} label="Medication Reminders" right={<AppleSwitch checked={reminderEnabled} onChange={() => setReminderEnabled(!reminderEnabled)} />} />
      </AppleCard>

      <ShinyText text="Privacy" as="div" className="text-mm-body text-[var(--mm-secondaryLabel)] font-semibold mb-2.5 px-1" />
      <AppleCard padding="sm" className="!p-0 divide-y divide-[var(--mm-separator)] mb-4">
        <SettingRow icon={<Shield size={16} />} label="Data Sharing" description="Off" />
        <SettingRow icon={<Shield size={16} />} label="Export Data" />
      </AppleCard>

      <ShinyText text="About" as="div" className="text-mm-body text-[var(--mm-secondaryLabel)] font-semibold mb-2.5 px-1" />
      <AppleCard padding="sm" className="!p-0 divide-y divide-[var(--mm-separator)] mb-4">
        <SettingRow icon={<Info size={16} />} label="Version" right={<DynamicType styleLevel="caption" color="muted">0.1.0</DynamicType>} />
        <SettingRow icon={<Info size={16} />} label="PettyCare" right={<DynamicType styleLevel="caption" color="muted">🐾</DynamicType>} />
      </AppleCard>

      <div className="mt-6 mb-8">
        <button className="w-full flex items-center justify-center gap-2 py-3 rounded-mm-lg bg-[#FF3B30]/5 text-[#FF3B30] text-mm-body font-medium hover:bg-[#FF3B30]/10 transition-colors">
          <LogOut size={18} /> Sign Out
        </button>
      </div>
    </div>
  )
}

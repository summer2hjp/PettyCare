import { useState } from 'react'
import { usePets } from '@/store/pet-context'
import { AppleCard } from '@/components/ui/AppleCard'
import { AppleSwitch } from '@/components/ui/AppleSwitch'
import { AppleAvatar } from '@/components/ui/AppleAvatar'
import { DynamicType } from '@/components/ui/DynamicType'
import { cn } from '@/utils/cn'
import { useTheme } from '@/hooks/useTheme'
import { Sun, Moon, Bell, Shield, Palette, ChevronRight, Info, LogOut } from 'lucide-react'

function SettingRow({ icon, label, description, right, onClick, className }: {
  icon: React.ReactNode; label: string; description?: string; right?: React.ReactNode; onClick?: () => void; className?: string
}) {
  return (
    <div onClick={onClick} className={cn('group flex items-center gap-3 px-5 py-2.5 transition-colors duration-150', onClick && 'cursor-pointer', className)}>
      <div className="w-8 h-8 rounded-full bg-[var(--apple-fill)] flex items-center justify-center shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <DynamicType styleLevel="footnote" weight={600} className="group-hover:text-apple-blue">{label}</DynamicType>
        {description && <DynamicType styleLevel="caption2"  className="mt-0.5 group-hover:text-apple-blue">{description}</DynamicType>}
      </div>
      {right ?? <ChevronRight size={16} className="text-apple-tertiaryLabel group-hover:text-apple-blue" />}
    </div>
  )
}

export function SettingsPage() {
  const { pets } = usePets()
  const { theme, toggleTheme } = useTheme()
  const [pushEnabled, setPushEnabled] = useState(true)
  const [emailEnabled, setEmailEnabled] = useState(false)
  const [reminderEnabled, setReminderEnabled] = useState(true)

  return (
    <div className="max-w-2xl">
      <DynamicType styleLevel="title1" weight={700} className="mb-4">Settings</DynamicType>

      <AppleCard padding="lg" hoverable className="mb-4">
        <div className="group flex items-center gap-4">
          <AppleAvatar name="Owner" size="lg" />
          <div>
            <DynamicType styleLevel="headline" weight={600} className="group-hover:text-apple-blue">Pet Parent</DynamicType>
            <DynamicType styleLevel="caption1"  className="mt-0.5 group-hover:text-apple-blue">{pets.length} pets · Premium Member</DynamicType>
          </div>
          <ChevronRight size={18} className="ml-auto text-apple-tertiaryLabel group-hover:text-apple-blue" />
        </div>
      </AppleCard>

      <DynamicType styleLevel="subhead"  weight={600} className="mb-2.5 px-1">Appearance</DynamicType>
      <AppleCard padding="sm" className="!p-0 divide-y divide-[var(--apple-separator)] mb-4">
        <SettingRow icon={theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />} label="Dark Mode" description={theme === 'dark' ? 'Dark theme active' : 'Switch to dark theme'} right={<AppleSwitch checked={theme === 'dark'} onChange={toggleTheme} />} />
        <SettingRow icon={<Palette size={16} />} label="Accent Color" description="Blue (default)" />
      </AppleCard>

      <DynamicType styleLevel="subhead"  weight={600} className="mb-2.5 px-1">Notifications</DynamicType>
      <AppleCard padding="sm" className="!p-0 divide-y divide-[var(--apple-separator)] mb-4">
        <SettingRow icon={<Bell size={16} />} label="Push Notifications" right={<AppleSwitch checked={pushEnabled} onChange={() => setPushEnabled(!pushEnabled)} />} />
        <SettingRow icon={<Bell size={16} />} label="Email Reminders" right={<AppleSwitch checked={emailEnabled} onChange={() => setEmailEnabled(!emailEnabled)} />} />
        <SettingRow icon={<Bell size={16} />} label="Medication Reminders" right={<AppleSwitch checked={reminderEnabled} onChange={() => setReminderEnabled(!reminderEnabled)} />} />
      </AppleCard>

      <DynamicType styleLevel="subhead"  weight={600} className="mb-2.5 px-1">Privacy</DynamicType>
      <AppleCard padding="sm" className="!p-0 divide-y divide-[var(--apple-separator)] mb-4">
        <SettingRow icon={<Shield size={16} />} label="Data Sharing" description="Off" />
        <SettingRow icon={<Shield size={16} />} label="Export Data" />
      </AppleCard>

      <DynamicType styleLevel="subhead"  weight={600} className="mb-2.5 px-1">About</DynamicType>
      <AppleCard padding="sm" className="!p-0 divide-y divide-[var(--apple-separator)] mb-4">
        <SettingRow icon={<Info size={16} />} label="Version" right={<DynamicType styleLevel="caption1" >0.1.0</DynamicType>} />
        <SettingRow icon={<Info size={16} />} label="PettyCare" right={<DynamicType styleLevel="caption1" >🐾</DynamicType>} />
      </AppleCard>

      <div className="mt-6 mb-8">
        <button className="w-full flex items-center justify-center gap-2 py-3 rounded-apple-xl bg-apple-red/5 text-apple-red text-apple-subhead font-medium hover:bg-apple-red/10 transition-colors">
          <LogOut size={18} /> Sign Out
        </button>
      </div>
    </div>
  )
}

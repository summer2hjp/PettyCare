export type ReminderType = 'medication' | 'vaccination' | 'checkup' | 'feeding' | 'grooming' | 'custom'
export type ReminderPriority = 'low' | 'medium' | 'high'

export interface Reminder {
  id: string
  petId: string
  petName: string
  type: ReminderType
  title: string
  description?: string
  dueDate: string
  priority: ReminderPriority
  isRecurring: boolean
  recurringInterval?: {
    value: number
    unit: 'day' | 'week' | 'month'
  }
  isCompleted: boolean
  completedAt?: string
  createdAt: string
}

export interface ReminderGroup {
  date: string
  reminders: Reminder[]
}

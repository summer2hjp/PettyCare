import { cn } from '@/utils/cn'
import { useEffect, useState } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

type ToastVariant = 'success' | 'error' | 'info' | 'warning'

interface ToastData { id: string; message: string; variant?: ToastVariant; duration?: number }
interface ToastContainerProps { toasts: ToastData[]; onDismiss: (id: string) => void; className?: string }

const iconMap = { success: CheckCircle, error: AlertCircle, info: Info, warning: AlertTriangle }
const variantBorder = { success: 'border-l-apple-green', error: 'border-l-apple-red', info: 'border-l-apple-blue', warning: 'border-l-apple-orange' }

export function ToastItem({ toast, onDismiss }: { toast: ToastData; onDismiss: (id: string) => void }) {
  const [visible, setVisible] = useState(false)
  const Icon = iconMap[toast.variant ?? 'info']

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
    const timer = setTimeout(() => { setVisible(false); setTimeout(() => onDismiss(toast.id), 300) }, toast.duration ?? 4000)
    return () => clearTimeout(timer)
  }, [toast.id, toast.duration, onDismiss])

  return (
    <div className={cn('flex items-start gap-3 px-4 py-3 rounded-apple-xl shadow-apple-lg glass-heavy border-l-4', variantBorder[toast.variant ?? 'info'], 'transition-all duration-300', visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4')}>
      <Icon size={18} className="shrink-0 mt-0.5 text-apple-label" />
      <p className="flex-1 text-apple-subhead text-apple-label">{toast.message}</p>
      <button onClick={() => { onDismiss(toast.id) }} className="text-apple-tertiaryLabel hover:text-apple-label shrink-0"><X size={16} /></button>
    </div>
  )
}

export function ToastContainer({ toasts, onDismiss, className }: ToastContainerProps) {
  return (
    <div className={cn('fixed top-4 right-4 z-[100] flex flex-col gap-2 min-w-[320px] max-w-[420px]', className)}>
      {toasts.map(t => <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />)}
    </div>
  )
}

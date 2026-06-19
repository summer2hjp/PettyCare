import { cn } from '@/utils/cn'
import type { ReactNode, HTMLAttributes } from 'react'

export interface TableColumn<T> {
  key: string
  label: string
  render?: (item: T, index: number) => ReactNode
  width?: string
  align?: 'left' | 'center' | 'right'
}

interface AppleTableProps<T> extends HTMLAttributes<HTMLDivElement> {
  columns: TableColumn<T>[]
  data: T[]
  keyExtractor: (item: T, index: number) => string
  onRowClick?: (item: T) => void
  emptyMessage?: string
}

export function AppleTable<T>({
  columns, data, keyExtractor, onRowClick, emptyMessage = 'No data', className, ...props
}: AppleTableProps<T>) {
  return (
    <div className={cn('mm-inset-group', className)} {...props}>
      {data.length === 0 ? (
        <div className="px-6 py-8 text-center text-mm-body text-[var(--mm-tertiaryLabel)]">{emptyMessage}</div>
      ) : (
        data.map((item, index) => {
          const key = keyExtractor(item, index)
          return (
            <div
              key={key}
              onClick={() => onRowClick?.(item)}
              className={cn('group flex items-center gap-3 px-4 py-3 transition-colors duration-150', onRowClick && 'cursor-pointer')}
            >
              {columns.map(col => (
                <div
                  key={col.key}
                  className={cn('text-mm-caption text-[var(--mm-label)] group-hover:text-[var(--mm-link)] truncate', col.align === 'center' && 'text-center', col.align === 'right' && 'text-right')}
                  style={col.width ? { flex: `0 0 ${col.width}` } : { flex: 1 }}
                >
                  {col.render ? col.render(item, index) : (item as any)[col.key] ?? '-'}
                </div>
              ))}
            </div>
          )
        })
      )}
    </div>
  )
}

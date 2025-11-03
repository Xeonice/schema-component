import { List } from 'lucide-react'
import type { DataRendererProps } from '../../../../types'
import { getFieldOption } from '../../../../lib/fieldUtils'
import { cn } from '../../../../lib/utils'

/**
 * HasMany renderer
 * Renders a list of related records
 */
export function HasManyRenderer({
  value,
  mode = 'view',
  readOnly,
  className,
  field,
}: DataRendererProps) {
  const records = Array.isArray(value) ? value : []
  const displayField = getFieldOption(field, 'displayField', 'name') || 'name'

  // View mode - display as list
  if (mode === 'view' || readOnly) {
    if (records.length === 0) {
      return <span className={cn('text-sm text-muted-foreground', className)}>-</span>
    }

    return (
      <div className={cn('space-y-1', className)}>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <List className="h-3 w-3" />
          <span>{records.length} items</span>
        </div>
        <ul className="space-y-1 text-sm">
          {records.slice(0, 5).map((record, index) => {
            const displayValue = typeof record === 'object'
              ? (record as any)[displayField] || (record as any).id || String(record)
              : String(record)

            return (
              <li key={index} className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span className="flex-1">{displayValue}</span>
              </li>
            )
          })}
          {records.length > 5 && (
            <li className="text-xs text-muted-foreground">
              +{records.length - 5} more
            </li>
          )}
        </ul>
      </div>
    )
  }

  // Edit mode - would typically use a multi-select
  // For now, display as read-only
  return (
    <div className={cn('space-y-1', className)}>
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <List className="h-3 w-3" />
        <span>{records.length} items</span>
      </div>
    </div>
  )
}

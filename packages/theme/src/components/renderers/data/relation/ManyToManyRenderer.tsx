import { Network } from 'lucide-react'
import type { DataRendererProps } from '../../../../types'
import { getFieldOption } from '../../../../lib/fieldUtils'
import { cn } from '../../../../lib/utils'

/**
 * ManyToMany renderer
 * Renders many-to-many relationships as tags
 */
export function ManyToManyRenderer({
  value,
  mode = 'view',
  readOnly,
  className,
  field,
}: DataRendererProps) {
  const records = Array.isArray(value) ? value : []
  const displayField = getFieldOption(field, 'displayField', 'name') || 'name'

  // View mode - display as tags
  if (mode === 'view' || readOnly) {
    if (records.length === 0) {
      return <span className={cn('text-sm text-muted-foreground', className)}>-</span>
    }

    return (
      <div className={cn('space-y-2', className)}>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Network className="h-3 w-3" />
          <span>{records.length} relations</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {records.slice(0, 10).map((record, index) => {
            const displayValue = typeof record === 'object'
              ? (record as any)[displayField] || (record as any).id || String(record)
              : String(record)

            return (
              <span
                key={index}
                className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
              >
                {displayValue}
              </span>
            )
          })}
          {records.length > 10 && (
            <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              +{records.length - 10} more
            </span>
          )}
        </div>
      </div>
    )
  }

  // Edit mode - would typically use a tag selector
  // For now, display as read-only
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <Network className="h-3 w-3" />
        <span>{records.length} relations</span>
      </div>
    </div>
  )
}

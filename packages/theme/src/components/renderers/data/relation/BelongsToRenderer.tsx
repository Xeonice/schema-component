import { Link } from 'lucide-react'
import type { DataRendererProps } from '../../../../types'
import { getFieldOption } from '../../../../lib/fieldUtils'
import { cn } from '../../../../lib/utils'

/**
 * BelongsTo renderer
 * Renders a single related record reference
 */
export function BelongsToRenderer({
  value,
  mode = 'view',
  readOnly,
  className,
  field,
}: DataRendererProps) {
  // Value could be an ID, object with ID, or object with display field
  const displayField = getFieldOption(field, 'displayField', 'name') || 'name'

  let displayValue: string
  let recordId: any

  if (value == null) {
    displayValue = '-'
    recordId = null
  } else if (typeof value === 'object') {
    displayValue = (value as any)[displayField] || (value as any).id || String(value)
    recordId = (value as any).id
  } else {
    displayValue = String(value)
    recordId = value
  }

  // View mode - display as link or text
  if (mode === 'view' || readOnly) {
    if (!recordId) {
      return <span className={cn('text-sm text-muted-foreground', className)}>-</span>
    }

    return (
      <span className={cn('inline-flex items-center gap-1 text-sm', className)}>
        <Link className="h-3 w-3" />
        <span>{displayValue}</span>
      </span>
    )
  }

  // Edit mode - would typically use a select/autocomplete
  // For now, display as read-only in edit mode
  return (
    <span className={cn('inline-flex items-center gap-1 text-sm', className)}>
      <Link className="h-3 w-3" />
      <span>{displayValue}</span>
    </span>
  )
}

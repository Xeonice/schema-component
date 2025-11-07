import { format, parseISO } from 'date-fns'
import { Calendar } from 'lucide-react'
import { Input } from '../../../../components/ui/input'
import type { DataRendererProps } from '../../../../types'
import { getFieldOption } from '../../../../lib/fieldUtils'
import { cn } from '../../../../lib/utils'

/**
 * Date renderer
 * Renders date values
 */
export function DateRenderer({
  value,
  onChange,
  mode = 'view',
  disabled,
  readOnly,
  className,
  error,
  field,
}: DataRendererProps) {
  // Parse date value
  let dateValue: Date | null = null
  if (value) {
    try {
      dateValue = typeof value === 'string' ? parseISO(value) : new Date(value)
    } catch {
      dateValue = null
    }
  }

  const dateFormat = (getFieldOption(field, 'format', 'MMM dd, yyyy')) || 'MMM dd, yyyy'

  // View mode - display as formatted date
  if (mode === 'view' || readOnly) {
    if (!dateValue) {
      return <span className={cn('text-sm text-muted-foreground', className)}>-</span>
    }

    const formatted = format(dateValue, dateFormat)

    return (
      <span className={cn('inline-flex items-center gap-1 text-sm', className)}>
        <Calendar className="h-3 w-3" />
        {formatted}
      </span>
    )
  }

  // Edit mode - display as date input
  const inputValue = dateValue ? format(dateValue, 'yyyy-MM-dd') : ''

  return (
    <div className="space-y-1">
      <Input
        type="date"
        value={inputValue}
        onChange={(e) => {
          const val = e.target.value
          onChange?.(val ? new Date(val).toISOString() : null)
        }}
        disabled={disabled}
        className={cn(error && 'border-destructive', className)}
      />
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  )
}

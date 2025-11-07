import { Clock } from 'lucide-react'
import { formatDistanceToNow, parseISO, isValid } from 'date-fns'
import { Input } from '../../../../components/ui/input'
import type { DataRendererProps } from '../../../../types'
import { getFieldOption } from '../../../../lib/fieldUtils'
import { cn } from '../../../../lib/utils'

/**
 * Relative time renderer
 * Renders date/time as relative time (e.g., "2 hours ago")
 */
export function RelativeTimeRenderer({
  value,
  onChange,
  mode = 'view',
  disabled,
  readOnly,
  className,
  error,
  field,
}: DataRendererProps) {
  // Parse the date value
  let dateValue: Date | null = null
  if (value) {
    if (value instanceof Date) {
      dateValue = value
    } else if (typeof value === 'string') {
      dateValue = parseISO(value)
    } else if (typeof value === 'number') {
      dateValue = new Date(value)
    }
  }

  const isValidDate = dateValue && isValid(dateValue)

  // View mode - display as relative time
  if (mode === 'view' || readOnly) {
    if (!isValidDate) {
      return <span className={cn('text-sm text-muted-foreground', className)}>-</span>
    }

    const addSuffix = getFieldOption(field, 'addSuffix', true)
    const relativeTime = formatDistanceToNow(dateValue!, { addSuffix })

    return (
      <span className={cn('inline-flex items-center gap-1 text-sm', className)}>
        <Clock className="h-3 w-3" />
        {relativeTime}
      </span>
    )
  }

  // Edit mode - display as datetime-local input
  const inputValue = isValidDate
    ? dateValue!.toISOString().slice(0, 16)
    : ''

  return (
    <div className="space-y-1">
      <Input
        type="datetime-local"
        value={inputValue}
        onChange={(e) => {
          const val = e.target.value
          if (val) {
            onChange?.(new Date(val).toISOString())
          } else {
            onChange?.(null)
          }
        }}
        disabled={disabled}
        className={cn(error && 'border-destructive', className)}
        placeholder={getFieldOption(field, 'placeholder')}
      />
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  )
}

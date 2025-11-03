import { format, isValid } from 'date-fns'
import { Clock } from 'lucide-react'
import { Input } from '../../../../components/ui/input'
import type { DataRendererProps } from '../../../../types'
import { getFieldOption } from '../../../../lib/fieldUtils'
import { cn } from '../../../../lib/utils'

/**
 * Timestamp renderer
 * Renders Unix timestamp values
 */
export function TimestampRenderer({
  value,
  onChange,
  mode = 'view',
  disabled,
  readOnly,
  className,
  error,
  field,
}: DataRendererProps) {
  // Parse timestamp value (Unix timestamp in milliseconds or seconds)
  let dateValue: Date | null = null
  if (value != null) {
    const numValue = typeof value === 'string' ? parseInt(value, 10) : Number(value)
    // If timestamp is in seconds (< 10000000000), convert to milliseconds
    const timestamp = numValue < 10000000000 ? numValue * 1000 : numValue
    dateValue = new Date(timestamp)
  }

  const isValidDate = dateValue && isValid(dateValue)
  const dateFormat = getFieldOption(field, 'format', 'MMM dd, yyyy HH:mm:ss')

  // View mode - display as formatted timestamp
  if (mode === 'view' || readOnly) {
    if (!isValidDate) {
      return <span className={cn('text-sm text-muted-foreground', className)}>-</span>
    }

    const formatted = format(dateValue!, dateFormat || 'MMM dd, yyyy HH:mm:ss')

    return (
      <span className={cn('inline-flex items-center gap-1 text-sm font-mono', className)}>
        <Clock className="h-3 w-3" />
        {formatted}
        <span className="text-xs text-muted-foreground ml-1">
          ({Math.floor(dateValue!.getTime() / 1000)})
        </span>
      </span>
    )
  }

  // Edit mode - display as datetime-local input
  const inputValue = isValidDate ? dateValue!.toISOString().slice(0, 16) : ''

  return (
    <div className="space-y-1">
      <Input
        type="datetime-local"
        value={inputValue}
        onChange={(e) => {
          const val = e.target.value
          if (val) {
            const timestamp = Math.floor(new Date(val).getTime() / 1000)
            onChange?.(timestamp)
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

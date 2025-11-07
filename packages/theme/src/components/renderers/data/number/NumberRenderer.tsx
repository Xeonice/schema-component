import { Input } from '../../../../components/ui/input'
import type { DataRendererProps } from '../../../../types'
import { getFieldOption } from '../../../../lib/fieldUtils'
import { cn } from '../../../../lib/utils'

/**
 * Number renderer
 * Renders numeric values
 */
export function NumberRenderer({
  value,
  onChange,
  mode = 'view',
  disabled,
  readOnly,
  className,
  error,
  field,
}: DataRendererProps) {
  const numValue = value != null ? Number(value) : null
  const displayValue = numValue != null ? numValue.toString() : ''

  // View mode - display as formatted number
  if (mode === 'view' || readOnly) {
    if (numValue == null) {
      return <span className={cn('text-sm text-muted-foreground', className)}>-</span>
    }

    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: getFieldOption(field, 'decimalPlaces', 2) || 0,
      maximumFractionDigits: getFieldOption(field, 'decimalPlaces', 2) || 2,
    }).format(numValue)

    return <span className={cn('text-sm tabular-nums', className)}>{formatted}</span>
  }

  // Edit mode - display as number input
  return (
    <div className="space-y-1">
      <Input
        type="number"
        value={displayValue}
        onChange={(e) => {
          const val = e.target.value
          onChange?.(val === '' ? null : Number(val))
        }}
        disabled={disabled}
        className={cn(error && 'border-destructive', 'tabular-nums', className)}
        placeholder={getFieldOption(field, 'placeholder')}
        min={getFieldOption(field, 'min')}
        max={getFieldOption(field, 'max')}
        step={getFieldOption(field, 'step')}
      />
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  )
}

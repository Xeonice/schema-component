import { Percent } from 'lucide-react'
import { Input } from '../../../../components/ui/input'
import type { DataRendererProps } from '../../../../types'
import { getFieldOption } from '../../../../lib/fieldUtils'
import { cn } from '../../../../lib/utils'

/**
 * Percent renderer
 * Renders percentage values
 */
export function PercentRenderer({
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

  // View mode - display as formatted percentage
  if (mode === 'view' || readOnly) {
    if (numValue == null) {
      return <span className={cn('text-sm text-muted-foreground', className)}>-</span>
    }

    const formatted = new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: getFieldOption(field, 'decimalPlaces', 2) || 0,
      maximumFractionDigits: getFieldOption(field, 'decimalPlaces', 2) || 2,
    }).format(numValue / 100)

    return (
      <span className={cn('inline-flex items-center gap-1 text-sm tabular-nums', className)}>
        <Percent className="h-3 w-3" />
        {formatted}
      </span>
    )
  }

  // Edit mode - display as number input with percent symbol
  return (
    <div className="space-y-1">
      <div className="relative">
        <Input
          type="number"
          value={displayValue}
          onChange={(e) => {
            const val = e.target.value
            onChange?.(val === '' ? null : Number(val))
          }}
          disabled={disabled}
          className={cn(error && 'border-destructive', 'pr-10 tabular-nums', className)}
          placeholder="0"
          step={getFieldOption(field, 'step') || 0.1}
          min={getFieldOption(field, 'min') || 0}
          max={getFieldOption(field, 'max') || 100}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          <Percent className="h-4 w-4" />
        </div>
      </div>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  )
}

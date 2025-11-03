import { DollarSign } from 'lucide-react'
import { Input } from '../../../../components/ui/input'
import type { DataRendererProps } from '../../../../types'
import { getFieldOption } from '../../../../lib/fieldUtils'
import { cn } from '../../../../lib/utils'

/**
 * Currency renderer
 * Renders currency values
 */
export function CurrencyRenderer({
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
  const currency = (getFieldOption(field, 'currency', 'USD')) || 'USD'

  // View mode - display as formatted currency
  if (mode === 'view' || readOnly) {
    if (numValue == null) {
      return <span className={cn('text-sm text-muted-foreground', className)}>-</span>
    }

    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(numValue)

    return (
      <span className={cn('inline-flex items-center gap-1 text-sm tabular-nums', className)}>
        <DollarSign className="h-3 w-3" />
        {formatted}
      </span>
    )
  }

  // Edit mode - display as number input with currency symbol
  return (
    <div className="space-y-1">
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          <DollarSign className="h-4 w-4" />
        </div>
        <Input
          type="number"
          value={displayValue}
          onChange={(e) => {
            const val = e.target.value
            onChange?.(val === '' ? null : Number(val))
          }}
          disabled={disabled}
          className={cn(error && 'border-destructive', 'pl-10 tabular-nums', className)}
          placeholder="0.00"
          step="0.01"
          min={getFieldOption(field, 'min')}
          max={getFieldOption(field, 'max')}
        />
      </div>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  )
}

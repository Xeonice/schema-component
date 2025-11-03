import { Input } from '../../../../components/ui/input'
import type { DataRendererProps } from '../../../../types'
import { getFieldOption } from '../../../../lib/fieldUtils'
import { cn } from '../../../../lib/utils'

/**
 * Text renderer
 * Renders string as plain text or input
 */
export function TextRenderer({
  value,
  onChange,
  mode = 'view',
  disabled,
  readOnly,
  className,
  error,
  field,
}: DataRendererProps) {
  const displayValue = value ?? ''

  // View mode - display as text
  if (mode === 'view' || readOnly) {
    return (
      <span className={cn('text-sm', className)}>
        {displayValue || '-'}
      </span>
    )
  }

  // Edit mode - display as input
  return (
    <div className="space-y-1">
      <Input
        type="text"
        value={displayValue}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        className={cn(error && 'border-destructive', className)}
        placeholder={getFieldOption(field, 'placeholder')}
        maxLength={getFieldOption(field, 'maxLength')}
      />
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  )
}

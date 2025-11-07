import { Phone } from 'lucide-react'
import { Input } from '../../../../components/ui/input'
import type { DataRendererProps } from '../../../../types'
import { getFieldOption } from '../../../../lib/fieldUtils'
import { cn } from '../../../../lib/utils'

/**
 * Phone renderer
 * Renders phone number with tel link in view mode
 */
export function PhoneRenderer({
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

  // View mode - display as tel link
  if (mode === 'view' || readOnly) {
    if (!displayValue) {
      return <span className={cn('text-sm text-muted-foreground', className)}>-</span>
    }

    return (
      <a
        href={`tel:${displayValue}`}
        className={cn(
          'inline-flex items-center gap-1 text-sm text-primary hover:underline',
          className
        )}
      >
        <Phone className="h-3 w-3" />
        {displayValue}
      </a>
    )
  }

  // Edit mode - display as tel input
  return (
    <div className="space-y-1">
      <Input
        type="tel"
        value={displayValue}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        className={cn(error && 'border-destructive', className)}
        placeholder={getFieldOption(field, 'placeholder') || '+1 (555) 000-0000'}
      />
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  )
}

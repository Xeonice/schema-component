import { Mail } from 'lucide-react'
import { Input } from '../../../../components/ui/input'
import type { DataRendererProps } from '../../../../types'
import { getFieldOption } from '../../../../lib/fieldUtils'
import { cn } from '../../../../lib/utils'

/**
 * Email renderer
 * Renders email with mailto link in view mode
 */
export function EmailRenderer({
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

  // View mode - display as mailto link
  if (mode === 'view' || readOnly) {
    if (!displayValue) {
      return <span className={cn('text-sm text-muted-foreground', className)}>-</span>
    }

    return (
      <a
        href={`mailto:${displayValue}`}
        className={cn(
          'inline-flex items-center gap-1 text-sm text-primary hover:underline',
          className
        )}
      >
        <Mail className="h-3 w-3" />
        {displayValue}
      </a>
    )
  }

  // Edit mode - display as email input
  return (
    <div className="space-y-1">
      <Input
        type="email"
        value={displayValue}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        className={cn(error && 'border-destructive', className)}
        placeholder={getFieldOption(field, 'placeholder') || 'email@example.com'}
      />
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  )
}

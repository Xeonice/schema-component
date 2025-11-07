import { ExternalLink } from 'lucide-react'
import { Input } from '../../../../components/ui/input'
import type { DataRendererProps } from '../../../../types'
import { getFieldOption } from '../../../../lib/fieldUtils'
import { cn } from '../../../../lib/utils'

/**
 * URL renderer
 * Renders URL as clickable link in view mode
 */
export function UrlRenderer({
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

  // View mode - display as external link
  if (mode === 'view' || readOnly) {
    if (!displayValue) {
      return <span className={cn('text-sm text-muted-foreground', className)}>-</span>
    }

    return (
      <a
        href={displayValue}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          'inline-flex items-center gap-1 text-sm text-primary hover:underline',
          className
        )}
      >
        {displayValue}
        <ExternalLink className="h-3 w-3" />
      </a>
    )
  }

  // Edit mode - display as url input
  return (
    <div className="space-y-1">
      <Input
        type="url"
        value={displayValue}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        className={cn(error && 'border-destructive', className)}
        placeholder={getFieldOption(field, 'placeholder') || 'https://example.com'}
      />
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  )
}

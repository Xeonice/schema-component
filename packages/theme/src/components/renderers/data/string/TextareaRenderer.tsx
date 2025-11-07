import { Textarea } from '../../../../components/ui/textarea'
import type { DataRendererProps } from '../../../../types'
import { getFieldOption } from '../../../../lib/fieldUtils'
import { cn } from '../../../../lib/utils'

/**
 * Textarea renderer
 * Renders multi-line text
 */
export function TextareaRenderer({
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

  // View mode - display as pre-formatted text
  if (mode === 'view' || readOnly) {
    return (
      <pre className={cn('whitespace-pre-wrap text-sm font-sans', className)}>
        {displayValue || '-'}
      </pre>
    )
  }

  // Edit mode - display as textarea
  return (
    <div className="space-y-1">
      <Textarea
        value={displayValue}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        className={cn(error && 'border-destructive', className)}
        placeholder={getFieldOption(field, 'placeholder')}
        rows={getFieldOption(field, 'rows', 4) || 4}
        maxLength={getFieldOption(field, 'maxLength')}
      />
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  )
}

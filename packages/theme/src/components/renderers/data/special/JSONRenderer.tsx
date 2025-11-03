import { Textarea } from '../../../../components/ui/textarea'
import type { DataRendererProps } from '../../../../types'
import { cn } from '../../../../lib/utils'
import { useState } from 'react'

/**
 * JSON renderer
 * Renders JSON data with syntax highlighting
 */
export function JSONRenderer({
  value,
  onChange,
  mode = 'view',
  disabled,
  readOnly,
  className,
  error,
}: DataRendererProps) {
  const [jsonError, setJsonError] = useState<string | null>(null)

  // View mode - display formatted JSON
  if (mode === 'view' || readOnly) {
    if (value == null) {
      return <span className={cn('text-sm text-muted-foreground', className)}>-</span>
    }

    const formatted = JSON.stringify(value, null, 2)

    return (
      <pre
        className={cn(
          'rounded-md border bg-muted p-3 text-xs font-mono overflow-x-auto max-h-96',
          className
        )}
      >
        <code>{formatted}</code>
      </pre>
    )
  }

  // Edit mode - JSON input with validation
  const handleChange = (text: string) => {
    try {
      const parsed = JSON.parse(text)
      onChange?.(parsed)
      setJsonError(null)
    } catch (err) {
      setJsonError(err instanceof Error ? err.message : 'Invalid JSON')
    }
  }

  const displayValue = value != null ? JSON.stringify(value, null, 2) : ''

  return (
    <div className="space-y-1">
      <Textarea
        value={displayValue}
        onChange={(e) => handleChange(e.target.value)}
        disabled={disabled}
        className={cn(
          error || jsonError ? 'border-destructive' : '',
          'font-mono text-xs',
          className
        )}
        placeholder="{}"
        rows={10}
      />
      {(error || jsonError) && (
        <p className="text-sm text-destructive">{error || jsonError}</p>
      )}
    </div>
  )
}

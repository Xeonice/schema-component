import { Textarea } from '../../../../components/ui/textarea'
import type { DataRendererProps } from '../../../../types'
import { cn } from '../../../../lib/utils'

/**
 * Object renderer
 * Renders object values as key-value pairs
 */
export function ObjectRenderer({
  value,
  onChange,
  mode = 'view',
  disabled,
  readOnly,
  className,
  error,
}: DataRendererProps) {
  const objValue = value && typeof value === 'object' && !Array.isArray(value) ? value : {}
  const entries = Object.entries(objValue)

  // View mode - display as key-value list
  if (mode === 'view' || readOnly) {
    if (entries.length === 0) {
      return <span className={cn('text-sm text-muted-foreground', className)}>-</span>
    }

    return (
      <dl className={cn('space-y-2 text-sm', className)}>
        {entries.map(([key, val]) => (
          <div key={key} className="flex gap-2">
            <dt className="font-medium text-muted-foreground min-w-[100px]">{key}:</dt>
            <dd className="flex-1">{String(val)}</dd>
          </div>
        ))}
      </dl>
    )
  }

  // Edit mode - display as textarea for JSON input
  const handleChange = (text: string) => {
    try {
      const parsed = JSON.parse(text)
      if (typeof parsed === 'object' && !Array.isArray(parsed)) {
        onChange?.(parsed)
      }
    } catch {
      // Invalid JSON, ignore
    }
  }

  return (
    <div className="space-y-1">
      <Textarea
        value={JSON.stringify(objValue, null, 2)}
        onChange={(e) => handleChange(e.target.value)}
        disabled={disabled}
        className={cn(error && 'border-destructive', 'font-mono text-xs', className)}
        placeholder="{}"
        rows={Math.min(entries.length + 2, 10)}
      />
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  )
}

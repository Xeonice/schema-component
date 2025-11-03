import { Plus, X } from 'lucide-react'
import { Textarea } from '../../../../components/ui/textarea'
import type { DataRendererProps } from '../../../../types'
import { cn } from '../../../../lib/utils'

/**
 * Array renderer
 * Renders array values
 */
export function ArrayRenderer({
  value,
  onChange,
  mode = 'view',
  disabled,
  readOnly,
  className,
  error,
}: DataRendererProps) {
  const arrayValue = Array.isArray(value) ? value : []

  // View mode - display as list
  if (mode === 'view' || readOnly) {
    if (arrayValue.length === 0) {
      return <span className={cn('text-sm text-muted-foreground', className)}>-</span>
    }

    return (
      <ul className={cn('space-y-1 text-sm', className)}>
        {arrayValue.map((item, index) => (
          <li key={index} className="flex items-start gap-2">
            <span className="text-muted-foreground">•</span>
            <span className="flex-1">{String(item)}</span>
          </li>
        ))}
      </ul>
    )
  }

  // Edit mode - display as textarea for JSON input
  const handleChange = (text: string) => {
    try {
      const parsed = JSON.parse(text)
      if (Array.isArray(parsed)) {
        onChange?.(parsed)
      }
    } catch {
      // Invalid JSON, ignore
    }
  }

  return (
    <div className="space-y-1">
      <Textarea
        value={JSON.stringify(arrayValue, null, 2)}
        onChange={(e) => handleChange(e.target.value)}
        disabled={disabled}
        className={cn(error && 'border-destructive', 'font-mono text-xs', className)}
        placeholder="[]"
        rows={Math.min(arrayValue.length + 2, 10)}
      />
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  )
}

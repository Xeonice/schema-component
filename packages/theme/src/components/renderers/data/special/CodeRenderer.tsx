import { Code } from 'lucide-react'
import { Textarea } from '../../../../components/ui/textarea'
import type { DataRendererProps } from '../../../../types'
import { getFieldOption } from '../../../../lib/fieldUtils'
import { cn } from '../../../../lib/utils'

/**
 * Code renderer
 * Renders code with syntax highlighting
 */
export function CodeRenderer({
  value,
  onChange,
  mode = 'view',
  disabled,
  readOnly,
  className,
  error,
  field,
}: DataRendererProps) {
  const codeValue = value != null ? String(value) : ''
  const language = getFieldOption(field, 'language', 'javascript')

  // View mode - display formatted code
  if (mode === 'view' || readOnly) {
    if (!codeValue) {
      return <span className={cn('text-sm text-muted-foreground', className)}>-</span>
    }

    return (
      <div className={cn('relative', className)}>
        <div className="absolute top-2 right-2 flex items-center gap-2 text-xs text-muted-foreground">
          <Code className="h-3 w-3" />
          <span>{language}</span>
        </div>
        <pre className="rounded-md border bg-muted p-3 text-xs font-mono overflow-x-auto max-h-96 pt-8">
          <code>{codeValue}</code>
        </pre>
      </div>
    )
  }

  // Edit mode - code input
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
        <Code className="h-3 w-3" />
        <span>{language}</span>
      </div>
      <Textarea
        value={codeValue}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        className={cn(error && 'border-destructive', 'font-mono text-xs', className)}
        placeholder={getFieldOption(field, 'placeholder', '// Enter code here...')}
        rows={15}
      />
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  )
}

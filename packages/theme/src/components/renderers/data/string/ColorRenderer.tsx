import { Input } from '../../../../components/ui/input'
import type { DataRendererProps } from '../../../../types'
import { getFieldOption } from '../../../../lib/fieldUtils'
import { cn } from '../../../../lib/utils'

/**
 * Color renderer
 * Renders color picker
 */
export function ColorRenderer({
  value,
  onChange,
  mode = 'view',
  disabled,
  readOnly,
  className,
  error,
}: DataRendererProps) {
  const displayValue = value ?? '#000000'

  // View mode - display as color swatch with hex value
  if (mode === 'view' || readOnly) {
    return (
      <div className={cn('inline-flex items-center gap-2', className)}>
        <div
          className="h-6 w-6 rounded border border-input"
          style={{ backgroundColor: displayValue }}
        />
        <span className="text-sm font-mono">{displayValue}</span>
      </div>
    )
  }

  // Edit mode - display as color input
  return (
    <div className="space-y-1">
      <div className="flex gap-2">
        <input
          type="color"
          value={displayValue}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
          className="h-10 w-14 cursor-pointer rounded border border-input disabled:cursor-not-allowed disabled:opacity-50"
        />
        <Input
          type="text"
          value={displayValue}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
          className={cn(error && 'border-destructive', 'font-mono', className)}
          pattern="^#[0-9A-Fa-f]{6}$"
        />
      </div>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  )
}

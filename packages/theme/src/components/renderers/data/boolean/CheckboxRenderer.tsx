import { Check, X } from 'lucide-react'
import { Checkbox } from '../../../../components/ui/checkbox'
import type { DataRendererProps } from '../../../../types'
import { getFieldOption } from '../../../../lib/fieldUtils'
import { cn } from '../../../../lib/utils'

/**
 * Checkbox renderer
 * Renders boolean as checkbox
 */
export function CheckboxRenderer({
  value,
  onChange,
  mode = 'view',
  disabled,
  readOnly,
  className,
}: DataRendererProps) {
  const boolValue = Boolean(value)

  // View mode - display as icon
  if (mode === 'view' || readOnly) {
    return (
      <div className={cn('inline-flex items-center', className)}>
        {boolValue ? (
          <Check className="h-4 w-4 text-green-600" />
        ) : (
          <X className="h-4 w-4 text-red-600" />
        )}
      </div>
    )
  }

  // Edit mode - display as checkbox
  return (
    <Checkbox
      checked={boolValue}
      onCheckedChange={(checked) => onChange?.(checked)}
      disabled={disabled}
      className={className}
    />
  )
}

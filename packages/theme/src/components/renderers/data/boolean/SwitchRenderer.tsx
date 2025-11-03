import { Check, X } from 'lucide-react'
import { Switch } from '../../../../components/ui/switch'
import type { DataRendererProps } from '../../../../types'
import { cn } from '../../../../lib/utils'

/**
 * Switch renderer
 * Renders boolean as toggle switch
 */
export function SwitchRenderer({
  value,
  onChange,
  mode = 'view',
  disabled,
  readOnly,
  className,
}: DataRendererProps) {
  const boolValue = Boolean(value)

  // View mode - display as badge
  if (mode === 'view' || readOnly) {
    return (
      <div className={cn('inline-flex items-center gap-2', className)}>
        <div
          className={cn(
            'flex h-6 w-11 items-center justify-center rounded-full px-2 text-xs font-medium',
            boolValue
              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
          )}
        >
          {boolValue ? (
            <Check className="h-3 w-3" />
          ) : (
            <X className="h-3 w-3" />
          )}
        </div>
      </div>
    )
  }

  // Edit mode - display as switch
  return (
    <Switch
      checked={boolValue}
      onCheckedChange={(checked) => onChange?.(checked)}
      disabled={disabled}
      className={className}
    />
  )
}

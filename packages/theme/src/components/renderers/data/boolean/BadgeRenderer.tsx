import { Check, X } from 'lucide-react'
import type { DataRendererProps } from '../../../../types'
import { getFieldOption } from '../../../../lib/fieldUtils'
import { cn } from '../../../../lib/utils'

/**
 * Badge renderer
 * Renders boolean as colored badge
 */
export function BadgeRenderer({
  value,
  onChange,
  mode = 'view',
  disabled,
  readOnly,
  className,
  field,
}: DataRendererProps) {
  const boolValue = Boolean(value)
  const trueLabel = getFieldOption(field, 'trueLabel', 'Yes')
  const falseLabel = getFieldOption(field, 'falseLabel', 'No')

  // View mode - display as badge
  if (mode === 'view' || readOnly) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium',
          boolValue
            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
            : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
          className
        )}
      >
        {boolValue ? (
          <>
            <Check className="h-3 w-3" />
            {trueLabel}
          </>
        ) : (
          <>
            <X className="h-3 w-3" />
            {falseLabel}
          </>
        )}
      </span>
    )
  }

  // Edit mode - display as toggle buttons
  return (
    <div className={cn('inline-flex rounded-md shadow-sm', className)} role="group">
      <button
        type="button"
        onClick={() => onChange?.(true)}
        disabled={disabled}
        className={cn(
          'rounded-l-md border border-gray-300 px-4 py-2 text-sm font-medium',
          boolValue
            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
            : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700',
          disabled && 'cursor-not-allowed opacity-50'
        )}
      >
        <Check className="inline h-4 w-4 mr-1" />
        {trueLabel}
      </button>
      <button
        type="button"
        onClick={() => onChange?.(false)}
        disabled={disabled}
        className={cn(
          'rounded-r-md border border-l-0 border-gray-300 px-4 py-2 text-sm font-medium',
          !boolValue
            ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
            : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700',
          disabled && 'cursor-not-allowed opacity-50'
        )}
      >
        <X className="inline h-4 w-4 mr-1" />
        {falseLabel}
      </button>
    </div>
  )
}

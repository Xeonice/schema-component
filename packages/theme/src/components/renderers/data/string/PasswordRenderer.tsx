import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { Input } from '../../../../components/ui/input'
import type { DataRendererProps } from '../../../../types'
import { getFieldOption } from '../../../../lib/fieldUtils'
import { cn } from '../../../../lib/utils'

/**
 * Password renderer
 * Renders password with toggle visibility
 */
export function PasswordRenderer({
  value,
  onChange,
  mode = 'view',
  disabled,
  readOnly,
  className,
  error,
  field,
}: DataRendererProps) {
  const [showPassword, setShowPassword] = useState(false)
  const displayValue = value ?? ''

  // View mode - display as masked text
  if (mode === 'view' || readOnly) {
    return (
      <span className={cn('text-sm', className)}>
        {displayValue ? '••••••••' : '-'}
      </span>
    )
  }

  // Edit mode - display as password input with toggle
  return (
    <div className="space-y-1">
      <div className="relative">
        <Input
          type={showPassword ? 'text' : 'password'}
          value={displayValue}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
          className={cn(error && 'border-destructive pr-10', className)}
          placeholder={getFieldOption(field, 'placeholder')}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          tabIndex={-1}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  )
}

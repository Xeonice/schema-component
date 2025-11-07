import { Loader2 } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import type { ActionRendererProps } from '../../../types'
import { cn } from '../../../lib/utils'

/**
 * Button action renderer
 * Renders action as a button with variants
 */
export function ButtonActionRenderer({
  action,
  onClick,
  disabled,
  loading,
  className,
}: ActionRendererProps) {
  const variant = 'default'
  const size = 'default'
  const icon = action.icon

  return (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(className)}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {icon && !loading && <span className="mr-2">{icon}</span>}
      {action.label}
    </Button>
  )
}

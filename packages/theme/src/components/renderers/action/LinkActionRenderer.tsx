import { ExternalLink } from 'lucide-react'
import type { ActionRendererProps } from '../../../types'
import { cn } from '../../../lib/utils'

/**
 * Link action renderer
 * Renders action as a link
 */
export function LinkActionRenderer({
  action,
  onClick,
  disabled,
  className,
}: ActionRendererProps) {
  const href = '#'
  const external = false

  if (disabled) {
    return (
      <span className={cn('text-sm text-muted-foreground', className)}>
        {action.label}
      </span>
    )
  }

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault()
      onClick()
    }
  }

  return (
    <a
      href={href}
      onClick={handleClick}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className={cn(
        'inline-flex items-center gap-1 text-sm text-primary hover:underline',
        className
      )}
    >
      {action.label}
      {external && <ExternalLink className="h-3 w-3" />}
    </a>
  )
}

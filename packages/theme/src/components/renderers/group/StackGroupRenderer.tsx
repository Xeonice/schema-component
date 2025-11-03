import type { GroupRendererProps } from '../../../types'
import { cn } from '../../../lib/utils'

/**
 * Stack group renderer
 * Renders fields in a vertical stack layout
 */
export function StackGroupRenderer({
  group,
  children,
  className,
}: GroupRendererProps) {
  const gap = (group.options?.gap as number) || 4

  const gapClass = {
    2: 'space-y-2',
    4: 'space-y-4',
    6: 'space-y-6',
    8: 'space-y-8',
  }[gap] || 'space-y-4'

  return (
    <div className={cn('space-y-4', className)}>
      {group.title && (
        <h3 className="text-lg font-semibold">{group.title}</h3>
      )}
      {group.description && (
        <p className="text-sm text-muted-foreground">{group.description}</p>
      )}
      <div className={gapClass}>{children}</div>
    </div>
  )
}

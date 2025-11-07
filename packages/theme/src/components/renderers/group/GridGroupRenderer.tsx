import type { GroupRendererProps } from '../../../types'
import { cn } from '../../../lib/utils'

/**
 * Grid group renderer
 * Renders fields in a responsive grid layout
 */
export function GridGroupRenderer({
  group,
  children,
  className,
}: GroupRendererProps) {
  // Get columns from group options (default to 2)
  const columns = (group.options?.columns as number) || 2
  const gap = (group.options?.gap as number) || 4

  const gridClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  }[columns] || 'grid-cols-1 md:grid-cols-2'

  const gapClass = {
    2: 'gap-2',
    4: 'gap-4',
    6: 'gap-6',
    8: 'gap-8',
  }[gap] || 'gap-4'

  return (
    <div className={cn('space-y-4', className)}>
      {group.title && (
        <h3 className="text-lg font-semibold">{group.title}</h3>
      )}
      {group.description && (
        <p className="text-sm text-muted-foreground">{group.description}</p>
      )}
      <div className={cn('grid', gridClass, gapClass)}>{children}</div>
    </div>
  )
}

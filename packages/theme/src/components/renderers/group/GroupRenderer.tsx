import type { GroupRendererProps } from '../../../types'
import { getRegistry } from '../../../core'
import { cn } from '../../../lib/utils'

/**
 * GroupRenderer component
 * Dynamically renders a group based on layout type
 */
export function GroupRenderer(props: GroupRendererProps) {
  const { group } = props
  const registry = getRegistry()

  // Get layout type (default to 'stack')
  const layout = group.layout || 'stack'

  // Get renderer for this layout
  const registration = registry.getGroupRenderer(layout)

  if (!registration) {
    // Fallback to children or default
    return <DefaultGroupRenderer {...props} />
  }

  const Component = registration.component
  return <Component {...props} />
}

/**
 * Default group renderer (simple stack)
 */
function DefaultGroupRenderer({
  group,
  children,
  className,
}: GroupRendererProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {group.title && (
        <h3 className="text-lg font-semibold">{group.title}</h3>
      )}
      {group.description && (
        <p className="text-sm text-muted-foreground">{group.description}</p>
      )}
      <div className="space-y-4">{children}</div>
    </div>
  )
}

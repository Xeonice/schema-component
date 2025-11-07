import type { ViewRendererProps } from '../../../types'
import { getRegistry } from '../../../core'

/**
 * ViewRenderer component
 * Dynamically renders a view based on type
 */
export function ViewRenderer(props: ViewRendererProps) {
  const { view } = props
  const registry = getRegistry()

  // Get view type (default to 'form')
  const viewType = view.type || 'form'

  // Get renderer for this type
  const registration = registry.getViewRenderer(viewType)

  if (!registration) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        No renderer found for view type: {viewType}
      </div>
    )
  }

  const Component = registration.component
  return <Component {...props} />
}

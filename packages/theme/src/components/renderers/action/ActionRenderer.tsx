import type { ActionRendererProps } from '../../../types'
import { getRegistry } from '../../../core'

/**
 * ActionRenderer component
 * Dynamically renders an action based on type
 */
export function ActionRenderer(props: ActionRendererProps) {
  const { action } = props
  const registry = getRegistry()

  // Get action type (default to 'button')
  const actionType = action.type || 'button'

  // Get renderer for this type
  const registration = registry.getActionRenderer(actionType)

  if (!registration) {
    // Fallback to default button
    return <DefaultActionRenderer {...props} />
  }

  const Component = registration.component
  return <Component {...props} />
}

/**
 * Default action renderer (button)
 */
function DefaultActionRenderer({
  action,
  onClick,
  disabled,
  loading,
  className,
}: ActionRendererProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={className}
    >
      {loading ? 'Loading...' : action.label}
    </button>
  )
}

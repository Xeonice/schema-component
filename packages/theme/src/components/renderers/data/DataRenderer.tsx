import type { DataRendererProps } from '../../../types'
import { getRegistry } from '../../../core'

/**
 * DataRenderer component
 * Dynamically renders data based on field type
 */
export function DataRenderer(props: DataRendererProps) {
  const { field, value, mode = 'view' } = props
  const registry = getRegistry()

  // Get field type
  const fieldType = field.type

  // Get renderer for this type
  const registration = registry.getDataRenderer(fieldType)

  if (!registration) {
    // Fallback to default text renderer
    return <DefaultDataRenderer {...props} />
  }

  const Component = registration.component

  return <Component {...props} />
}

/**
 * Default data renderer (fallback)
 * Renders value as text
 */
function DefaultDataRenderer({ value, className }: DataRendererProps) {
  const displayValue = value == null ? '-' : String(value)

  return <span className={className}>{displayValue}</span>
}

import type { FieldRendererProps } from '../../../types'
import { getRegistry } from '../../../core'
import { DataRenderer } from '../data/DataRenderer'
import { cn } from '../../../lib/utils'

/**
 * FieldRenderer component
 * Renders a complete field with label, data renderer, and validation
 */
export function FieldRenderer(props: FieldRendererProps) {
  const {
    field,
    fieldDef,
    value,
    onChange,
    mode = 'view',
    disabled,
    readOnly,
    error,
    className,
  } = props

  const registry = getRegistry()
  const registration = registry.getFieldRenderer('default')

  if (!registration) {
    // Fallback to default implementation
    return <DefaultFieldRenderer {...props} />
  }

  const Component = registration.component
  return <Component {...props} />
}

/**
 * Default field renderer
 * Shows label and data renderer
 */
function DefaultFieldRenderer({
  field,
  fieldDef,
  value,
  onChange,
  mode = 'view',
  disabled,
  readOnly,
  error,
  className,
  schema,
}: FieldRendererProps) {
  const label = field.label || field.name
  const description = field.description
  const required = field.required ?? false
  const isReadOnly = readOnly

  return (
    <div className={cn('space-y-2', className)}>
      {/* Label */}
      {label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}

      {/* Description */}
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}

      {/* Data Renderer */}
      <DataRenderer
        field={fieldDef}
        name={field.name}
        value={value}
        onChange={onChange}
        mode={mode}
        disabled={disabled}
        readOnly={isReadOnly}
        error={error}
        schema={schema}
      />
    </div>
  )
}

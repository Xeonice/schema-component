import type { FieldRendererProps } from '../../../types'
import { DataRenderer } from '../data/DataRenderer'
import { cn } from '../../../lib/utils'

/**
 * Horizontal field renderer
 * Renders field with label on the left side
 */
export function HorizontalFieldRenderer({
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
    <div className={cn('flex gap-4 items-start', className)}>
      {/* Label */}
      <div className="flex-shrink-0 w-48 pt-2">
        {label && (
          <label className="text-sm font-medium">
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </div>

      {/* Data Renderer */}
      <div className="flex-1">
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
    </div>
  )
}

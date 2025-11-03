import type { FieldRendererProps } from '../../../types'
import { DataRenderer } from '../data/DataRenderer'
import { cn } from '../../../lib/utils'

/**
 * Inline field renderer
 * Renders field with label inline
 */
export function InlineFieldRenderer({
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
  const required = field.required ?? false
  const isReadOnly = readOnly

  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      {/* Label */}
      {label && (
        <label className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
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

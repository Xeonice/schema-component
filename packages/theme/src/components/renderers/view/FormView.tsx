import type { ViewRendererProps } from '../../../types'
import { GroupRenderer } from '../group/GroupRenderer'
import { FieldRenderer } from '../field/FieldRenderer'
import { ActionRenderer } from '../action/ActionRenderer'
import { cn } from '../../../lib/utils'

/**
 * FormView renderer
 * Renders a form with fields and actions
 */
export function FormView({
  view,
  data = {},
  onChange,
  actions = [],
  mode = 'edit',
  className,
  schema,
}: ViewRendererProps) {
  const groups = view.groups || []
  const fields = view.fields || []

  const handleFieldChange = (fieldName: string, value: any) => {
    if (onChange) {
      onChange({ ...data, [fieldName]: value })
    }
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Render groups if available */}
      {groups.length > 0 ? (
        groups.map((group: any, index: number) => (
          <GroupRenderer key={index} group={group} schema={schema} data={data}>
            {group.fields?.map((fieldName: string) => {
              const fieldDef = schema.fields[fieldName]
              if (!fieldDef) return null

              // Create field reference with name from schema
              const fieldRef = { name: fieldName, type: fieldDef.type }

              return (
                <FieldRenderer
                  key={fieldName}
                  field={fieldRef}
                  fieldDef={fieldDef}
                  value={data[fieldName]}
                  onChange={(value) => handleFieldChange(fieldName, value)}
                  mode={mode}
                  schema={schema}
                />
              )
            })}
          </GroupRenderer>
        ))
      ) : (
        /* Render flat fields if no groups */
        <div className="space-y-4">
          {fields.map((fieldName: string) => {
            const fieldDef = schema.fields[fieldName]
            if (!fieldDef) return null

            // Create field reference with name from schema
            const fieldRef = { name: fieldName, type: fieldDef.type }

            return (
              <FieldRenderer
                key={fieldName}
                field={fieldRef}
                fieldDef={fieldDef}
                value={data[fieldName]}
                onChange={(value) => handleFieldChange(fieldName, value)}
                mode={mode}
                schema={schema}
              />
            )
          })}
        </div>
      )}

      {/* Render actions */}
      {actions.length > 0 && (
        <div className="flex gap-2 pt-4">
          {actions.map((action, index) => (
            <ActionRenderer key={index} action={action} data={data} />
          ))}
        </div>
      )}
    </div>
  )
}

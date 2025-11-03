import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import type { ViewRendererProps } from '../../../types'
import { DataRenderer } from '../data/DataRenderer'
import { ActionRenderer } from '../action/ActionRenderer'
import { cn } from '../../../lib/utils'

/**
 * DetailView renderer
 * Renders data in a detail/read-only view
 */
export function DetailView({
  view,
  data = {},
  actions = [],
  className,
  schema,
}: ViewRendererProps) {
  const fields = view.fields || []
  const groups = view.groups || []

  return (
    <div className={cn('space-y-6', className)}>
      {/* Render groups if available */}
      {groups.length > 0 ? (
        groups.map((group: any, index: number) => (
          <Card key={index}>
            {group.title && (
              <CardHeader>
                <CardTitle>{group.title}</CardTitle>
              </CardHeader>
            )}
            <CardContent>
              <dl className="space-y-4">
                {group.fields?.map((fieldName: string) => {
                  const fieldDef = schema.fields[fieldName]
                  if (!fieldDef) return null

                  const label = fieldName

                  return (
                    <div key={fieldName} className="flex flex-col gap-1">
                      <dt className="text-sm font-medium text-muted-foreground">
                        {label}
                      </dt>
                      <dd>
                        <DataRenderer
                          field={fieldDef}
                          name={fieldName}
                          value={data[fieldName]}
                          mode="view"
                          schema={schema}
                        />
                      </dd>
                    </div>
                  )
                })}
              </dl>
            </CardContent>
          </Card>
        ))
      ) : (
        /* Render flat fields if no groups */
        <Card>
          <CardContent className="pt-6">
            <dl className="space-y-4">
              {fields.map((fieldName: string) => {
                const fieldDef = schema.fields[fieldName]
                if (!fieldDef) return null

                const label = fieldName

                return (
                  <div key={fieldName} className="flex flex-col gap-1">
                    <dt className="text-sm font-medium text-muted-foreground">
                      {label}
                    </dt>
                    <dd>
                      <DataRenderer
                        field={fieldDef}
                        name={fieldName}
                        value={data[fieldName]}
                        mode="view"
                        schema={schema}
                      />
                    </dd>
                  </div>
                )
              })}
            </dl>
          </CardContent>
        </Card>
      )}

      {/* Render actions */}
      {actions.length > 0 && (
        <div className="flex gap-2">
          {actions.map((action, index) => (
            <ActionRenderer key={index} action={action} data={data} />
          ))}
        </div>
      )}
    </div>
  )
}

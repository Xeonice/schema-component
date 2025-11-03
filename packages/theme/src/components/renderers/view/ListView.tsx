import { Card, CardContent } from '../../../components/ui/card'
import type { ViewRendererProps } from '../../../types'
import { DataRenderer } from '../data/DataRenderer'
import { ActionRenderer } from '../action/ActionRenderer'
import { cn } from '../../../lib/utils'

/**
 * ListView renderer
 * Renders data as a list of cards
 */
export function ListView({
  view,
  data = [],
  actions = [],
  mode = 'view',
  className,
  schema,
}: ViewRendererProps) {
  const fields = view.fields || []
  const dataArray = Array.isArray(data) ? data : [data]

  return (
    <div className={cn('space-y-4', className)}>
      {dataArray.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No data
          </CardContent>
        </Card>
      ) : (
        dataArray.map((item, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Render fields */}
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                            value={item[fieldName]}
                            mode={mode}
                            schema={schema}
                          />
                        </dd>
                      </div>
                    )
                  })}
                </dl>

                {/* Render actions */}
                {actions.length > 0 && (
                  <div className="flex gap-2 pt-2 border-t">
                    {actions.map((action, actionIndex) => (
                      <ActionRenderer
                        key={actionIndex}
                        action={action}
                        data={item}
                      />
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}

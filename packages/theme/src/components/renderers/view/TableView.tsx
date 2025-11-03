import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table'
import type { ViewRendererProps } from '../../../types'
import { DataRenderer } from '../data/DataRenderer'
import { ActionRenderer } from '../action/ActionRenderer'
import { cn } from '../../../lib/utils'

/**
 * TableView renderer
 * Renders data in a table format
 */
export function TableView({
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
      <Table>
        <TableHeader>
          <TableRow>
            {fields.map((fieldName: string) => {
              return <TableHead key={fieldName}>{fieldName}</TableHead>
            })}
            {actions.length > 0 && <TableHead>Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {dataArray.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={fields.length + (actions.length > 0 ? 1 : 0)}
                className="text-center text-muted-foreground"
              >
                No data
              </TableCell>
            </TableRow>
          ) : (
            dataArray.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {fields.map((fieldName: string) => {
                  const fieldDef = schema.fields[fieldName]
                  if (!fieldDef) return <TableCell key={fieldName}>-</TableCell>

                  return (
                    <TableCell key={fieldName}>
                      <DataRenderer
                        field={fieldDef}
                        name={fieldName}
                        value={row[fieldName]}
                        mode={mode}
                        schema={schema}
                      />
                    </TableCell>
                  )
                })}
                {actions.length > 0 && (
                  <TableCell>
                    <div className="flex gap-2">
                      {actions.map((action, actionIndex) => (
                        <ActionRenderer
                          key={actionIndex}
                          action={action}
                          data={row}
                        />
                      ))}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

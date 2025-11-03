import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '../../../components/ui/card'
import type { GroupRendererProps } from '../../../types'
import { cn } from '../../../lib/utils'

/**
 * Card group renderer
 * Renders fields in a card container
 */
export function CardGroupRenderer({
  group,
  children,
  className,
}: GroupRendererProps) {
  return (
    <Card className={className}>
      {(group.title || group.description) && (
        <CardHeader>
          {group.title && <CardTitle>{group.title}</CardTitle>}
          {group.description && (
            <CardDescription>{group.description}</CardDescription>
          )}
        </CardHeader>
      )}
      <CardContent>
        <div className="space-y-4">{children}</div>
      </CardContent>
    </Card>
  )
}

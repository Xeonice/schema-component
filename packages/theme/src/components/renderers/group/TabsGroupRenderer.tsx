import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../components/ui/tabs'
import type { GroupRendererProps } from '../../../types'
import { cn } from '../../../lib/utils'
import { Children, isValidElement } from 'react'

/**
 * Tabs group renderer
 * Renders child groups as tabs
 * Note: This expects children to be wrapped in a special way or
 * uses the group.children array if available
 */
export function TabsGroupRenderer({
  group,
  children,
  className,
}: GroupRendererProps) {
  // For tabs, we expect the group to potentially have child groups
  // that should be rendered as separate tabs
  const defaultValue = group.options?.defaultTab as string || 'tab-0'

  // Convert children to array
  const childrenArray = Children.toArray(children)

  return (
    <div className={cn('space-y-4', className)}>
      {group.title && (
        <h3 className="text-lg font-semibold">{group.title}</h3>
      )}
      {group.description && (
        <p className="text-sm text-muted-foreground">{group.description}</p>
      )}

      <Tabs defaultValue={defaultValue} className="w-full">
        <TabsList>
          {childrenArray.map((child, index) => {
            // Try to extract title from child if it's a valid element
            let title = `Tab ${index + 1}`
            if (isValidElement(child) && typeof child.props === 'object') {
              title = (child.props as any)?.title || title
            }

            return (
              <TabsTrigger key={`tab-${index}`} value={`tab-${index}`}>
                {title}
              </TabsTrigger>
            )
          })}
        </TabsList>

        {childrenArray.map((child, index) => (
          <TabsContent key={`content-${index}`} value={`tab-${index}`}>
            {child}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

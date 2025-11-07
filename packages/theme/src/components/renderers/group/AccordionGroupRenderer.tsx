import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '../../../components/ui/accordion'
import type { GroupRendererProps } from '../../../types'
import { cn } from '../../../lib/utils'
import { Children, isValidElement } from 'react'

/**
 * Accordion group renderer
 * Renders child groups as accordion items
 */
export function AccordionGroupRenderer({
  group,
  children,
  className,
}: GroupRendererProps) {
  const type = (group.options?.type as 'single' | 'multiple') || 'single'
  const collapsible = group.options?.collapsible !== false

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

      <Accordion type={type} collapsible={collapsible} className="w-full">
        {childrenArray.map((child, index) => {
          // Try to extract title from child if it's a valid element
          let title = `Section ${index + 1}`
          if (isValidElement(child) && typeof child.props === 'object') {
            title = (child.props as any)?.title || title
          }

          return (
            <AccordionItem key={`item-${index}`} value={`item-${index}`}>
              <AccordionTrigger>{title}</AccordionTrigger>
              <AccordionContent>{child}</AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>
    </div>
  )
}

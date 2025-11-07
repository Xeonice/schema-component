import { getRegistry } from '../../core'
import {
  GridGroupRenderer,
  StackGroupRenderer,
  TabsGroupRenderer,
  AccordionGroupRenderer,
  CardGroupRenderer,
} from './group'

/**
 * Register all group renderers
 */
export function registerGroupRenderers() {
  const registry = getRegistry()

  // Stack layout (vertical)
  registry.registerGroupRenderer('stack', {
    component: StackGroupRenderer,
    displayName: 'Stack',
  })

  // Grid layout (responsive grid)
  registry.registerGroupRenderer('grid', {
    component: GridGroupRenderer,
    displayName: 'Grid',
  })

  // Tabs layout
  registry.registerGroupRenderer('tabs', {
    component: TabsGroupRenderer,
    displayName: 'Tabs',
  })

  // Accordion layout
  registry.registerGroupRenderer('accordion', {
    component: AccordionGroupRenderer,
    displayName: 'Accordion',
  })

  // Card layout
  registry.registerGroupRenderer('card', {
    component: CardGroupRenderer,
    displayName: 'Card',
  })
}

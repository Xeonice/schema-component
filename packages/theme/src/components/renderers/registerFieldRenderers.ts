import { getRegistry } from '../../core'
import {
  FieldRenderer,
  HorizontalFieldRenderer,
  InlineFieldRenderer,
} from './field'

/**
 * Register all field renderers
 */
export function registerFieldRenderers() {
  const registry = getRegistry()

  // Default field renderer (vertical layout with label on top)
  registry.registerFieldRenderer('default', {
    component: FieldRenderer,
    displayName: 'Default',
  })

  // Horizontal layout (label on left)
  registry.registerFieldRenderer('horizontal', {
    component: HorizontalFieldRenderer,
    displayName: 'Horizontal',
  })

  // Inline layout (label and field inline)
  registry.registerFieldRenderer('inline', {
    component: InlineFieldRenderer,
    displayName: 'Inline',
  })
}

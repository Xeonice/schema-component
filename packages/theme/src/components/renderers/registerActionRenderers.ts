import { getRegistry } from '../../core'
import {
  ButtonActionRenderer,
  LinkActionRenderer,
  DropdownActionRenderer,
} from './action'

/**
 * Register all action renderers
 */
export function registerActionRenderers() {
  const registry = getRegistry()

  // Button action
  registry.registerActionRenderer('button', {
    component: ButtonActionRenderer,
    displayName: 'Button',
  })

  // Link action
  registry.registerActionRenderer('link', {
    component: LinkActionRenderer,
    displayName: 'Link',
  })

  // Dropdown action
  registry.registerActionRenderer('dropdown', {
    component: DropdownActionRenderer,
    displayName: 'Dropdown',
  })
}

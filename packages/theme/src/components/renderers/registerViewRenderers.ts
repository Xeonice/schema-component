import { getRegistry } from '../../core'
import {
  FormView,
  TableView,
  DetailView,
  ListView,
} from './view'

/**
 * Register all view renderers
 */
export function registerViewRenderers() {
  const registry = getRegistry()

  // Form view
  registry.registerViewRenderer('form', {
    component: FormView,
    displayName: 'Form',
  })

  // Table view
  registry.registerViewRenderer('table', {
    component: TableView,
    displayName: 'Table',
  })

  // Detail view
  registry.registerViewRenderer('detail', {
    component: DetailView,
    displayName: 'Detail',
  })

  // List view
  registry.registerViewRenderer('list', {
    component: ListView,
    displayName: 'List',
  })
}

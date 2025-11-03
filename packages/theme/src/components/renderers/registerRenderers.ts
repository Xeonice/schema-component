import { registerDataRenderers } from './registerDataRenderers'
import { registerFieldRenderers } from './registerFieldRenderers'
import { registerGroupRenderers } from './registerGroupRenderers'
import { registerActionRenderers } from './registerActionRenderers'
import { registerViewRenderers } from './registerViewRenderers'

/**
 * Register all renderers
 * Call this once during application initialization
 */
export function registerRenderers() {
  registerDataRenderers()
  registerFieldRenderers()
  registerGroupRenderers()
  registerActionRenderers()
  registerViewRenderers()
}

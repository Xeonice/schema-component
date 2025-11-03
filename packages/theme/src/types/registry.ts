import type {
  DataRendererRegistration,
  FieldRendererRegistration,
  GroupRendererRegistration,
  ActionRendererRegistration,
  ViewRendererRegistration,
} from './renderer'

/**
 * Component registry interface
 * Manages registration and retrieval of all renderer components
 */
export interface ComponentRegistry {
  // Data Renderers
  registerDataRenderer(type: string, registration: DataRendererRegistration): void
  getDataRenderer(type: string): DataRendererRegistration | undefined
  hasDataRenderer(type: string): boolean

  // Field Renderers
  registerFieldRenderer(type: string, registration: FieldRendererRegistration): void
  getFieldRenderer(type: string): FieldRendererRegistration | undefined
  hasFieldRenderer(type: string): boolean

  // Group Renderers
  registerGroupRenderer(type: string, registration: GroupRendererRegistration): void
  getGroupRenderer(type: string): GroupRendererRegistration | undefined
  hasGroupRenderer(type: string): boolean

  // Action Renderers
  registerActionRenderer(type: string, registration: ActionRendererRegistration): void
  getActionRenderer(type: string): ActionRendererRegistration | undefined
  hasActionRenderer(type: string): boolean

  // View Renderers
  registerViewRenderer(type: string, registration: ViewRendererRegistration): void
  getViewRenderer(type: string): ViewRendererRegistration | undefined
  hasViewRenderer(type: string): boolean

  // Batch Registration
  registerBatch(registrations: RegistryBatch): void

  // Introspection
  listDataRenderers(): string[]
  listFieldRenderers(): string[]
  listGroupRenderers(): string[]
  listActionRenderers(): string[]
  listViewRenderers(): string[]

  // Clear
  clear(): void
}

/**
 * Batch registration object
 */
export interface RegistryBatch {
  dataRenderers?: Record<string, DataRendererRegistration>
  fieldRenderers?: Record<string, FieldRendererRegistration>
  groupRenderers?: Record<string, GroupRendererRegistration>
  actionRenderers?: Record<string, ActionRendererRegistration>
  viewRenderers?: Record<string, ViewRendererRegistration>
}

import type {
  ComponentRegistry,
  RegistryBatch,
  DataRendererRegistration,
  FieldRendererRegistration,
  GroupRendererRegistration,
  ActionRendererRegistration,
  ViewRendererRegistration,
} from '../types'

/**
 * Default implementation of ComponentRegistry
 * Singleton pattern for managing renderer components
 */
class ComponentRegistryImpl implements ComponentRegistry {
  private dataRenderers = new Map<string, DataRendererRegistration>()
  private fieldRenderers = new Map<string, FieldRendererRegistration>()
  private groupRenderers = new Map<string, GroupRendererRegistration>()
  private actionRenderers = new Map<string, ActionRendererRegistration>()
  private viewRenderers = new Map<string, ViewRendererRegistration>()

  // Data Renderers
  registerDataRenderer(type: string, registration: DataRendererRegistration): void {
    if (this.dataRenderers.has(type)) {
      console.warn(`DataRenderer "${type}" is already registered. Overwriting.`)
    }
    this.dataRenderers.set(type, registration)
  }

  getDataRenderer(type: string): DataRendererRegistration | undefined {
    return this.dataRenderers.get(type)
  }

  hasDataRenderer(type: string): boolean {
    return this.dataRenderers.has(type)
  }

  // Field Renderers
  registerFieldRenderer(type: string, registration: FieldRendererRegistration): void {
    if (this.fieldRenderers.has(type)) {
      console.warn(`FieldRenderer "${type}" is already registered. Overwriting.`)
    }
    this.fieldRenderers.set(type, registration)
  }

  getFieldRenderer(type: string): FieldRendererRegistration | undefined {
    return this.fieldRenderers.get(type)
  }

  hasFieldRenderer(type: string): boolean {
    return this.fieldRenderers.has(type)
  }

  // Group Renderers
  registerGroupRenderer(type: string, registration: GroupRendererRegistration): void {
    if (this.groupRenderers.has(type)) {
      console.warn(`GroupRenderer "${type}" is already registered. Overwriting.`)
    }
    this.groupRenderers.set(type, registration)
  }

  getGroupRenderer(type: string): GroupRendererRegistration | undefined {
    return this.groupRenderers.get(type)
  }

  hasGroupRenderer(type: string): boolean {
    return this.groupRenderers.has(type)
  }

  // Action Renderers
  registerActionRenderer(type: string, registration: ActionRendererRegistration): void {
    if (this.actionRenderers.has(type)) {
      console.warn(`ActionRenderer "${type}" is already registered. Overwriting.`)
    }
    this.actionRenderers.set(type, registration)
  }

  getActionRenderer(type: string): ActionRendererRegistration | undefined {
    return this.actionRenderers.get(type)
  }

  hasActionRenderer(type: string): boolean {
    return this.actionRenderers.has(type)
  }

  // View Renderers
  registerViewRenderer(type: string, registration: ViewRendererRegistration): void {
    if (this.viewRenderers.has(type)) {
      console.warn(`ViewRenderer "${type}" is already registered. Overwriting.`)
    }
    this.viewRenderers.set(type, registration)
  }

  getViewRenderer(type: string): ViewRendererRegistration | undefined {
    return this.viewRenderers.get(type)
  }

  hasViewRenderer(type: string): boolean {
    return this.viewRenderers.has(type)
  }

  // Batch Registration
  registerBatch(registrations: RegistryBatch): void {
    if (registrations.dataRenderers) {
      Object.entries(registrations.dataRenderers).forEach(([type, registration]) => {
        this.registerDataRenderer(type, registration)
      })
    }

    if (registrations.fieldRenderers) {
      Object.entries(registrations.fieldRenderers).forEach(([type, registration]) => {
        this.registerFieldRenderer(type, registration)
      })
    }

    if (registrations.groupRenderers) {
      Object.entries(registrations.groupRenderers).forEach(([type, registration]) => {
        this.registerGroupRenderer(type, registration)
      })
    }

    if (registrations.actionRenderers) {
      Object.entries(registrations.actionRenderers).forEach(([type, registration]) => {
        this.registerActionRenderer(type, registration)
      })
    }

    if (registrations.viewRenderers) {
      Object.entries(registrations.viewRenderers).forEach(([type, registration]) => {
        this.registerViewRenderer(type, registration)
      })
    }
  }

  // Introspection
  listDataRenderers(): string[] {
    return Array.from(this.dataRenderers.keys())
  }

  listFieldRenderers(): string[] {
    return Array.from(this.fieldRenderers.keys())
  }

  listGroupRenderers(): string[] {
    return Array.from(this.groupRenderers.keys())
  }

  listActionRenderers(): string[] {
    return Array.from(this.actionRenderers.keys())
  }

  listViewRenderers(): string[] {
    return Array.from(this.viewRenderers.keys())
  }

  // Clear
  clear(): void {
    this.dataRenderers.clear()
    this.fieldRenderers.clear()
    this.groupRenderers.clear()
    this.actionRenderers.clear()
    this.viewRenderers.clear()
  }
}

// Singleton instance
let registryInstance: ComponentRegistry | null = null

/**
 * Get the global ComponentRegistry instance
 */
export function getRegistry(): ComponentRegistry {
  if (!registryInstance) {
    registryInstance = new ComponentRegistryImpl()
  }
  return registryInstance
}

/**
 * Reset the global registry (useful for testing)
 */
export function resetRegistry(): void {
  if (registryInstance) {
    registryInstance.clear()
  }
  registryInstance = null
}

/**
 * Create a new isolated registry instance (useful for testing)
 */
export function createRegistry(): ComponentRegistry {
  return new ComponentRegistryImpl()
}

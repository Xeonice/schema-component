import type { ActionDefinition, ServerActionDefinition, ViewActionDefinition } from '@schema-component/engine'
import { getApiClient } from '../api/ApiClient'
import { getRouter } from '../router/BrowserRouter'
import type { Router } from '../router/types'
import type { ApiClient } from '../api/types'

/**
 * Action execution context
 */
export interface ActionContext {
  /** Current data/record */
  data?: any
  /** Selected records (for batch actions) */
  selected?: any[]
  /** Additional context data */
  extra?: Record<string, any>
}

/**
 * Action execution result
 */
export interface ActionResult {
  /** Whether the action succeeded */
  success: boolean
  /** Result data */
  data?: any
  /** Error message if failed */
  error?: string
  /** Whether the action should trigger a refresh */
  refresh?: boolean
}

/**
 * Action opening mode
 */
export type ActionOpenMode = 'route' | 'modal' | 'drawer' | 'inline'

/**
 * Action executor configuration
 */
export interface ActionExecutorConfig {
  /** API client */
  apiClient?: ApiClient
  /** Router */
  router?: Router
  /** Modal controller */
  onOpenModal?: (action: ActionDefinition, context: ActionContext) => void
  /** Drawer controller */
  onOpenDrawer?: (action: ActionDefinition, context: ActionContext) => void
  /** Message controller */
  onShowMessage?: (message: string, type: 'success' | 'error' | 'info') => void
  /** Confirmation handler */
  onConfirm?: (message: string) => Promise<boolean>
}

/**
 * Action executor
 * Handles execution of different types of actions
 */
export class ActionExecutor {
  private config: ActionExecutorConfig

  constructor(config: ActionExecutorConfig = {}) {
    this.config = {
      apiClient: config.apiClient || getApiClient(),
      router: config.router || getRouter(),
      ...config,
    }
  }

  /**
   * Execute an action
   */
  async execute(
    action: ActionDefinition,
    context: ActionContext = {}
  ): Promise<ActionResult> {
    try {
      // Check if confirmation is needed (only for ServerActions)
      if (action.type === 'server') {
        const serverAction = action as ServerActionDefinition
        if (serverAction.confirm && this.config.onConfirm) {
          const confirmMessage = typeof serverAction.confirm === 'string'
            ? serverAction.confirm
            : serverAction.confirm.title
          const confirmed = await this.config.onConfirm(confirmMessage)
          if (!confirmed) {
            return { success: false }
          }
        }
      }

      // Execute based on action type
      const result = await this.executeByType(action, context)

      // Show success message if configured (only for ServerActions)
      if (result.success && action.type === 'server') {
        const serverAction = action as ServerActionDefinition
        if (serverAction.successMessage && this.config.onShowMessage) {
          const message = typeof serverAction.successMessage === 'string'
            ? serverAction.successMessage
            : serverAction.successMessage(result.data)
          this.config.onShowMessage(message, 'success')
        }
      }

      return result
    } catch (error: any) {
      const errorMessage = error.message || 'Action failed'

      // Show error message if configured
      if (this.config.onShowMessage) {
        this.config.onShowMessage(errorMessage, 'error')
      }

      return {
        success: false,
        error: errorMessage,
      }
    }
  }

  /**
   * Execute action based on its type
   */
  private async executeByType(
    action: ActionDefinition,
    context: ActionContext
  ): Promise<ActionResult> {
    switch (action.type) {
      case 'server':
        return this.executeServerAction(action as ServerActionDefinition, context)
      case 'view':
        return this.executeViewAction(action as ViewActionDefinition, context)
      default:
        throw new Error(`Unknown action type: ${(action as any).type}`)
    }
  }

  /**
   * Execute server action (API call to Model Action)
   */
  private async executeServerAction(
    action: ServerActionDefinition,
    context: ActionContext
  ): Promise<ActionResult> {
    try {
      // Get params if getParams function is provided
      const renderContext = this.toRenderContext(context)
      const params = action.getParams ? action.getParams(renderContext) : {}

      // Call the onSuccess handler which should trigger the actual API call
      // Note: In the real implementation, this would call the Model Action via Engine
      // For now, we just call the handler if it exists
      if (action.onSuccess) {
        action.onSuccess(params, renderContext)
      }

      return {
        success: true,
        data: params,
        refresh: true, // Server actions typically need refresh
      }
    } catch (error: any) {
      // Call error handler if provided
      if (action.onError) {
        const renderContext = this.toRenderContext(context)
        action.onError(error, renderContext)
      }
      throw error
    }
  }

  /**
   * Execute view action (client-side handler)
   */
  private async executeViewAction(
    action: ViewActionDefinition,
    context: ActionContext
  ): Promise<ActionResult> {
    // Execute the handler
    const renderContext = this.toRenderContext(context)
    await action.handler(renderContext)

    return {
      success: true,
      refresh: false, // View actions typically don't need refresh
    }
  }

  /**
   * Convert ActionContext to RenderContext
   */
  private toRenderContext(context: ActionContext): any {
    // This is a simplified conversion
    // In reality, RenderContext would have more structure
    return {
      data: context.data,
      selected: context.selected,
      ...context.extra,
    }
  }

  /**
   * Configure the executor
   */
  configure(config: Partial<ActionExecutorConfig>): void {
    this.config = { ...this.config, ...config }
  }
}

// Singleton instance
let executorInstance: ActionExecutor | null = null

/**
 * Get the global action executor
 */
export function getActionExecutor(): ActionExecutor {
  if (!executorInstance) {
    executorInstance = new ActionExecutor()
  }
  return executorInstance
}

/**
 * Configure the global action executor
 */
export function configureActionExecutor(config: Partial<ActionExecutorConfig>): void {
  const executor = getActionExecutor()
  executor.configure(config)
}

/**
 * Reset the action executor (useful for testing)
 */
export function resetActionExecutor(): void {
  executorInstance = null
}

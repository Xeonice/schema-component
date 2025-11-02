/**
 * Action related types
 */

// 为了避免循环依赖，在这里前置声明 ModelContext
interface ModelContext {
  modelName: string
  schema: any
  repository: any
  eventBus: any
  store?: any
  [key: string]: any
}

// ============================================================================
// Action Types
// ============================================================================

/**
 * Action 函数类型
 * 接收参数，返回 Promise
 */
export type ActionFunction<TParams = any, TResult = any> = (
  params?: TParams
) => Promise<TResult>

/**
 * Action 定义集合
 * key: action 名称
 * value: action 函数
 */
export interface ActionDefinitions {
  [actionName: string]: ActionFunction
}

/**
 * Actions 定义：函数形式
 * - 函数形式：可以访问 context（repository、eventBus 等）
 *
 * @example
 * ```typescript
 * actions: (context) => ({
 *   activate: async (params: { id: string }) => {
 *     const result = await context.repository.updateOne(params.id, { isActive: true })
 *     context.eventBus.emit('user:activated', { id: params.id })
 *     return result
 *   }
 * })
 * ```
 */
export type ActionsDefinition =
  | ActionDefinitions
  | ((context: ModelContext) => ActionDefinitions)

/**
 * Action 执行选项
 */
export interface ActionExecuteOptions {
  /** 是否触发钩子 */
  triggerHooks?: boolean
  /** 是否发送事件 */
  emitEvents?: boolean
  /** 超时时间（毫秒） */
  timeout?: number
  /** 额外的上下文数据 */
  extraContext?: Record<string, any>
}

/**
 * Action 执行结果
 */
export interface ActionExecuteResult<T = any> {
  success: boolean
  data?: T
  error?: Error
  duration?: number
}

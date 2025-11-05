import { useState, useCallback } from 'react'
import type {
  ActionDefinition,
  ServerActionDefinition,
  ViewActionDefinition
} from '@schema-component/engine'
import { useApi } from '../context/RenderContext'

/**
 * Action 执行状态
 */
export interface ActionExecutionState {
  /** 正在执行的 action ID */
  executingAction: string | null
  /** 加载状态 */
  loading: boolean
  /** 错误信息 */
  error: string | null
  /** 最后执行结果 */
  result: any
}

/**
 * useModelAction Hook 选项
 */
export interface UseModelActionOptions {
  /** 成功回调 */
  onSuccess?: (result: any, action: ActionDefinition) => void
  /** 错误回调 */
  onError?: (error: Error, action: ActionDefinition) => void
  /** 执行前确认 */
  confirm?: (action: ActionDefinition) => Promise<boolean> | boolean
}

/**
 * useModelAction Hook 返回值
 */
export interface UseModelActionResult {
  /** 执行状态 */
  state: ActionExecutionState
  /** 执行 Action */
  execute: (action: ActionDefinition, data?: any) => Promise<any>
  /** 重置状态 */
  reset: () => void
  /** 是否正在执行某个 action */
  isExecuting: (actionId?: string) => boolean
}

/**
 * useModelAction Hook
 *
 * 处理 Action 执行、loading、成功/失败反馈
 *
 * @example
 * ```tsx
 * const { execute, state } = useModelAction({
 *   onSuccess: (result) => {
 *     message.success('操作成功')
 *     refetch() // 刷新数据
 *   },
 *   onError: (error) => {
 *     message.error(error.message)
 *   },
 *   confirm: async (action) => {
 *     if (action.danger) {
 *       return confirm(`确认执行 ${action.label}？`)
 *     }
 *     return true
 *   }
 * })
 *
 * // 执行 action
 * <Button onClick={() => execute(deleteAction, { id: userId })}>
 *   删除
 * </Button>
 * ```
 */
export function useModelAction(
  options: UseModelActionOptions = {}
): UseModelActionResult {
  const { onSuccess, onError, confirm } = options
  const api = useApi()

  // 执行状态
  const [state, setState] = useState<ActionExecutionState>({
    executingAction: null,
    loading: false,
    error: null,
    result: null
  })

  /**
   * 执行 Action
   */
  const execute = useCallback(
    async (action: ActionDefinition | ExtendedActionDefinition, data?: any): Promise<any> => {
      // 确认执行
      if (confirm) {
        const shouldContinue = await confirm(action)
        if (!shouldContinue) {
          return null
        }
      }

      try {
        // 设置加载状态
        const actionId = (action as ExtendedActionDefinition).id || action.name
        setState({
          executingAction: actionId,
          loading: true,
          error: null,
          result: null
        })

        let result: any

        // 处理 ServerAction
        if (action.type === 'server') {
          // ServerAction 通过 name 映射到 API 方法
          const serverAction = action as ServerActionDefinition

          // 根据 action name 判断执行哪个 API
          const actionName = serverAction.name.toLowerCase()

          if (actionName.includes('create')) {
            result = await api.create(data)
          } else if (actionName.includes('update') || actionName.includes('edit')) {
            if (!data?.id) {
              throw new Error('Update action requires data.id')
            }
            result = await api.update(data.id, data)
          } else if (actionName.includes('delete') || actionName.includes('remove')) {
            if (!data?.id) {
              throw new Error('Delete action requires data.id')
            }
            result = await api.delete(data.id)
          } else {
            // 默认使用 getList（可能是刷新操作）
            result = await api.getList(data)
          }
        } else if (action.type === 'view') {
          // ViewAction 直接执行 handler
          const viewAction = action as ViewActionDefinition
          result = await viewAction.handler({ model: null, modelName: '', data: {} })
        } else {
          throw new Error(`Unknown action type: ${action.type}`)
        }

        // 设置成功状态
        setState({
          executingAction: null,
          loading: false,
          error: null,
          result
        })

        // 调用成功回调
        if (onSuccess) {
          onSuccess(result, action)
        }

        return result
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err)

        // 设置错误状态
        setState({
          executingAction: null,
          loading: false,
          error: errorMessage,
          result: null
        })

        // 调用错误回调
        if (onError && err instanceof Error) {
          onError(err, action)
        }

        // 在开发模式下输出错误
        if (process.env.NODE_ENV === 'development') {
          console.error('[useModelAction] Error executing action:', err)
        }

        // 重新抛出错误，让调用者可以捕获
        throw err
      }
    },
    [api, confirm, onSuccess, onError]
  )

  /**
   * 重置状态
   */
  const reset = useCallback(() => {
    setState({
      executingAction: null,
      loading: false,
      error: null,
      result: null
    })
  }, [])

  /**
   * 检查是否正在执行某个 action
   */
  const isExecuting = useCallback(
    (actionId?: string): boolean => {
      if (!actionId) {
        return state.loading
      }
      return state.executingAction === actionId
    },
    [state.loading, state.executingAction]
  )

  return {
    state,
    execute,
    reset,
    isExecuting
  }
}

/**
 * 扩展的 Action 定义（用于 useModelAction）
 *
 * 注意：这个类型扩展了 Engine 的 ActionDefinition，
 * 添加了一些 react-connector 特有的属性
 */
export interface ExtendedActionDefinition extends ServerActionDefinition {
  /** Action ID（用于追踪执行状态） */
  id?: string
  /** 是否危险操作（需要确认） */
  danger?: boolean
}

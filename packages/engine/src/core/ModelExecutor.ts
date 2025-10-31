/**
 * Model Executor - 执行 Model 的 Actions, Methods 和 APIs
 */

import type { IModel } from './defineModel'
import type { ActionFunction } from './actionTypes'
import { EventType } from '../event/types'

/**
 * Model 执行器类
 * 提供执行 Actions, Methods, APIs 的统一接口
 */
export class ModelExecutor {
  /**
   * 执行 Model 的 Action
   *
   * @param model Model 实例
   * @param actionName Action 名称
   * @param params Action 参数
   * @returns Action 执行结果
   *
   * @example
   * ```typescript
   * await ModelExecutor.executeAction(UserModel, 'activate', { id: '123' })
   * ```
   */
  static async executeAction(
    model: IModel,
    actionName: string,
    params?: any
  ): Promise<any> {
    const action = model.actions[actionName] as ActionFunction

    if (!action) {
      throw new Error(`Action "${actionName}" not found in model "${model.name}"`)
    }

    if (typeof action !== 'function') {
      throw new Error(`Action "${actionName}" is not a function`)
    }

    // 发布执行前事件
    model.context.eventBus.publish({
      type: EventType.ACTION_BEFORE_EXECUTE,
      payload: {
        modelName: model.name,
        actionName,
        params
      },
      timestamp: Date.now()
    })

    try {
      // 执行 action
      const result = await action(params)

      // 发布执行成功事件
      model.context.eventBus.publish({
        type: EventType.ACTION_EXECUTED,
        payload: {
          modelName: model.name,
          actionName,
          params,
          result
        },
        timestamp: Date.now()
      })

      return result
    } catch (error) {
      // 发布执行失败事件
      model.context.eventBus.publish({
        type: EventType.ACTION_FAILED,
        payload: {
          modelName: model.name,
          actionName,
          params,
          error
        },
        timestamp: Date.now()
      })

      throw error
    }
  }

  /**
   * 执行 Model 的 Method
   *
   * @param model Model 实例
   * @param methodName Method 名称
   * @param args Method 参数
   * @returns Method 执行结果
   *
   * @example
   * ```typescript
   * await ModelExecutor.executeMethod(UserModel, 'resetPassword', '123')
   * ```
   */
  static async executeMethod(
    model: IModel,
    methodName: string,
    ...args: any[]
  ): Promise<any> {
    const method = model.methods[methodName]

    if (!method) {
      throw new Error(`Method "${methodName}" not found in model "${model.name}"`)
    }

    if (typeof method !== 'function') {
      throw new Error(`Method "${methodName}" is not a function`)
    }

    try {
      // 执行 method
      return await method(...args)
    } catch (error) {
      // 记录错误但不发布事件（Methods 是内部方法）
      if (model.context.eventBus) {
        model.context.eventBus.publish({
          type: 'model:method:failed',
          payload: {
            modelName: model.name,
            methodName,
            args,
            error
          },
          timestamp: Date.now()
        })
      }

      throw error
    }
  }

  /**
   * 调用 Model 的 API
   *
   * @param model Model 实例
   * @param apiName API 名称
   * @param args API 参数
   * @returns API 调用结果
   *
   * @example
   * ```typescript
   * const users = await ModelExecutor.callApi(UserModel, 'getList', { page: 1 })
   * ```
   */
  static async callApi(
    model: IModel,
    apiName: string,
    ...args: any[]
  ): Promise<any> {
    const api = model.apis[apiName]

    if (!api) {
      throw new Error(`API "${apiName}" not found in model "${model.name}"`)
    }

    if (typeof api !== 'function') {
      throw new Error(`API "${apiName}" is not a function`)
    }

    try {
      // 调用 API
      return await api(...args)
    } catch (error) {
      // 记录 API 调用失败
      if (model.context.eventBus) {
        model.context.eventBus.publish({
          type: 'model:api:failed',
          payload: {
            modelName: model.name,
            apiName,
            args,
            error
          },
          timestamp: Date.now()
        })
      }

      throw error
    }
  }

  /**
   * 执行生命周期钩子
   *
   * @param model Model 实例
   * @param hookName Hook 名称
   * @param args Hook 参数
   * @returns Hook 执行结果
   */
  static async executeHook(
    model: IModel,
    hookName: string,
    ...args: any[]
  ): Promise<any> {
    const hook = (model.hooks as any)[hookName]

    if (!hook) {
      // 钩子不存在，直接返回第一个参数（用于链式调用）
      return args[0]
    }

    if (typeof hook !== 'function') {
      throw new Error(`Hook "${hookName}" is not a function`)
    }

    try {
      return await hook(...args)
    } catch (error) {
      // 记录钩子执行失败
      if (model.context.eventBus) {
        model.context.eventBus.publish({
          type: 'model:hook:failed',
          payload: {
            modelName: model.name,
            hookName,
            args,
            error
          },
          timestamp: Date.now()
        })
      }

      throw error
    }
  }

  /**
   * 批量执行 Actions
   *
   * @param model Model 实例
   * @param actions Action 执行配置数组
   * @returns 所有 Action 的执行结果
   */
  static async executeBatchActions(
    model: IModel,
    actions: Array<{ name: string; params?: any }>
  ): Promise<any[]> {
    const results: any[] = []

    for (const { name, params } of actions) {
      try {
        const result = await this.executeAction(model, name, params)
        results.push({ success: true, actionName: name, result })
      } catch (error) {
        results.push({ success: false, actionName: name, error })
      }
    }

    return results
  }

  /**
   * 检查 Action 是否存在
   */
  static hasAction(model: IModel, actionName: string): boolean {
    return actionName in model.actions && typeof model.actions[actionName] === 'function'
  }

  /**
   * 检查 Method 是否存在
   */
  static hasMethod(model: IModel, methodName: string): boolean {
    return methodName in model.methods && typeof model.methods[methodName] === 'function'
  }

  /**
   * 检查 API 是否存在
   */
  static hasApi(model: IModel, apiName: string): boolean {
    return apiName in model.apis && typeof model.apis[apiName] === 'function'
  }

  /**
   * 检查 Hook 是否存在
   */
  static hasHook(model: IModel, hookName: string): boolean {
    return hookName in model.hooks && typeof (model.hooks as any)[hookName] === 'function'
  }
}

/**
 * 执行 Action 的快捷函数
 */
export async function executeAction(
  model: IModel,
  actionName: string,
  params?: any
): Promise<any> {
  return ModelExecutor.executeAction(model, actionName, params)
}

/**
 * 执行 Method 的快捷函数
 */
export async function executeMethod(
  model: IModel,
  methodName: string,
  ...args: any[]
): Promise<any> {
  return ModelExecutor.executeMethod(model, methodName, ...args)
}

/**
 * 调用 API 的快捷函数
 */
export async function callApi(
  model: IModel,
  apiName: string,
  ...args: any[]
): Promise<any> {
  return ModelExecutor.callApi(model, apiName, ...args)
}

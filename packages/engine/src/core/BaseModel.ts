/**
 * BaseModel - Model 基类
 * 提供面向对象方式定义 Model 的能力
 */

import type { ModelDefinition, ViewDefinitions, ActionDefinitions } from './types'
import { defineModel, type IModel } from './defineModel'
import { ModelExecutor } from './ModelExecutor'

/**
 * BaseModel 抽象基类
 *
 * 使用方式：
 * 1. 继承 BaseModel
 * 2. 实现 getDefinition() 方法
 * 3. 可选：使用装饰器标记 actions/methods
 *
 * @example
 * ```typescript
 * class UserModel extends BaseModel {
 *   protected getDefinition(): ModelDefinition {
 *     return {
 *       name: 'User',
 *       schema: {...},
 *       actions: (context) => ({
 *         activate: async ({ id }) => {
 *           await context.repository.updateOne(id, { isActive: true })
 *         }
 *       })
 *     }
 *   }
 * }
 *
 * const userModel = new UserModel()
 * await userModel.executeAction('activate', { id: '123' })
 * ```
 */
export abstract class BaseModel {
  private _model: IModel | null = null

  /**
   * 获取 Model 定义（需要子类实现）
   */
  protected abstract getDefinition(): ModelDefinition

  /**
   * 获取内部 Model 实例（懒加载）
   */
  protected get model(): IModel {
    if (!this._model) {
      this._model = defineModel(this.getDefinition())
    }
    return this._model
  }

  /**
   * 获取 Model 名称
   */
  get name(): string {
    return this.model.name
  }

  /**
   * 获取 Schema
   */
  get schema(): any {
    return this.model.schema
  }

  /**
   * 获取 Views
   */
  get views(): ViewDefinitions {
    return this.model.views
  }

  /**
   * 获取 Actions
   */
  get actions(): ActionDefinitions {
    return this.model.actions
  }

  /**
   * 获取 Model Context
   */
  get context() {
    return this.model.context
  }

  /**
   * 执行 Action
   *
   * @param actionName Action 名称
   * @param params Action 参数
   * @returns Action 执行结果
   */
  async executeAction(actionName: string, params?: any): Promise<any> {
    return ModelExecutor.executeAction(this.model, actionName, params)
  }

  /**
   * 执行 Method
   *
   * @param methodName Method 名称
   * @param args Method 参数
   * @returns Method 执行结果
   */
  async executeMethod(methodName: string, ...args: any[]): Promise<any> {
    return ModelExecutor.executeMethod(this.model, methodName, ...args)
  }

  /**
   * 调用 API
   *
   * @param apiName API 名称
   * @param args API 参数
   * @returns API 调用结果
   */
  async callApi(apiName: string, ...args: any[]): Promise<any> {
    return ModelExecutor.callApi(this.model, apiName, ...args)
  }

  /**
   * 执行生命周期钩子
   *
   * @param hookName Hook 名称
   * @param args Hook 参数
   * @returns Hook 执行结果
   */
  async executeHook(hookName: string, ...args: any[]): Promise<any> {
    return ModelExecutor.executeHook(this.model, hookName, ...args)
  }

  /**
   * 获取 View 配置
   *
   * @param viewName View 名称
   * @returns View 配置
   */
  getView(viewName: string): any {
    return this.model.views[viewName]
  }

  /**
   * 获取所有 View 名称
   */
  getViewNames(): string[] {
    return Object.keys(this.model.views)
  }

  /**
   * 获取所有 Action 名称
   */
  getActionNames(): string[] {
    return Object.keys(this.model.actions)
  }

  /**
   * 获取所有 API 名称
   */
  getApiNames(): string[] {
    return Object.keys(this.model.apis)
  }

  /**
   * 获取所有 Method 名称
   */
  getMethodNames(): string[] {
    return Object.keys(this.model.methods)
  }

  /**
   * 检查是否有指定的 Action
   */
  hasAction(actionName: string): boolean {
    return ModelExecutor.hasAction(this.model, actionName)
  }

  /**
   * 检查是否有指定的 Method
   */
  hasMethod(methodName: string): boolean {
    return ModelExecutor.hasMethod(this.model, methodName)
  }

  /**
   * 检查是否有指定的 API
   */
  hasApi(apiName: string): boolean {
    return ModelExecutor.hasApi(this.model, apiName)
  }

  /**
   * 检查是否有指定的 View
   */
  hasView(viewName: string): boolean {
    return viewName in this.model.views
  }

  /**
   * 获取内部 Model 实例（用于高级用法）
   */
  getModel(): IModel {
    return this.model
  }

  /**
   * 转换为 JSON（用于序列化）
   */
  toJSON() {
    return {
      name: this.name,
      views: Object.keys(this.views),
      actions: Object.keys(this.actions),
      apis: Object.keys(this.model.apis),
      methods: Object.keys(this.model.methods)
    }
  }

  /**
   * 转换为字符串
   */
  toString(): string {
    return `[Model: ${this.name}]`
  }
}

/**
 * 创建简单的 Model 实例（不使用类继承）
 *
 * @param definition Model 定义
 * @returns BaseModel 实例
 *
 * @example
 * ```typescript
 * const UserModel = createModel({
 *   name: 'User',
 *   schema: {...},
 *   actions: (context) => ({...})
 * })
 *
 * await UserModel.executeAction('activate', { id: '123' })
 * ```
 */
export function createModel(definition: ModelDefinition): BaseModel {
  return new (class extends BaseModel {
    protected getDefinition(): ModelDefinition {
      return definition
    }
  })()
}

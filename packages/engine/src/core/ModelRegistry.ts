/**
 * Model Registry - 模型注册表
 * 管理所有已注册的 Model
 */

import type { IModel } from './defineModel'
import { getEventBus } from '../event/EventBus'

/**
 * Model 注册表类
 * 使用单例模式管理全局的 Model 注册
 */
export class ModelRegistry {
  private static instance: ModelRegistry
  private models: Map<string, IModel> = new Map()

  private constructor() {}

  /**
   * 获取单例实例
   */
  static getInstance(): ModelRegistry {
    if (!ModelRegistry.instance) {
      ModelRegistry.instance = new ModelRegistry()
    }
    return ModelRegistry.instance
  }

  /**
   * 注册 Model
   * @param model Model 实例
   * @throws 如果 Model 已注册则抛出错误
   */
  register(model: IModel): void {
    if (this.models.has(model.name)) {
      throw new Error(`Model "${model.name}" is already registered`)
    }

    this.models.set(model.name, model)

    // 发布注册事件
    const eventBus = getEventBus()
    eventBus.publish({
      type: 'model:registered',
      payload: {
        modelName: model.name,
        viewCount: Object.keys(model.views).length,
        actionCount: Object.keys(model.actions).length,
        apiCount: Object.keys(model.apis).length
      },
      timestamp: Date.now()
    })
  }

  /**
   * 获取 Model
   * @param name Model 名称
   * @returns Model 实例，如果不存在返回 undefined
   */
  get(name: string): IModel | undefined {
    return this.models.get(name)
  }

  /**
   * 检查 Model 是否已注册
   * @param name Model 名称
   * @returns 是否已注册
   */
  has(name: string): boolean {
    return this.models.has(name)
  }

  /**
   * 取消注册 Model
   * @param name Model 名称
   * @returns 是否成功取消注册
   */
  unregister(name: string): boolean {
    const result = this.models.delete(name)

    if (result) {
      // 发布取消注册事件
      const eventBus = getEventBus()
      eventBus.publish({
        type: 'model:unregistered',
        payload: { modelName: name },
        timestamp: Date.now()
      })
    }

    return result
  }

  /**
   * 获取所有已注册的 Model
   * @returns Model 实例数组
   */
  getAll(): IModel[] {
    return Array.from(this.models.values())
  }

  /**
   * 获取所有 Model 名称
   * @returns Model 名称数组
   */
  getAllNames(): string[] {
    return Array.from(this.models.keys())
  }

  /**
   * 获取已注册的 Model 数量
   * @returns Model 数量
   */
  count(): number {
    return this.models.size
  }

  /**
   * 清空所有注册的 Model
   * 主要用于测试
   */
  clear(): void {
    const modelNames = this.getAllNames()
    this.models.clear()

    // 发布清空事件
    const eventBus = getEventBus()
    eventBus.publish({
      type: 'model:registry:cleared',
      payload: { clearedModels: modelNames },
      timestamp: Date.now()
    })
  }

  /**
   * 批量注册 Model
   * @param models Model 实例数组
   */
  registerMany(models: IModel[]): void {
    for (const model of models) {
      this.register(model)
    }
  }

  /**
   * 根据条件查找 Model
   * @param predicate 查找条件函数
   * @returns 符合条件的 Model 数组
   */
  find(predicate: (model: IModel) => boolean): IModel[] {
    return this.getAll().filter(predicate)
  }

  /**
   * 查找第一个符合条件的 Model
   * @param predicate 查找条件函数
   * @returns 符合条件的第一个 Model，如果没有返回 undefined
   */
  findOne(predicate: (model: IModel) => boolean): IModel | undefined {
    return this.getAll().find(predicate)
  }
}

/**
 * 获取全局 Model 注册表实例
 */
export function getModelRegistry(): ModelRegistry {
  return ModelRegistry.getInstance()
}

/**
 * 注册 Model 的快捷函数
 */
export function registerModel(model: IModel): void {
  const registry = getModelRegistry()
  registry.register(model)
}

/**
 * 获取 Model 的快捷函数
 */
export function getModel(name: string): IModel | undefined {
  const registry = getModelRegistry()
  return registry.get(name)
}

/**
 * 检查 Model 是否已注册的快捷函数
 */
export function hasModel(name: string): boolean {
  const registry = getModelRegistry()
  return registry.has(name)
}

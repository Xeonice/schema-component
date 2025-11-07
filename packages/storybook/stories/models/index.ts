/**
 * Storybook 模型注册中心
 *
 * 这个文件是所有演示模型的统一注册入口：
 * 1. 导入所有模型定义
 * 2. 提供统一的注册函数
 * 3. 导出模型供 stories 消费
 *
 * 使用方式：
 * - 在 preview.tsx 中调用 registerDemoModels(engineContext) 注册所有模型
 * - 在 stories 中直接使用模型名称引用，例如 modelName: 'User'
 */

import type { EngineContext } from '@schema-component/engine'
import {
  UserModel,
  ProductModel,
  OrderModel,
  ArticleModel,
  DashboardModel
} from './definitions'

/**
 * 所有演示模型的列表
 */
export const DEMO_MODELS = {
  User: UserModel,
  Product: ProductModel,
  Order: OrderModel,
  Article: ArticleModel,
  Dashboard: DashboardModel
} as const

/**
 * 模型名称类型
 */
export type DemoModelName = keyof typeof DEMO_MODELS

/**
 * 注册所有演示模型到 EngineContext
 *
 * @param engineContext - Engine 上下文实例
 *
 * @example
 * ```typescript
 * // 在 preview.tsx 中
 * import { registerDemoModels } from '../stories/models'
 *
 * const engineContext = createEngineContext({ debug: true })
 * registerDemoModels(engineContext)
 * ```
 */
export function registerDemoModels(engineContext: EngineContext): void {
  // 注册所有演示模型
  Object.values(DEMO_MODELS).forEach(model => {
    engineContext.registerModel(model)
  })

  if (engineContext.config.debug) {
    console.log('[Storybook] Registered demo models:', Object.keys(DEMO_MODELS))
  }
}

/**
 * 获取模型的视图列表
 *
 * @param modelName - 模型名称
 * @returns 视图名称数组
 *
 * @example
 * ```typescript
 * const userViews = getModelViews('User')
 * // ['form', 'formGrouped', 'formTwoColumn']
 * ```
 */
export function getModelViews(modelName: DemoModelName): string[] {
  const model = DEMO_MODELS[modelName]
  return Object.keys(model.views)
}

/**
 * 获取模型信息
 *
 * @param modelName - 模型名称
 * @returns 模型的基本信息
 */
export function getModelInfo(modelName: DemoModelName) {
  const model = DEMO_MODELS[modelName]
  return {
    name: model.name,
    views: Object.keys(model.views),
    actions: Object.keys(model.actions || {}),
    apis: Object.keys(model.apis || {}),
    fieldCount: Object.keys(model.schema.fields || {}).length
  }
}

/**
 * 导出所有模型定义供直接使用
 */
export {
  UserModel,
  ProductModel,
  OrderModel,
  ArticleModel,
  DashboardModel
}

/**
 * defineModel - 定义 Model 的核心函数
 */

import type {
  ModelDefinition,
  ModelContext,
  ViewDefinitions,
  ActionDefinitions,
  ApisDefinition,
  HooksDefinition,
  MethodsDefinition,
  ModelOptions,
  IRepository
} from './types'
import { createMockRepository } from '../repository/mock'
import { createRepository } from '../repository/RepositoryFactory'
import { createHttpClient } from '../http/HttpClient'
import { getEventBus } from '../event/EventBus'
import { createModelStore } from '../state/ModelStore'

/**
 * Model 接口
 * defineModel 返回的 Model 实例
 */
export interface IModel {
  /** Model 名称 */
  name: string

  /** Schema 定义 */
  schema: any

  /** 视图定义（已解析） */
  views: ViewDefinitions

  /** 动作定义（已解析） */
  actions: ActionDefinitions

  /** API 定义 */
  apis: ApisDefinition

  /** 生命周期钩子 */
  hooks: HooksDefinition

  /** 自定义方法 */
  methods: MethodsDefinition

  /** 选项配置 */
  options: ModelOptions

  /** Model 上下文 */
  context: ModelContext
}

/**
 * defineModel - 定义 Model
 *
 * @param definition Model 定义
 * @returns Model 实例
 *
 * @example
 * ```typescript
 * const UserModel = defineModel({
 *   name: 'User',
 *   schema: defineSchema({...}),
 *   views: (context) => ({
 *     list: { type: 'list', ... }
 *   }),
 *   actions: (context) => ({
 *     activate: async ({ id }) => {
 *       await context.repository.updateOne(id, { isActive: true })
 *     }
 *   }),
 *   apis: {
 *     getList: async (params) => { ... }
 *   }
 * })
 * ```
 */
export function defineModel(definition: ModelDefinition): IModel {
  // 验证必需字段
  if (!definition.name) {
    throw new Error('Model name is required')
  }

  if (!definition.schema) {
    throw new Error('Model schema is required')
  }

  // 1. 解析 Repository
  let repository: IRepository

  if (definition.repository) {
    // 如果提供了 repository
    if ('getList' in definition.repository) {
      // 是一个 IRepository 实例
      repository = definition.repository as IRepository
    } else {
      // 是 repository 配置
      const repoConfig = definition.repository as any
      if (repoConfig.type === 'http') {
        // HTTP Repository
        const httpClient = createHttpClient({
          baseURL: repoConfig.http?.baseURL,
          timeout: 30000
        })

        repository = createRepository({
          type: 'http',
          modelName: definition.name,
          http: {
            httpClient,
            resourcePath: repoConfig.http?.resourcePath || `/${definition.name.toLowerCase()}s`
          }
        })
      } else {
        // Mock Repository
        repository = createMockRepository(definition.name)
      }
    }
  } else {
    // 默认使用 Mock Repository
    repository = createMockRepository(definition.name)
  }

  // 2. 创建 Store（如果配置了）
  let store = undefined
  if (definition.store) {
    const storeConfig = typeof definition.store === 'object' ? definition.store : {}
    store = createModelStore({
      modelName: definition.name,
      repository,
      autoLoad: storeConfig.autoLoad,
      defaultPageSize: storeConfig.defaultPageSize
    })
  }

  // 3. 创建 Model Context
  const context: ModelContext = {
    modelName: definition.name,
    schema: definition.schema,
    repository,
    eventBus: getEventBus(),
    store
  }

  // 4. 解析 views（如果是函数则调用）
  let views: ViewDefinitions = {}
  if (definition.views) {
    if (typeof definition.views === 'function') {
      views = definition.views(context)
    } else {
      views = definition.views
    }
  }

  // 5. 解析 actions（如果是函数则调用）
  let actions: ActionDefinitions = {}
  if (definition.actions) {
    if (typeof definition.actions === 'function') {
      actions = definition.actions(context)
    } else {
      actions = definition.actions
    }
  }

  // 6. 创建 Model 实例
  const model: IModel = {
    name: definition.name,
    schema: definition.schema,
    views,
    actions,
    apis: definition.apis || {},
    hooks: definition.hooks || {},
    methods: definition.methods || {},
    options: definition.options || {},
    context
  }

  // 7. 发布 Model 创建事件
  context.eventBus.publish({
    type: 'model:defined',
    payload: {
      modelName: model.name,
      hasViews: Object.keys(views).length > 0,
      hasActions: Object.keys(actions).length > 0,
      hasApis: Object.keys(model.apis).length > 0,
      hasHooks: Object.keys(model.hooks).length > 0,
      hasMethods: Object.keys(model.methods).length > 0,
      hasStore: !!store
    },
    timestamp: Date.now()
  })

  return model
}

/**
 * 检查是否为 Model 实例
 */
export function isModel(obj: any): obj is IModel {
  return !!(
    obj &&
    typeof obj === 'object' &&
    'name' in obj &&
    'schema' in obj &&
    'context' in obj &&
    'views' in obj &&
    'actions' in obj &&
    'apis' in obj
  )
}

/**
 * 获取 Model 名称
 */
export function getModelName(model: IModel): string {
  return model.name
}

/**
 * 获取 Model 的 View 列表
 */
export function getModelViews(model: IModel): string[] {
  return Object.keys(model.views)
}

/**
 * 获取 Model 的 Action 列表
 */
export function getModelActions(model: IModel): string[] {
  return Object.keys(model.actions)
}

/**
 * 获取 Model 的 API 列表
 */
export function getModelApis(model: IModel): string[] {
  return Object.keys(model.apis)
}

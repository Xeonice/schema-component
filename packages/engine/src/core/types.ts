/**
 * Core types for @schema-component/engine
 */

import type { EventBus } from '../event/EventBus'

// ============================================================================
// Basic Types
// ============================================================================

export type ModelName = string
export type RecordId = string | number

// ============================================================================
// Forward Declarations (避免循环依赖)
// ============================================================================

export interface IRepository {
  getList(params: GetListParams): Promise<GetListResult>
  getOne(id: RecordId): Promise<any>
  createOne(data: any): Promise<any>
  updateOne(id: RecordId, data: any): Promise<any>
  deleteOne(id: RecordId): Promise<boolean>
  getMany(ids: RecordId[]): Promise<any[]>
  createMany(data: any[]): Promise<any[]>
  updateMany(ids: RecordId[], data: any): Promise<any[]>
  deleteMany(ids: RecordId[]): Promise<boolean>
}

// ============================================================================
// Query Types
// ============================================================================

/**
 * 列表查询参数
 */
export interface GetListParams {
  pagination?: {
    page: number
    pageSize: number
  }
  sort?: Array<{
    field: string
    order: 'ASC' | 'DESC'
  }>
  filter?: Record<string, any>
}

/**
 * 列表查询结果
 */
export interface GetListResult<T = any> {
  data: T[]
  total: number
  page?: number
  pageSize?: number
}

/**
 * 搜索条件
 */
export interface SearchCriteria {
  filter?: Record<string, any>
  sort?: Array<{ field: string; order: 'ASC' | 'DESC' }>
  pagination?: { page: number; pageSize: number }
  fields?: string[]
  relations?: string[]
}

/**
 * 搜索结果
 */
export interface SearchResult<T = any> {
  data: T[]
  total: number
  hasMore?: boolean
  cursor?: string
}

// ============================================================================
// Model Context
// ============================================================================

/**
 * Model 上下文
 * 提供给 actions/views 函数访问的上下文信息
 */
export interface ModelContext {
  modelName: string
  schema: any // 引用 @schema-component/schema
  repository: IRepository
  eventBus: EventBus
  store?: any // ModelStore 实例（可选，使用 MobX 时）
  [key: string]: any // 允许扩展自定义属性
}

// ============================================================================
// Model Definition
// ============================================================================

/**
 * Model 定义接口
 * 用于 defineModel() 函数的参数
 */
export interface ModelDefinition {
  // 基础元数据
  name: string

  // Schema 定义（字段）
  schema: any // SchemaDefinition from @schema-component/schema

  // 视图定义（函数或对象）
  views?: import('./viewTypes').ViewsDefinition

  // 动作定义（函数或对象）
  actions?: import('./actionTypes').ActionsDefinition

  // API 定义（可执行函数）
  apis?: import('./apiTypes').ApisDefinition

  // 生命周期钩子
  hooks?: import('./apiTypes').HooksDefinition

  // 自定义方法
  methods?: import('./apiTypes').MethodsDefinition

  // Repository 配置或实例
  repository?: IRepository | {
    type: 'mock' | 'http'
    http?: {
      baseURL?: string
      resourcePath?: string
    }
  }

  // Store 配置（MobX 状态管理）
  store?: boolean | {
    autoLoad?: boolean
    defaultPageSize?: number
  }

  // 选项配置
  options?: ModelOptions
}

/**
 * Model 选项
 */
export interface ModelOptions {
  tableName?: string
  description?: string
  timestamps?: boolean
  softDelete?: boolean
  [key: string]: any
}

// ============================================================================
// Re-exports from other type files
// ============================================================================

export type {
  ViewsDefinition,
  ViewDefinitions,
  ViewConfig,
  ViewType
} from './viewTypes'

export type {
  ActionsDefinition,
  ActionDefinitions,
  ActionFunction
} from './actionTypes'

export type {
  ApisDefinition,
  StandardApis,
  HooksDefinition,
  MethodsDefinition
} from './apiTypes'

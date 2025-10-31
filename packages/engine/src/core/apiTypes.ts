/**
 * API, Hooks, and Methods related types
 */

import type { GetListParams, GetListResult, RecordId } from './types'

// ============================================================================
// API Types
// ============================================================================

/**
 * 标准 CRUD API 接口
 * 这些是可执行的函数，而非配置对象
 */
export interface StandardApis {
  /** 获取列表 */
  getList?: (params: GetListParams) => Promise<GetListResult>

  /** 获取单个记录 */
  getOne?: (id: RecordId) => Promise<any>

  /** 创建单个记录 */
  createOne?: (data: any) => Promise<any>

  /** 更新单个记录 */
  updateOne?: (id: RecordId, data: any) => Promise<any>

  /** 删除单个记录 */
  deleteOne?: (id: RecordId) => Promise<boolean>

  /** 自定义 API 方法 */
  [customApi: string]: ((...args: any[]) => Promise<any>) | undefined
}

/**
 * APIs 定义
 * 所有 API 方法都是可执行的函数
 *
 * @example
 * ```typescript
 * apis: {
 *   getList: async (params) => {
 *     const response = await httpClient.get('/api/users', { params })
 *     return { data: response.data.users, total: response.data.total }
 *   },
 *   activate: async (id: string) => {
 *     await httpClient.post(`/api/users/${id}/activate`)
 *   }
 * }
 * ```
 */
export type ApisDefinition = StandardApis

// ============================================================================
// Hooks Types
// ============================================================================

/**
 * 生命周期钩子定义
 * 所有钩子都是可选的异步函数
 */
export interface HooksDefinition {
  // ========== Create Hooks ==========
  /** 创建前钩子：可以修改数据 */
  beforeCreate?: (data: any) => Promise<any>

  /** 创建后钩子：执行副作用操作 */
  afterCreate?: (record: any) => Promise<void>

  // ========== Read Hooks ==========
  /** 读取前钩子：执行权限检查等 */
  beforeRead?: (id: RecordId) => Promise<void>

  /** 读取后钩子：可以转换数据 */
  afterRead?: (record: any) => Promise<any>

  // ========== Update Hooks ==========
  /** 更新前钩子：可以修改数据 */
  beforeUpdate?: (id: RecordId, data: any) => Promise<any>

  /** 更新后钩子：执行副作用操作 */
  afterUpdate?: (record: any) => Promise<void>

  // ========== Delete Hooks ==========
  /** 删除前钩子：返回 false 可阻止删除 */
  beforeDelete?: (id: RecordId) => Promise<boolean>

  /** 删除后钩子：清理关联数据等 */
  afterDelete?: (id: RecordId) => Promise<void>

  // ========== Search Hooks ==========
  /** 搜索前钩子：可以修改搜索条件 */
  beforeSearch?: (criteria: any) => Promise<any>

  /** 搜索后钩子：可以转换结果 */
  afterSearch?: (results: any[]) => Promise<any[]>
}

// ============================================================================
// Methods Types
// ============================================================================

/**
 * 自定义方法定义
 * 用于定义模型的业务方法
 *
 * @example
 * ```typescript
 * methods: {
 *   async activate(id: string) {
 *     return this.update(id, { isActive: true })
 *   },
 *   async resetPassword(id: string) {
 *     const newPassword = generateRandomPassword()
 *     await this.update(id, { password: hashPassword(newPassword) })
 *     return { success: true }
 *   }
 * }
 * ```
 */
export interface MethodsDefinition {
  [methodName: string]: (...args: any[]) => Promise<any>
}

// ============================================================================
// Hook Execution Types
// ============================================================================

/**
 * 钩子执行选项
 */
export interface HookExecuteOptions {
  /** 跳过指定的钩子 */
  skip?: string[]
  /** 超时时间（毫秒） */
  timeout?: number
  /** 额外的上下文数据 */
  extraContext?: Record<string, any>
}

/**
 * 钩子执行结果
 */
export interface HookExecuteResult<T = any> {
  success: boolean
  data?: T
  error?: Error
  hookName: string
  duration?: number
}

/**
 * State Layer Types
 * State 层类型定义（基于 MobX）
 */

import type { IRepository, GetListParams } from '../core/types'

/**
 * 加载状态
 */
export type LoadingState = 'idle' | 'pending' | 'success' | 'error'

/**
 * Store 配置
 */
export interface StoreConfig {
  /** Model 名称 */
  modelName: string

  /** Repository 实例 */
  repository: IRepository

  /** 是否自动加载数据 */
  autoLoad?: boolean

  /** 默认分页大小 */
  defaultPageSize?: number
}

/**
 * Store 状态接口
 */
export interface IModelStore<T = any> {
  // ============================================================================
  // 状态数据
  // ============================================================================

  /** 记录列表 */
  records: T[]

  /** 当前选中的记录 */
  current: T | null

  /** 总记录数 */
  total: number

  /** 当前页码 */
  page: number

  /** 每页大小 */
  pageSize: number

  /** 加载状态 */
  loadingState: LoadingState

  /** 错误信息 */
  error: Error | null

  // ============================================================================
  // 计算属性
  // ============================================================================

  /** 是否正在加载 */
  readonly isLoading: boolean

  /** 是否有错误 */
  readonly hasError: boolean

  /** 是否有数据 */
  readonly hasData: boolean

  /** 总页数 */
  readonly totalPages: number

  // ============================================================================
  // Actions
  // ============================================================================

  /**
   * 加载列表数据
   */
  loadList(params?: GetListParams): Promise<void>

  /**
   * 加载单个记录
   */
  loadOne(id: string | number): Promise<void>

  /**
   * 创建记录
   */
  create(data: Partial<T>): Promise<T>

  /**
   * 更新记录
   */
  update(id: string | number, data: Partial<T>): Promise<T>

  /**
   * 删除记录
   */
  delete(id: string | number): Promise<boolean>

  /**
   * 设置当前记录
   */
  setCurrent(record: T | null): void

  /**
   * 设置分页
   */
  setPage(page: number): void

  /**
   * 设置每页大小
   */
  setPageSize(pageSize: number): void

  /**
   * 重置状态
   */
  reset(): void

  /**
   * 清空错误
   */
  clearError(): void
}

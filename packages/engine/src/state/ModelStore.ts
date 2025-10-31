/**
 * Model Store
 * 基于 MobX 的响应式状态管理
 */

import { makeObservable, observable, computed, action, runInAction } from 'mobx'
import type { IRepository, GetListParams } from '../core/types'
import type { IModelStore, StoreConfig, LoadingState } from './types'

/**
 * Model Store 类
 * 管理 Model 的响应式状态
 */
export class ModelStore<T = any> implements IModelStore<T> {
  // ============================================================================
  // Observable State
  // ============================================================================

  records: T[] = []
  current: T | null = null
  total: number = 0
  page: number = 1
  pageSize: number = 20
  loadingState: LoadingState = 'idle'
  error: Error | null = null

  // ============================================================================
  // Private Fields
  // ============================================================================

  private repository: IRepository
  private modelName: string

  // ============================================================================
  // Constructor
  // ============================================================================

  constructor(config: StoreConfig) {
    this.modelName = config.modelName
    this.repository = config.repository
    this.pageSize = config.defaultPageSize || 20

    // 使 MobX 可观察
    makeObservable(this, {
      // Observable
      records: observable,
      current: observable,
      total: observable,
      page: observable,
      pageSize: observable,
      loadingState: observable,
      error: observable,

      // Computed
      isLoading: computed,
      hasError: computed,
      hasData: computed,
      totalPages: computed,

      // Actions
      loadList: action,
      loadOne: action,
      create: action,
      update: action,
      delete: action,
      setCurrent: action,
      setPage: action,
      setPageSize: action,
      reset: action,
      clearError: action
    })

    // 自动加载
    if (config.autoLoad) {
      this.loadList()
    }
  }

  // ============================================================================
  // Computed Properties
  // ============================================================================

  get isLoading(): boolean {
    return this.loadingState === 'pending'
  }

  get hasError(): boolean {
    return this.loadingState === 'error' && this.error !== null
  }

  get hasData(): boolean {
    return this.records.length > 0
  }

  get totalPages(): number {
    return Math.ceil(this.total / this.pageSize)
  }

  // ============================================================================
  // Actions
  // ============================================================================

  /**
   * 加载列表数据
   */
  async loadList(params?: GetListParams): Promise<void> {
    this.loadingState = 'pending'
    this.error = null

    try {
      const result = await this.repository.getList({
        pagination: {
          page: params?.pagination?.page || this.page,
          pageSize: params?.pagination?.pageSize || this.pageSize
        },
        filter: params?.filter,
        sort: params?.sort
      })

      runInAction(() => {
        this.records = result.data
        this.total = result.total
        this.page = result.page || this.page
        this.pageSize = result.pageSize || this.pageSize
        this.loadingState = 'success'
      })
    } catch (error) {
      runInAction(() => {
        this.error = error as Error
        this.loadingState = 'error'
      })
      throw error
    }
  }

  /**
   * 加载单个记录
   */
  async loadOne(id: string | number): Promise<void> {
    this.loadingState = 'pending'
    this.error = null

    try {
      const record = await this.repository.getOne(id)

      runInAction(() => {
        this.current = record
        this.loadingState = 'success'
      })
    } catch (error) {
      runInAction(() => {
        this.error = error as Error
        this.loadingState = 'error'
      })
      throw error
    }
  }

  /**
   * 创建记录
   */
  async create(data: Partial<T>): Promise<T> {
    this.loadingState = 'pending'
    this.error = null

    try {
      const created = await this.repository.createOne(data)

      runInAction(() => {
        this.records.push(created)
        this.total++
        this.loadingState = 'success'
      })

      return created
    } catch (error) {
      runInAction(() => {
        this.error = error as Error
        this.loadingState = 'error'
      })
      throw error
    }
  }

  /**
   * 更新记录
   */
  async update(id: string | number, data: Partial<T>): Promise<T> {
    this.loadingState = 'pending'
    this.error = null

    try {
      const updated = await this.repository.updateOne(id, data)

      runInAction(() => {
        // 更新 records 中的记录
        const index = this.records.findIndex((r: any) => r.id === id)
        if (index !== -1) {
          this.records[index] = updated
        }

        // 更新 current
        if (this.current && (this.current as any).id === id) {
          this.current = updated
        }

        this.loadingState = 'success'
      })

      return updated
    } catch (error) {
      runInAction(() => {
        this.error = error as Error
        this.loadingState = 'error'
      })
      throw error
    }
  }

  /**
   * 删除记录
   */
  async delete(id: string | number): Promise<boolean> {
    this.loadingState = 'pending'
    this.error = null

    try {
      const result = await this.repository.deleteOne(id)

      runInAction(() => {
        // 从 records 中移除
        this.records = this.records.filter((r: any) => r.id !== id)
        this.total--

        // 清空 current
        if (this.current && (this.current as any).id === id) {
          this.current = null
        }

        this.loadingState = 'success'
      })

      return result
    } catch (error) {
      runInAction(() => {
        this.error = error as Error
        this.loadingState = 'error'
      })
      throw error
    }
  }

  /**
   * 设置当前记录
   */
  setCurrent(record: T | null): void {
    this.current = record
  }

  /**
   * 设置分页
   */
  setPage(page: number): void {
    this.page = page
  }

  /**
   * 设置每页大小
   */
  setPageSize(pageSize: number): void {
    this.pageSize = pageSize
  }

  /**
   * 重置状态
   */
  reset(): void {
    this.records = []
    this.current = null
    this.total = 0
    this.page = 1
    this.loadingState = 'idle'
    this.error = null
  }

  /**
   * 清空错误
   */
  clearError(): void {
    this.error = null
    if (this.loadingState === 'error') {
      this.loadingState = 'idle'
    }
  }
}

/**
 * 创建 Model Store
 */
export function createModelStore<T = any>(config: StoreConfig): ModelStore<T> {
  return new ModelStore<T>(config)
}

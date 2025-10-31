/**
 * Mock Repository
 * 用于测试和开发阶段
 */

import type { IRepository, GetListParams, GetListResult, RecordId } from '../core/types'

/**
 * Mock 数据存储
 */
class MockDataStore {
  private data: Map<string, Map<RecordId, any>> = new Map()
  private idCounter: Map<string, number> = new Map()

  constructor() {}

  /**
   * 获取模型的数据存储
   */
  private getModelStore(modelName: string): Map<RecordId, any> {
    if (!this.data.has(modelName)) {
      this.data.set(modelName, new Map())
    }
    return this.data.get(modelName)!
  }

  /**
   * 生成 ID
   */
  private generateId(modelName: string): string {
    const counter = this.idCounter.get(modelName) || 0
    const newId = `${modelName.toLowerCase()}-${counter + 1}`
    this.idCounter.set(modelName, counter + 1)
    return newId
  }

  /**
   * 获取列表
   */
  getList(modelName: string, params: GetListParams): any[] {
    const store = this.getModelStore(modelName)
    let records = Array.from(store.values())

    // 应用过滤
    if (params.filter) {
      records = records.filter(record => {
        return Object.entries(params.filter!).every(([key, value]) => {
          return record[key] === value
        })
      })
    }

    // 应用排序
    if (params.sort && params.sort.length > 0) {
      records.sort((a, b) => {
        for (const sortItem of params.sort!) {
          const aVal = a[sortItem.field]
          const bVal = b[sortItem.field]

          if (aVal < bVal) return sortItem.order === 'ASC' ? -1 : 1
          if (aVal > bVal) return sortItem.order === 'ASC' ? 1 : -1
        }
        return 0
      })
    }

    // 应用分页
    if (params.pagination) {
      const { page, pageSize } = params.pagination
      const start = (page - 1) * pageSize
      const end = start + pageSize
      return records.slice(start, end)
    }

    return records
  }

  /**
   * 获取总数
   */
  getTotal(modelName: string, params: GetListParams): number {
    const store = this.getModelStore(modelName)
    let records = Array.from(store.values())

    // 应用过滤
    if (params.filter) {
      records = records.filter(record => {
        return Object.entries(params.filter!).every(([key, value]) => {
          return record[key] === value
        })
      })
    }

    return records.length
  }

  /**
   * 获取单个记录
   */
  getOne(modelName: string, id: RecordId): any | null {
    const store = this.getModelStore(modelName)
    return store.get(id) || null
  }

  /**
   * 创建记录
   */
  createOne(modelName: string, data: any): any {
    const store = this.getModelStore(modelName)
    const id = data.id || this.generateId(modelName)

    const record = {
      id,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    store.set(id, record)
    return record
  }

  /**
   * 更新记录
   */
  updateOne(modelName: string, id: RecordId, data: any): any | null {
    const store = this.getModelStore(modelName)
    const existing = store.get(id)

    if (!existing) {
      return null
    }

    const updated = {
      ...existing,
      ...data,
      id, // 保持 ID 不变
      updatedAt: new Date().toISOString()
    }

    store.set(id, updated)
    return updated
  }

  /**
   * 删除记录
   */
  deleteOne(modelName: string, id: RecordId): boolean {
    const store = this.getModelStore(modelName)
    return store.delete(id)
  }

  /**
   * 清空模型数据
   */
  clear(modelName?: string): void {
    if (modelName) {
      this.data.delete(modelName)
      this.idCounter.delete(modelName)
    } else {
      this.data.clear()
      this.idCounter.clear()
    }
  }
}

// 全局 Mock 数据存储
const globalMockStore = new MockDataStore()

/**
 * Mock Repository 实现
 */
export class MockRepository implements IRepository {
  constructor(
    private modelName: string,
    private store: MockDataStore = globalMockStore
  ) {}

  async getList(params: GetListParams): Promise<GetListResult> {
    const data = this.store.getList(this.modelName, params)
    const total = this.store.getTotal(this.modelName, params)

    return {
      data,
      total,
      page: params.pagination?.page,
      pageSize: params.pagination?.pageSize
    }
  }

  async getOne(id: RecordId): Promise<any> {
    const record = this.store.getOne(this.modelName, id)
    if (!record) {
      throw new Error(`Record with id ${id} not found`)
    }
    return record
  }

  async createOne(data: any): Promise<any> {
    return this.store.createOne(this.modelName, data)
  }

  async updateOne(id: RecordId, data: any): Promise<any> {
    const updated = this.store.updateOne(this.modelName, id, data)
    if (!updated) {
      throw new Error(`Record with id ${id} not found`)
    }
    return updated
  }

  async deleteOne(id: RecordId): Promise<boolean> {
    return this.store.deleteOne(this.modelName, id)
  }

  async getMany(ids: RecordId[]): Promise<any[]> {
    return ids
      .map(id => this.store.getOne(this.modelName, id))
      .filter(record => record !== null)
  }

  async createMany(data: any[]): Promise<any[]> {
    return data.map(item => this.store.createOne(this.modelName, item))
  }

  async updateMany(ids: RecordId[], data: any): Promise<any[]> {
    return ids
      .map(id => this.store.updateOne(this.modelName, id, data))
      .filter(record => record !== null)
  }

  async deleteMany(ids: RecordId[]): Promise<boolean> {
    const results = ids.map(id => this.store.deleteOne(this.modelName, id))
    return results.every(result => result === true)
  }

  /**
   * 清空数据（仅用于测试）
   */
  clear(): void {
    this.store.clear(this.modelName)
  }
}

/**
 * 创建 Mock Repository
 */
export function createMockRepository(modelName: string = 'Mock'): MockRepository {
  return new MockRepository(modelName)
}

/**
 * 获取全局 Mock Store（用于测试）
 */
export function getMockStore(): MockDataStore {
  return globalMockStore
}

/**
 * 清空所有 Mock 数据（用于测试）
 */
export function clearAllMockData(): void {
  globalMockStore.clear()
}

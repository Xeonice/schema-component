/**
 * HTTP Repository
 * 基于 HTTP/REST API 的 Repository 实现
 */

import type { IRepository, GetListParams, GetListResult, RecordId } from '../core/types'
import type { RestClient } from '../http/RestClient'

/**
 * HTTP Repository 配置
 */
export interface HttpRepositoryConfig {
  /** REST Client 实例 */
  restClient: RestClient

  /** 是否自动调用 hooks（由 Model 层处理） */
  autoHooks?: boolean
}

/**
 * HTTP Repository 类
 * 通过 REST API 进行数据访问
 */
export class HttpRepository implements IRepository {
  private restClient: RestClient
  private autoHooks: boolean

  constructor(config: HttpRepositoryConfig) {
    this.restClient = config.restClient
    this.autoHooks = config.autoHooks ?? false
  }

  /**
   * 获取列表
   */
  async getList(params: GetListParams = {}): Promise<GetListResult> {
    return this.restClient.getList(params)
  }

  /**
   * 获取单个记录
   */
  async getOne(id: RecordId): Promise<any> {
    return this.restClient.getOne(id)
  }

  /**
   * 获取多个记录
   */
  async getMany(ids: RecordId[]): Promise<any[]> {
    return this.restClient.getMany(ids)
  }

  /**
   * 创建单个记录
   */
  async createOne(data: any): Promise<any> {
    return this.restClient.createOne(data)
  }

  /**
   * 创建多个记录
   */
  async createMany(data: any[]): Promise<any[]> {
    return this.restClient.createMany(data)
  }

  /**
   * 更新单个记录
   */
  async updateOne(id: RecordId, data: any): Promise<any> {
    return this.restClient.updateOne(id, data)
  }

  /**
   * 更新多个记录
   */
  async updateMany(ids: RecordId[], data: any): Promise<any[]> {
    return this.restClient.updateMany(ids, data)
  }

  /**
   * 删除单个记录
   */
  async deleteOne(id: RecordId): Promise<boolean> {
    return this.restClient.deleteOne(id)
  }

  /**
   * 删除多个记录
   */
  async deleteMany(ids: RecordId[]): Promise<boolean> {
    return this.restClient.deleteMany(ids)
  }

  /**
   * 清空所有数据（通常不在 HTTP Repository 中实现）
   */
  clear(): void {
    throw new Error('HttpRepository.clear() is not supported. Use deleteMany() instead.')
  }

  /**
   * 获取 REST Client 实例
   */
  getRestClient(): RestClient {
    return this.restClient
  }
}

/**
 * 创建 HTTP Repository 实例
 */
export function createHttpRepository(config: HttpRepositoryConfig): HttpRepository {
  return new HttpRepository(config)
}

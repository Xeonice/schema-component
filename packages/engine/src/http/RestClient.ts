/**
 * REST API Client
 * 提供面向资源的 REST API 操作
 */

import type { IHttpClient, HttpResponse, HttpRequestConfig } from './types'
import type { GetListParams, GetListResult } from '../repository/types'

/**
 * REST Client 配置
 */
export interface RestClientConfig {
  /** HTTP 客户端实例 */
  httpClient: IHttpClient

  /** 资源基础路径 */
  resourcePath: string

  /** ID 字段名 */
  idField?: string
}

/**
 * REST API Client 类
 * 提供标准的 REST API 操作（CRUD）
 */
export class RestClient {
  private httpClient: IHttpClient
  private resourcePath: string
  private idField: string

  constructor(config: RestClientConfig) {
    this.httpClient = config.httpClient
    this.resourcePath = config.resourcePath
    this.idField = config.idField || 'id'
  }

  /**
   * 获取列表
   * GET /resource
   */
  async getList<T = any>(params?: GetListParams): Promise<GetListResult<T>> {
    const queryParams: Record<string, any> = {}

    // 处理分页参数
    if (params?.pagination) {
      queryParams.page = params.pagination.page
      queryParams.pageSize = params.pagination.pageSize
    }

    // 处理排序参数
    if (params?.sort && params.sort.length > 0) {
      queryParams.sort = params.sort
        .map((s) => `${s.field}:${s.order}`)
        .join(',')
    }

    // 处理过滤参数
    if (params?.filter) {
      Object.entries(params.filter).forEach(([key, value]) => {
        queryParams[key] = value
      })
    }

    const response = await this.httpClient.get<GetListResult<T>>(this.resourcePath, {
      params: queryParams
    })

    return response.data
  }

  /**
   * 获取单个记录
   * GET /resource/:id
   */
  async getOne<T = any>(id: string | number): Promise<T> {
    const url = `${this.resourcePath}/${id}`
    const response = await this.httpClient.get<T>(url)
    return response.data
  }

  /**
   * 获取多个记录
   * GET /resource?ids=1,2,3
   */
  async getMany<T = any>(ids: Array<string | number>): Promise<T[]> {
    const response = await this.httpClient.get<T[]>(this.resourcePath, {
      params: {
        ids: ids.join(',')
      }
    })
    return response.data
  }

  /**
   * 创建单个记录
   * POST /resource
   */
  async createOne<T = any>(data: any): Promise<T> {
    const response = await this.httpClient.post<T>(this.resourcePath, data)
    return response.data
  }

  /**
   * 创建多个记录
   * POST /resource/batch
   */
  async createMany<T = any>(data: any[]): Promise<T[]> {
    const url = `${this.resourcePath}/batch`
    const response = await this.httpClient.post<T[]>(url, data)
    return response.data
  }

  /**
   * 更新单个记录
   * PUT /resource/:id
   */
  async updateOne<T = any>(id: string | number, data: any): Promise<T> {
    const url = `${this.resourcePath}/${id}`
    const response = await this.httpClient.put<T>(url, data)
    return response.data
  }

  /**
   * 部分更新单个记录
   * PATCH /resource/:id
   */
  async patchOne<T = any>(id: string | number, data: any): Promise<T> {
    const url = `${this.resourcePath}/${id}`
    const response = await this.httpClient.patch<T>(url, data)
    return response.data
  }

  /**
   * 更新多个记录
   * PUT /resource/batch
   */
  async updateMany<T = any>(ids: Array<string | number>, data: any): Promise<T[]> {
    const url = `${this.resourcePath}/batch`
    const response = await this.httpClient.put<T[]>(url, { ids, data })
    return response.data
  }

  /**
   * 删除单个记录
   * DELETE /resource/:id
   */
  async deleteOne(id: string | number): Promise<boolean> {
    const url = `${this.resourcePath}/${id}`
    await this.httpClient.delete(url)
    return true
  }

  /**
   * 删除多个记录
   * DELETE /resource/batch
   */
  async deleteMany(ids: Array<string | number>): Promise<boolean> {
    const url = `${this.resourcePath}/batch`
    await this.httpClient.delete(url, {
      data: { ids }
    })
    return true
  }

  /**
   * 自定义请求
   */
  async request<T = any>(config: HttpRequestConfig): Promise<HttpResponse<T>> {
    return this.httpClient.request<T>(config)
  }

  /**
   * 获取资源路径
   */
  getResourcePath(): string {
    return this.resourcePath
  }

  /**
   * 获取 HTTP 客户端
   */
  getHttpClient(): IHttpClient {
    return this.httpClient
  }
}

/**
 * 创建 REST Client 实例
 */
export function createRestClient(config: RestClientConfig): RestClient {
  return new RestClient(config)
}

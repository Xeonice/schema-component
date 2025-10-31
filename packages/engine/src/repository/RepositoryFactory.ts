/**
 * Repository Factory
 * 用于创建不同类型的 Repository 实例
 */

import type { IRepository } from '../core/types'
import type { IHttpClient } from '../http/types'
import { createMockRepository, MockRepository } from './mock'
import { createHttpRepository, HttpRepository } from './HttpRepository'
import { createRestClient } from '../http/RestClient'

/**
 * Repository 类型
 */
export type RepositoryType = 'mock' | 'http'

/**
 * Repository 配置（通用）
 */
export interface RepositoryConfig {
  /** Repository 类型 */
  type: RepositoryType

  /** Model 名称（用于 Mock Repository） */
  modelName: string

  /** HTTP 配置（用于 HTTP Repository） */
  http?: {
    /** HTTP 客户端实例 */
    httpClient: IHttpClient

    /** 资源路径 */
    resourcePath: string
  }
}

/**
 * Repository Factory 类
 */
export class RepositoryFactory {
  /**
   * 创建 Repository 实例
   */
  static create(config: RepositoryConfig): IRepository {
    switch (config.type) {
      case 'mock':
        return createMockRepository(config.modelName)

      case 'http':
        if (!config.http) {
          throw new Error('HTTP configuration is required for HTTP repository')
        }

        const restClient = createRestClient({
          httpClient: config.http.httpClient,
          resourcePath: config.http.resourcePath
        })

        return createHttpRepository({ restClient })

      default:
        throw new Error(`Unknown repository type: ${config.type}`)
    }
  }

  /**
   * 创建 Mock Repository
   */
  static createMock(modelName: string): MockRepository {
    return createMockRepository(modelName)
  }

  /**
   * 创建 HTTP Repository
   */
  static createHttp(httpClient: IHttpClient, resourcePath: string): HttpRepository {
    const restClient = createRestClient({
      httpClient,
      resourcePath
    })

    return createHttpRepository({ restClient })
  }
}

/**
 * 便捷函数：创建 Repository
 */
export function createRepository(config: RepositoryConfig): IRepository {
  return RepositoryFactory.create(config)
}

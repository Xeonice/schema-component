import type { ApiClient, ListQueryParams, PaginatedResponse } from './types'
import { getApiClient } from './ApiClient'

/**
 * Resource configuration
 */
export interface ResourceConfig {
  /** Resource name (e.g., 'users', 'posts') */
  name: string
  /** Base path (defaults to /api/{name}) */
  basePath?: string
  /** API client instance */
  client?: ApiClient
}

/**
 * CRUD Resource class
 * Provides standard REST operations for a resource
 */
export class Resource<T = any> {
  private name: string
  private basePath: string
  private client: ApiClient

  constructor(config: ResourceConfig) {
    this.name = config.name
    this.basePath = config.basePath || `/api/${config.name}`
    this.client = config.client || getApiClient()
  }

  /**
   * Get the resource path
   */
  getPath(id?: string | number): string {
    return id ? `${this.basePath}/${id}` : this.basePath
  }

  /**
   * List resources with pagination and filtering
   */
  async list(params?: ListQueryParams): Promise<PaginatedResponse<T>> {
    const response = await this.client.get<PaginatedResponse<T>>(this.getPath(), params)
    return response.data
  }

  /**
   * Get a single resource by ID
   */
  async get(id: string | number): Promise<T> {
    const response = await this.client.get<T>(this.getPath(id))
    return response.data
  }

  /**
   * Create a new resource
   */
  async create(data: Partial<T>): Promise<T> {
    const response = await this.client.post<T>(this.getPath(), data)
    return response.data
  }

  /**
   * Update an existing resource (full update)
   */
  async update(id: string | number, data: Partial<T>): Promise<T> {
    const response = await this.client.put<T>(this.getPath(id), data)
    return response.data
  }

  /**
   * Partially update a resource
   */
  async patch(id: string | number, data: Partial<T>): Promise<T> {
    const response = await this.client.patch<T>(this.getPath(id), data)
    return response.data
  }

  /**
   * Delete a resource
   */
  async delete(id: string | number): Promise<void> {
    await this.client.delete(this.getPath(id))
  }

  /**
   * Bulk delete resources
   */
  async bulkDelete(ids: (string | number)[]): Promise<void> {
    await this.client.post(`${this.basePath}/bulk-delete`, { ids })
  }

  /**
   * Custom action on a resource
   */
  async action(id: string | number, action: string, data?: any): Promise<any> {
    const response = await this.client.post(`${this.getPath(id)}/${action}`, data)
    return response.data
  }

  /**
   * Custom collection action
   */
  async collectionAction(action: string, data?: any): Promise<any> {
    const response = await this.client.post(`${this.basePath}/${action}`, data)
    return response.data
  }
}

/**
 * Create a new resource instance
 */
export function createResource<T = any>(config: ResourceConfig): Resource<T> {
  return new Resource<T>(config)
}

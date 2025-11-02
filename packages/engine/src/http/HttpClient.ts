/**
 * HTTP Client Implementation
 * 基于 axios 的 HTTP 客户端实现
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import type {
  IHttpClient,
  HttpClientConfig,
  HttpRequestConfig,
  HttpResponse,
  HttpError,
  RequestInterceptor,
  RequestErrorInterceptor,
  ResponseInterceptor,
  ResponseErrorInterceptor
} from './types'

/**
 * HTTP Client 类
 * 封装 axios，提供统一的 HTTP 请求接口
 */
export class HttpClient implements IHttpClient {
  private axiosInstance: AxiosInstance
  private requestInterceptors: Map<number, any> = new Map()
  private responseInterceptors: Map<number, any> = new Map()
  private interceptorId: number = 0

  constructor(config: HttpClientConfig = {}) {
    // 创建 axios 实例
    this.axiosInstance = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout || 30000,
      headers: config.headers || {},
      withCredentials: config.withCredentials,
      responseType: config.responseType || 'json'
    })

    // 设置默认的请求/响应拦截器
    this.setupDefaultInterceptors()
  }

  /**
   * 设置默认拦截器
   */
  private setupDefaultInterceptors(): void {
    // 默认请求拦截器：添加通用请求头
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // 可以在这里添加通用的请求头，如 Authorization
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // 默认响应拦截器：转换响应格式
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse): any => {
        return this.transformResponse(response)
      },
      (error: AxiosError) => {
        return Promise.reject(this.transformError(error))
      }
    )
  }

  /**
   * 转换 axios 响应为统一格式
   */
  private transformResponse(axiosResponse: AxiosResponse): HttpResponse {
    return {
      data: axiosResponse.data,
      status: axiosResponse.status,
      statusText: axiosResponse.statusText,
      headers: axiosResponse.headers as Record<string, string>,
      config: {
        ...axiosResponse.config,
        url: axiosResponse.config?.url || ''
      } as HttpRequestConfig
    }
  }

  /**
   * 转换 axios 错误为统一格式
   */
  private transformError(axiosError: AxiosError): HttpError {
    const error = new Error(axiosError.message) as HttpError
    error.name = 'HttpError'
    error.config = axiosError.config as HttpRequestConfig
    error.code = axiosError.code

    // 判断错误类型
    if (axiosError.response) {
      // 服务器返回了错误响应
      error.response = this.transformResponse(axiosError.response)
      error.isNetworkError = false
    } else {
      // 没有响应（网络错误、超时等）
      error.isNetworkError = true
    }

    // 判断是否超时
    error.isTimeout = axiosError.code === 'ECONNABORTED'

    return error
  }


  /**
   * GET 请求
   */
  async get<T = any>(url: string, config?: Omit<HttpRequestConfig, 'url'>): Promise<HttpResponse<T>> {
    return this.request<T>({
      url,
      method: 'GET',
      ...config
    })
  }

  /**
   * POST 请求
   */
  async post<T = any>(
    url: string,
    data?: any,
    config?: Omit<HttpRequestConfig, 'url'>
  ): Promise<HttpResponse<T>> {
    return this.request<T>({
      url,
      method: 'POST',
      data,
      ...config
    })
  }

  /**
   * PUT 请求
   */
  async put<T = any>(
    url: string,
    data?: any,
    config?: Omit<HttpRequestConfig, 'url'>
  ): Promise<HttpResponse<T>> {
    return this.request<T>({
      url,
      method: 'PUT',
      data,
      ...config
    })
  }

  /**
   * PATCH 请求
   */
  async patch<T = any>(
    url: string,
    data?: any,
    config?: Omit<HttpRequestConfig, 'url'>
  ): Promise<HttpResponse<T>> {
    return this.request<T>({
      url,
      method: 'PATCH',
      data,
      ...config
    })
  }

  /**
   * DELETE 请求
   */
  async delete<T = any>(url: string, config?: Omit<HttpRequestConfig, 'url'>): Promise<HttpResponse<T>> {
    return this.request<T>({
      url,
      method: 'DELETE',
      ...config
    })
  }

  /**
   * 通用请求方法
   */
  async request<T = any>(config: HttpRequestConfig): Promise<HttpResponse<T>> {
    try {
      const response = await this.axiosInstance.request<T>(config as AxiosRequestConfig)
      return response as any as HttpResponse<T>
    } catch (error) {
      throw error
    }
  }

  /**
   * 添加请求拦截器
   */
  addRequestInterceptor(
    onFulfilled: RequestInterceptor,
    onRejected?: RequestErrorInterceptor
  ): number {
    const id = this.interceptorId++

    const axiosId = this.axiosInstance.interceptors.request.use(
      (config) => {
        return onFulfilled(config as HttpRequestConfig) as any
      },
      onRejected
    )

    this.requestInterceptors.set(id, axiosId)
    return id
  }

  /**
   * 添加响应拦截器
   */
  addResponseInterceptor(
    onFulfilled: ResponseInterceptor,
    onRejected?: ResponseErrorInterceptor
  ): number {
    const id = this.interceptorId++

    const axiosId = this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        const httpResponse = this.transformResponse(response)
        return onFulfilled(httpResponse) as any
      },
      (error: AxiosError) => {
        const httpError = this.transformError(error)
        return onRejected ? onRejected(httpError) : Promise.reject(httpError)
      }
    )

    this.responseInterceptors.set(id, axiosId)
    return id
  }

  /**
   * 移除请求拦截器
   */
  removeRequestInterceptor(id: number): void {
    const axiosId = this.requestInterceptors.get(id)
    if (axiosId !== undefined) {
      this.axiosInstance.interceptors.request.eject(axiosId)
      this.requestInterceptors.delete(id)
    }
  }

  /**
   * 移除响应拦截器
   */
  removeResponseInterceptor(id: number): void {
    const axiosId = this.responseInterceptors.get(id)
    if (axiosId !== undefined) {
      this.axiosInstance.interceptors.response.eject(axiosId)
      this.responseInterceptors.delete(id)
    }
  }

  /**
   * 获取 axios 实例（用于高级用法）
   */
  getAxiosInstance(): AxiosInstance {
    return this.axiosInstance
  }
}

/**
 * 创建 HTTP Client 实例
 */
export function createHttpClient(config?: HttpClientConfig): IHttpClient {
  return new HttpClient(config)
}

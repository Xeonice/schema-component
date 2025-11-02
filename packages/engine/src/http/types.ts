/**
 * HTTP Layer Types
 * HTTP 层类型定义
 */

/**
 * HTTP 方法
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS'

/**
 * HTTP 请求配置
 */
export interface HttpRequestConfig {
  /** 请求 URL */
  url?: string

  /** HTTP 方法 */
  method?: HttpMethod

  /** 请求头 */
  headers?: Record<string, string>

  /** URL 查询参数 */
  params?: Record<string, any>

  /** 请求体数据 */
  data?: any

  /** 超时时间（毫秒） */
  timeout?: number

  /** 是否携带凭证（cookies） */
  withCredentials?: boolean

  /** 响应类型 */
  responseType?: 'json' | 'text' | 'blob' | 'arraybuffer'

  /** 自定义配置 */
  [key: string]: any
}

/**
 * HTTP 响应
 */
export interface HttpResponse<T = any> {
  /** 响应数据 */
  data: T

  /** 状态码 */
  status: number

  /** 状态文本 */
  statusText: string

  /** 响应头 */
  headers: Record<string, string>

  /** 原始请求配置 */
  config: HttpRequestConfig
}

/**
 * HTTP 错误
 */
export interface HttpError extends Error {
  /** 错误配置 */
  config?: HttpRequestConfig

  /** 响应对象（如果有） */
  response?: HttpResponse

  /** 错误代码 */
  code?: string

  /** 是否为网络错误 */
  isNetworkError?: boolean

  /** 是否为超时错误 */
  isTimeout?: boolean
}

/**
 * 请求拦截器函数
 */
export type RequestInterceptor = (
  config: HttpRequestConfig
) => HttpRequestConfig | Promise<HttpRequestConfig>

/**
 * 请求错误拦截器函数
 */
export type RequestErrorInterceptor = (error: any) => any

/**
 * 响应拦截器函数
 */
export type ResponseInterceptor<T = any> = (
  response: HttpResponse<T>
) => HttpResponse<T> | Promise<HttpResponse<T>>

/**
 * 响应错误拦截器函数
 */
export type ResponseErrorInterceptor = (error: HttpError) => any

/**
 * 拦截器
 */
export interface Interceptor<T = any> {
  fulfilled: T
  rejected?: any
}

/**
 * HTTP Client 配置
 */
export interface HttpClientConfig {
  /** 基础 URL */
  baseURL?: string

  /** 默认超时时间（毫秒） */
  timeout?: number

  /** 默认请求头 */
  headers?: Record<string, string>

  /** 是否携带凭证 */
  withCredentials?: boolean

  /** 响应类型 */
  responseType?: 'json' | 'text' | 'blob' | 'arraybuffer'
}

/**
 * HTTP Client 接口
 */
export interface IHttpClient {
  /**
   * 发送 GET 请求
   */
  get<T = any>(url: string, config?: Omit<HttpRequestConfig, 'url'>): Promise<HttpResponse<T>>

  /**
   * 发送 POST 请求
   */
  post<T = any>(url: string, data?: any, config?: Omit<HttpRequestConfig, 'url'>): Promise<HttpResponse<T>>

  /**
   * 发送 PUT 请求
   */
  put<T = any>(url: string, data?: any, config?: Omit<HttpRequestConfig, 'url'>): Promise<HttpResponse<T>>

  /**
   * 发送 PATCH 请求
   */
  patch<T = any>(url: string, data?: any, config?: Omit<HttpRequestConfig, 'url'>): Promise<HttpResponse<T>>

  /**
   * 发送 DELETE 请求
   */
  delete<T = any>(url: string, config?: Omit<HttpRequestConfig, 'url'>): Promise<HttpResponse<T>>

  /**
   * 发送通用请求
   */
  request<T = any>(config: HttpRequestConfig): Promise<HttpResponse<T>>

  /**
   * 添加请求拦截器
   */
  addRequestInterceptor(
    onFulfilled: RequestInterceptor,
    onRejected?: RequestErrorInterceptor
  ): number

  /**
   * 添加响应拦截器
   */
  addResponseInterceptor(
    onFulfilled: ResponseInterceptor,
    onRejected?: ResponseErrorInterceptor
  ): number

  /**
   * 移除请求拦截器
   */
  removeRequestInterceptor(id: number): void

  /**
   * 移除响应拦截器
   */
  removeResponseInterceptor(id: number): void
}

/**
 * API Client types
 */

/**
 * HTTP methods
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

/**
 * API request configuration
 */
export interface ApiRequestConfig {
  /** Request URL */
  url: string
  /** HTTP method */
  method?: HttpMethod
  /** Request params (query string) */
  params?: Record<string, any>
  /** Request body data */
  data?: any
  /** Request headers */
  headers?: Record<string, string>
  /** Timeout in milliseconds */
  timeout?: number
  /** Custom base URL */
  baseURL?: string
}

/**
 * API response wrapper
 */
export interface ApiResponse<T = any> {
  /** Response data */
  data: T
  /** Status code */
  status: number
  /** Status text */
  statusText: string
  /** Response headers */
  headers: Record<string, string>
}

/**
 * API error
 */
export interface ApiError {
  /** Error message */
  message: string
  /** Status code */
  status?: number
  /** Error code */
  code?: string
  /** Validation errors */
  errors?: Record<string, string[]>
  /** Original error */
  originalError?: any
}

/**
 * Pagination params
 */
export interface PaginationParams {
  /** Page number (1-based) */
  page?: number
  /** Page size */
  pageSize?: number
  /** Offset */
  offset?: number
  /** Limit */
  limit?: number
}

/**
 * Sorting params
 */
export interface SortingParams {
  /** Sort field */
  sortBy?: string
  /** Sort order */
  sortOrder?: 'asc' | 'desc'
}

/**
 * Filter params
 */
export interface FilterParams {
  /** Filter conditions */
  filters?: Record<string, any>
  /** Search query */
  search?: string
}

/**
 * List query params (combines pagination, sorting, filtering)
 */
export interface ListQueryParams extends PaginationParams, SortingParams, FilterParams {
  /** Additional custom params */
  [key: string]: any
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T = any> {
  /** Data items */
  data: T[]
  /** Total count */
  total: number
  /** Current page */
  page: number
  /** Page size */
  pageSize: number
  /** Total pages */
  totalPages: number
  /** Has next page */
  hasNext: boolean
  /** Has previous page */
  hasPrev: boolean
}

/**
 * API client configuration
 */
export interface ApiClientConfig {
  /** Base URL for API requests */
  baseURL: string
  /** Default timeout in milliseconds */
  timeout?: number
  /** Default headers */
  headers?: Record<string, string>
  /** Request interceptor */
  onRequest?: (config: ApiRequestConfig) => ApiRequestConfig | Promise<ApiRequestConfig>
  /** Response interceptor */
  onResponse?: <T>(response: ApiResponse<T>) => ApiResponse<T> | Promise<ApiResponse<T>>
  /** Error interceptor */
  onError?: (error: ApiError) => ApiError | Promise<ApiError>
}

/**
 * API client interface
 */
export interface ApiClient {
  /** Configure the client */
  configure(config: Partial<ApiClientConfig>): void

  /** Make a GET request */
  get<T = any>(url: string, params?: Record<string, any>, config?: Partial<ApiRequestConfig>): Promise<ApiResponse<T>>

  /** Make a POST request */
  post<T = any>(url: string, data?: any, config?: Partial<ApiRequestConfig>): Promise<ApiResponse<T>>

  /** Make a PUT request */
  put<T = any>(url: string, data?: any, config?: Partial<ApiRequestConfig>): Promise<ApiResponse<T>>

  /** Make a PATCH request */
  patch<T = any>(url: string, data?: any, config?: Partial<ApiRequestConfig>): Promise<ApiResponse<T>>

  /** Make a DELETE request */
  delete<T = any>(url: string, config?: Partial<ApiRequestConfig>): Promise<ApiResponse<T>>

  /** Make a custom request */
  request<T = any>(config: ApiRequestConfig): Promise<ApiResponse<T>>
}

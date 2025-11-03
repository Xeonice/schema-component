import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import type {
  ApiClient,
  ApiClientConfig,
  ApiRequestConfig,
  ApiResponse,
  ApiError,
} from './types'

/**
 * Default API client configuration
 */
const DEFAULT_CONFIG: ApiClientConfig = {
  baseURL: '',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
}

/**
 * Convert ApiRequestConfig to AxiosRequestConfig
 */
function toAxiosConfig(config: ApiRequestConfig): AxiosRequestConfig {
  return {
    url: config.url,
    method: config.method || 'GET',
    params: config.params,
    data: config.data,
    headers: config.headers,
    timeout: config.timeout,
    baseURL: config.baseURL,
  }
}

/**
 * Convert AxiosResponse to ApiResponse
 */
function toApiResponse<T>(response: AxiosResponse<T>): ApiResponse<T> {
  return {
    data: response.data,
    status: response.status,
    statusText: response.statusText,
    headers: response.headers as Record<string, string>,
  }
}

/**
 * Convert AxiosError to ApiError
 */
function toApiError(error: AxiosError): ApiError {
  const apiError: ApiError = {
    message: error.message,
    originalError: error,
  }

  if (error.response) {
    apiError.status = error.response.status
    apiError.message = (error.response.data as any)?.message || error.message

    // Handle validation errors
    if ((error.response.data as any)?.errors) {
      apiError.errors = (error.response.data as any).errors
    }
  }

  if (error.code) {
    apiError.code = error.code
  }

  return apiError
}

/**
 * API Client implementation using Axios
 */
export class ApiClientImpl implements ApiClient {
  private config: ApiClientConfig
  private axios: AxiosInstance

  constructor(config?: Partial<ApiClientConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.axios = this.createAxiosInstance()
    this.setupInterceptors()
  }

  private createAxiosInstance(): AxiosInstance {
    return axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: this.config.headers,
    })
  }

  private setupInterceptors(): void {
    // Request interceptor - simplified to avoid type issues
    this.axios.interceptors.request.use(
      (config) => {
        // For now, we just pass through
        // Custom request handling can be added later
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor
    this.axios.interceptors.response.use(
      (response) => {
        // Pass through for now
        return response
      },
      async (error: AxiosError) => {
        const apiError = toApiError(error)
        if (this.config.onError) {
          await this.config.onError(apiError)
        }
        return Promise.reject(apiError)
      }
    )
  }

  configure(config: Partial<ApiClientConfig>): void {
    this.config = { ...this.config, ...config }

    // Update axios instance configuration
    if (config.baseURL) {
      this.axios.defaults.baseURL = config.baseURL
    }
    if (config.timeout) {
      this.axios.defaults.timeout = config.timeout
    }
    if (config.headers) {
      this.axios.defaults.headers.common = {
        ...this.axios.defaults.headers.common,
        ...config.headers,
      }
    }

    // Re-setup interceptors if they changed
    if (config.onRequest || config.onResponse || config.onError) {
      this.axios.interceptors.request.clear()
      this.axios.interceptors.response.clear()
      this.setupInterceptors()
    }
  }

  async get<T = any>(
    url: string,
    params?: Record<string, any>,
    config?: Partial<ApiRequestConfig>
  ): Promise<ApiResponse<T>> {
    const response = await this.axios.get<T>(url, {
      params,
      ...config,
    })
    return toApiResponse(response)
  }

  async post<T = any>(
    url: string,
    data?: any,
    config?: Partial<ApiRequestConfig>
  ): Promise<ApiResponse<T>> {
    const response = await this.axios.post<T>(url, data, config)
    return toApiResponse(response)
  }

  async put<T = any>(
    url: string,
    data?: any,
    config?: Partial<ApiRequestConfig>
  ): Promise<ApiResponse<T>> {
    const response = await this.axios.put<T>(url, data, config)
    return toApiResponse(response)
  }

  async patch<T = any>(
    url: string,
    data?: any,
    config?: Partial<ApiRequestConfig>
  ): Promise<ApiResponse<T>> {
    const response = await this.axios.patch<T>(url, data, config)
    return toApiResponse(response)
  }

  async delete<T = any>(
    url: string,
    config?: Partial<ApiRequestConfig>
  ): Promise<ApiResponse<T>> {
    const response = await this.axios.delete<T>(url, config)
    return toApiResponse(response)
  }

  async request<T = any>(config: ApiRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.axios.request<T>(toAxiosConfig(config))
    return toApiResponse(response)
  }
}

// Singleton instance
let apiClientInstance: ApiClient | null = null

/**
 * Get the global API client instance
 */
export function getApiClient(): ApiClient {
  if (!apiClientInstance) {
    apiClientInstance = new ApiClientImpl()
  }
  return apiClientInstance
}

/**
 * Configure the global API client
 */
export function configureApiClient(config: Partial<ApiClientConfig>): void {
  const client = getApiClient()
  client.configure(config)
}

/**
 * Create a new isolated API client instance
 */
export function createApiClient(config?: Partial<ApiClientConfig>): ApiClient {
  return new ApiClientImpl(config)
}

/**
 * Reset the global API client (useful for testing)
 */
export function resetApiClient(): void {
  apiClientInstance = null
}

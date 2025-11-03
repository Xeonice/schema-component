import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import type { SchemaDefinition } from '@schema-component/schema'
import type { RenderViewDefinition } from '@schema-component/engine'
import { getApiClient } from '../api/ApiClient'
import type { ApiError } from '../api/types'

/**
 * View metadata loaded from server
 */
export interface ViewMetadata {
  /** Schema definition */
  schema: SchemaDefinition
  /** View definition */
  view: RenderViewDefinition
  /** Initial data (optional) */
  data?: any
}

/**
 * View loader configuration
 */
export interface ViewLoaderConfig {
  /** Model name */
  model: string
  /** View name */
  view: string
  /** Record ID (for detail/edit views) */
  id?: string | number
  /** Additional params */
  params?: Record<string, any>
}

/**
 * Query key factory for views
 */
export function viewKeys(config: ViewLoaderConfig) {
  return {
    all: ['view', config.model, config.view] as const,
    metadata: () => [...viewKeys(config).all, 'metadata'] as const,
    data: (id?: string | number) => [...viewKeys(config).all, 'data', id] as const,
  }
}

/**
 * Hook to load view metadata (schema + view definition)
 */
export function useViewMetadata(
  config: ViewLoaderConfig,
  options?: Omit<UseQueryOptions<ViewMetadata, ApiError, ViewMetadata, readonly any[]>, 'queryKey' | 'queryFn'>
) {
  const client = getApiClient()

  return useQuery<ViewMetadata, ApiError, ViewMetadata, readonly any[]>({
    queryKey: viewKeys(config).metadata(),
    queryFn: async () => {
      const response = await client.get<ViewMetadata>(
        `/api/views/${config.model}/${config.view}`,
        config.params
      )
      return response.data
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - view definitions don't change often
    ...options,
  })
}

/**
 * Hook to load view data
 */
export function useViewData<T = any>(
  config: ViewLoaderConfig,
  options?: Omit<UseQueryOptions<T, ApiError, T, readonly any[]>, 'queryKey' | 'queryFn'>
) {
  const client = getApiClient()

  return useQuery<T, ApiError, T, readonly any[]>({
    queryKey: viewKeys(config).data(config.id),
    queryFn: async () => {
      const url = config.id
        ? `/api/${config.model}/${config.id}`
        : `/api/${config.model}`

      const response = await client.get<T>(url, config.params)
      return response.data
    },
    enabled: options?.enabled !== false,
    ...options,
  })
}

/**
 * Hook to load both view metadata and data
 */
export function useView<T = any>(
  config: ViewLoaderConfig,
  options?: {
    metadataOptions?: Omit<UseQueryOptions<ViewMetadata, ApiError>, 'queryKey' | 'queryFn'>
    dataOptions?: Omit<UseQueryOptions<T, ApiError>, 'queryKey' | 'queryFn'>
  }
) {
  const metadata = useViewMetadata(config, options?.metadataOptions)
  const data = useViewData<T>(config, {
    enabled: metadata.isSuccess,
    ...options?.dataOptions,
  })

  return {
    metadata,
    data,
    isLoading: metadata.isLoading || data.isLoading,
    isError: metadata.isError || data.isError,
    error: metadata.error || data.error,
  }
}

/**
 * Hook for detail view (loads single record)
 */
export function useDetailView<T = any>(
  model: string,
  view: string,
  id: string | number | null | undefined,
  options?: {
    metadataOptions?: Omit<UseQueryOptions<ViewMetadata, ApiError>, 'queryKey' | 'queryFn'>
    dataOptions?: Omit<UseQueryOptions<T, ApiError>, 'queryKey' | 'queryFn'>
  }
) {
  return useView<T>(
    { model, view, id: id! },
    {
      metadataOptions: options?.metadataOptions,
      dataOptions: {
        enabled: id != null,
        ...options?.dataOptions,
      },
    }
  )
}

/**
 * Hook for list view (loads multiple records)
 */
export function useListView<T = any>(
  model: string,
  view: string,
  params?: Record<string, any>,
  options?: {
    metadataOptions?: Omit<UseQueryOptions<ViewMetadata, ApiError>, 'queryKey' | 'queryFn'>
    dataOptions?: Omit<UseQueryOptions<T, ApiError>, 'queryKey' | 'queryFn'>
  }
) {
  return useView<T>(
    { model, view, params },
    options
  )
}

/**
 * Hook for form view (loads schema and initial data if editing)
 */
export function useFormView<T = any>(
  model: string,
  view: string,
  id?: string | number,
  options?: {
    metadataOptions?: Omit<UseQueryOptions<ViewMetadata, ApiError>, 'queryKey' | 'queryFn'>
    dataOptions?: Omit<UseQueryOptions<T, ApiError>, 'queryKey' | 'queryFn'>
  }
) {
  return useView<T>(
    { model, view, id },
    {
      metadataOptions: options?.metadataOptions,
      dataOptions: {
        enabled: id != null,
        ...options?.dataOptions,
      },
    }
  )
}

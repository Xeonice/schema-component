import { useQuery, useMutation, useQueryClient, type UseQueryOptions, type UseMutationOptions } from '@tanstack/react-query'
import type { Resource } from '../api/Resource'
import type { ListQueryParams, PaginatedResponse, ApiError } from '../api/types'

/**
 * Query key factory for resources
 */
export function resourceKeys(name: string) {
  return {
    all: [name] as const,
    lists: () => [...resourceKeys(name).all, 'list'] as const,
    list: (params?: ListQueryParams) => [...resourceKeys(name).lists(), params] as const,
    details: () => [...resourceKeys(name).all, 'detail'] as const,
    detail: (id: string | number) => [...resourceKeys(name).details(), id] as const,
  }
}

/**
 * Hook for fetching a list of resources
 */
export function useResourceList<T = any>(
  resource: Resource<T>,
  params?: ListQueryParams,
  options?: Omit<UseQueryOptions<PaginatedResponse<T>, ApiError, PaginatedResponse<T>, readonly any[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery<PaginatedResponse<T>, ApiError, PaginatedResponse<T>, readonly any[]>({
    queryKey: resourceKeys(resource['name']).list(params),
    queryFn: () => resource.list(params),
    ...options,
  })
}

/**
 * Hook for fetching a single resource
 */
export function useResourceDetail<T = any>(
  resource: Resource<T>,
  id: string | number | null | undefined,
  options?: Omit<UseQueryOptions<T, ApiError, T, readonly any[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery<T, ApiError, T, readonly any[]>({
    queryKey: resourceKeys(resource['name']).detail(id!),
    queryFn: () => resource.get(id!),
    enabled: id != null && options?.enabled !== false,
    ...options,
  })
}

/**
 * Hook for creating a resource
 */
export function useResourceCreate<T = any>(
  resource: Resource<T>,
  options?: UseMutationOptions<T, ApiError, Partial<T>, unknown>
) {
  return useMutation<T, ApiError, Partial<T>, unknown>({
    mutationFn: (data) => resource.create(data),
    ...options,
  })
}

/**
 * Hook for updating a resource (full update)
 */
export function useResourceUpdate<T = any>(
  resource: Resource<T>,
  options?: UseMutationOptions<T, ApiError, { id: string | number; data: Partial<T> }, unknown>
) {
  return useMutation<T, ApiError, { id: string | number; data: Partial<T> }, unknown>({
    mutationFn: ({ id, data }) => resource.update(id, data),
    ...options,
  })
}

/**
 * Hook for partially updating a resource
 */
export function useResourcePatch<T = any>(
  resource: Resource<T>,
  options?: UseMutationOptions<T, ApiError, { id: string | number; data: Partial<T> }, unknown>
) {
  return useMutation<T, ApiError, { id: string | number; data: Partial<T> }, unknown>({
    mutationFn: ({ id, data }) => resource.patch(id, data),
    ...options,
  })
}

/**
 * Hook for deleting a resource
 */
export function useResourceDelete<T = any>(
  resource: Resource<T>,
  options?: UseMutationOptions<void, ApiError, string | number, unknown>
) {
  return useMutation<void, ApiError, string | number, unknown>({
    mutationFn: (id) => resource.delete(id),
    ...options,
  })
}

/**
 * Hook for bulk deleting resources
 */
export function useResourceBulkDelete<T = any>(
  resource: Resource<T>,
  options?: UseMutationOptions<void, ApiError, (string | number)[], unknown>
) {
  return useMutation<void, ApiError, (string | number)[], unknown>({
    mutationFn: (ids) => resource.bulkDelete(ids),
    ...options,
  })
}

/**
 * Hook for executing a custom action on a resource
 */
export function useResourceAction<TData = any, TVariables = any>(
  resource: Resource<any>,
  id: string | number,
  action: string,
  options?: UseMutationOptions<TData, ApiError, TVariables, unknown>
) {
  return useMutation<TData, ApiError, TVariables, unknown>({
    mutationFn: (data) => resource.action(id, action, data),
    ...options,
  })
}

/**
 * Hook for executing a custom collection action
 */
export function useResourceCollectionAction<TData = any, TVariables = any>(
  resource: Resource<any>,
  action: string,
  options?: UseMutationOptions<TData, ApiError, TVariables, unknown>
) {
  return useMutation<TData, ApiError, TVariables, unknown>({
    mutationFn: (data) => resource.collectionAction(action, data),
    ...options,
  })
}

/**
 * Hook to get query client for manual cache manipulation
 */
export function useResourceQueryClient() {
  return useQueryClient()
}

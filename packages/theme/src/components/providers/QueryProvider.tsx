import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'
import type { ApiError } from '../../api/types'

/**
 * Query provider configuration
 */
export interface QueryProviderConfig {
  /** Default stale time in milliseconds */
  staleTime?: number
  /** Default cache time in milliseconds */
  cacheTime?: number
  /** Enable React Query Devtools */
  enableDevtools?: boolean
  /** Error handler */
  onError?: (error: ApiError) => void
  /** Success handler for mutations */
  onMutationSuccess?: (data: any) => void
}

/**
 * Query provider props
 */
export interface QueryProviderProps extends QueryProviderConfig {
  children: React.ReactNode
}

/**
 * Create a configured QueryClient
 */
function createQueryClient(config: QueryProviderConfig = {}): QueryClient {
  const {
    staleTime = 5 * 60 * 1000, // 5 minutes
    cacheTime = 10 * 60 * 1000, // 10 minutes
    onError,
    onMutationSuccess,
  } = config

  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime,
        gcTime: cacheTime,
        retry: 1,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 0,
      },
    },
    queryCache: new QueryCache({
      onError: (error) => {
        if (onError) {
          onError(error as ApiError)
        }
      },
    }),
    mutationCache: new MutationCache({
      onError: (error) => {
        if (onError) {
          onError(error as ApiError)
        }
      },
      onSuccess: (data) => {
        if (onMutationSuccess) {
          onMutationSuccess(data)
        }
      },
    }),
  })
}

/**
 * QueryProvider component
 * Provides TanStack Query context to the component tree
 */
export function QueryProvider({
  children,
  enableDevtools = false, // Default to false, can be enabled explicitly
  ...config
}: QueryProviderProps) {
  const [queryClient] = useState(() => createQueryClient(config))

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {enableDevtools && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  )
}

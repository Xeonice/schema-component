import { useEffect, useState, useCallback, useMemo } from 'react'
import { getRouter } from '../router/BrowserRouter'
import type { Router, NavigationOptions, RouteParams } from '../router/types'

/**
 * Hook to access the router
 */
export function useRouter(): Router {
  return getRouter()
}

/**
 * Hook to get the current pathname
 */
export function usePathname(): string {
  const router = useRouter()
  const [pathname, setPathname] = useState(router.getPathname())

  useEffect(() => {
    const unsubscribe = router.subscribe((newPathname) => {
      setPathname(newPathname)
    })
    return unsubscribe
  }, [router])

  return pathname
}

/**
 * Hook to get search params
 */
export function useSearchParams(): URLSearchParams {
  const router = useRouter()
  const [searchParams, setSearchParams] = useState(router.getSearchParams())

  useEffect(() => {
    const unsubscribe = router.subscribe(() => {
      setSearchParams(router.getSearchParams())
    })
    return unsubscribe
  }, [router])

  return searchParams
}

/**
 * Hook to get route params
 */
export function useParams(): RouteParams {
  const router = useRouter()
  const [params, setParams] = useState(router.getParams())

  useEffect(() => {
    const unsubscribe = router.subscribe(() => {
      setParams(router.getParams())
    })
    return unsubscribe
  }, [router])

  return params
}

/**
 * Hook for navigation
 */
export function useNavigate() {
  const router = useRouter()

  return useCallback(
    (path: string, options?: NavigationOptions) => {
      router.navigate(path, options)
    },
    [router]
  )
}

/**
 * Hook to get a specific search param value
 */
export function useSearchParam(key: string): string | null {
  const searchParams = useSearchParams()
  return searchParams.get(key)
}

/**
 * Hook to get all search params as an object
 */
export function useSearchParamsObject(): Record<string, string> {
  const searchParams = useSearchParams()
  return useMemo(() => {
    const params: Record<string, string> = {}
    searchParams.forEach((value, key) => {
      params[key] = value
    })
    return params
  }, [searchParams])
}

/**
 * Hook to check if a path matches the current pathname
 */
export function useIsActive(path: string): boolean {
  const pathname = usePathname()
  return pathname === path || pathname.startsWith(path + '/')
}

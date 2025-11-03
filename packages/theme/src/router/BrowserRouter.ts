import type { Router, RouteParams, NavigationOptions } from './types'

/**
 * Browser router implementation using History API
 */
export class BrowserRouter implements Router {
  private listeners = new Set<(pathname: string) => void>()

  constructor() {
    // Listen to popstate events (browser back/forward)
    window.addEventListener('popstate', () => {
      this.notifyListeners()
    })
  }

  navigate(path: string, options: NavigationOptions = {}): void {
    const url = new URL(path, window.location.origin)

    if (options.replace) {
      window.history.replaceState(options.state || null, '', url.toString())
    } else {
      window.history.pushState(options.state || null, '', url.toString())
    }

    this.notifyListeners()
  }

  back(): void {
    window.history.back()
  }

  forward(): void {
    window.history.forward()
  }

  getPathname(): string {
    return window.location.pathname
  }

  getSearchParams(): URLSearchParams {
    return new URLSearchParams(window.location.search)
  }

  getParams(): RouteParams {
    // Note: This is a simplified implementation
    // In a real app, you'd use a route matching library
    // For now, we return an empty object
    // The actual route params would come from a routing library like react-router
    return {}
  }

  getState(): any {
    return window.history.state
  }

  subscribe(listener: (pathname: string) => void): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  private notifyListeners(): void {
    const pathname = this.getPathname()
    this.listeners.forEach((listener) => listener(pathname))
  }
}

// Singleton instance
let routerInstance: Router | null = null

/**
 * Get the global router instance
 */
export function getRouter(): Router {
  if (!routerInstance) {
    routerInstance = new BrowserRouter()
  }
  return routerInstance
}

/**
 * Set a custom router instance (useful for integrating with react-router, etc.)
 */
export function setRouter(router: Router): void {
  routerInstance = router
}

/**
 * Reset the router instance (useful for testing)
 */
export function resetRouter(): void {
  routerInstance = null
}

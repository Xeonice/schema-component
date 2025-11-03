/**
 * Router types
 */

/**
 * Route params
 */
export interface RouteParams {
  [key: string]: string | undefined
}

/**
 * Navigation options
 */
export interface NavigationOptions {
  /** Replace current history entry instead of pushing */
  replace?: boolean
  /** State to pass to the new route */
  state?: any
}

/**
 * Router interface
 * Abstract interface for routing operations
 */
export interface Router {
  /**
   * Navigate to a path
   */
  navigate(path: string, options?: NavigationOptions): void

  /**
   * Navigate back in history
   */
  back(): void

  /**
   * Navigate forward in history
   */
  forward(): void

  /**
   * Get current pathname
   */
  getPathname(): string

  /**
   * Get current search params
   */
  getSearchParams(): URLSearchParams

  /**
   * Get route params (from path parameters like /users/:id)
   */
  getParams(): RouteParams

  /**
   * Get navigation state
   */
  getState(): any

  /**
   * Subscribe to navigation changes
   */
  subscribe(listener: (pathname: string) => void): () => void
}

/**
 * View route configuration
 */
export interface ViewRouteConfig {
  /** Route path */
  path: string
  /** Model name */
  model: string
  /** View name */
  view: string
  /** Additional params */
  params?: Record<string, any>
}

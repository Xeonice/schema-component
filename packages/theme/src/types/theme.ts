/**
 * Theme mode
 */
export type ThemeMode = 'light' | 'dark' | 'system'

/**
 * Theme configuration
 */
export interface ThemeConfig {
  /** Theme mode */
  mode: ThemeMode
  /** Custom CSS variables */
  cssVariables?: Record<string, string>
  /** Radius value (for border radius) */
  radius?: number
}

/**
 * Theme context value
 */
export interface ThemeContextValue {
  /** Current theme configuration */
  theme: ThemeConfig
  /** Set theme mode */
  setMode: (mode: ThemeMode) => void
  /** Set custom CSS variable */
  setCSSVariable: (key: string, value: string) => void
  /** Set radius */
  setRadius: (radius: number) => void
  /** Reset theme to defaults */
  reset: () => void
}

/**
 * Theme provider props
 */
export interface ThemeProviderProps {
  /** Initial theme configuration */
  defaultTheme?: Partial<ThemeConfig>
  /** Storage key for persisting theme */
  storageKey?: string
  /** Auto-initialize renderers (default: true) */
  autoInitialize?: boolean
  /** Children */
  children: React.ReactNode
}

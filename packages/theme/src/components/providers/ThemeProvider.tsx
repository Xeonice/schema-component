import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import type { ThemeConfig, ThemeMode, ThemeContextValue, ThemeProviderProps } from '../../types'
import { registerRenderers } from '../renderers/registerRenderers'

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

const DEFAULT_THEME: ThemeConfig = {
  mode: 'system',
  radius: 0.5,
}

// 全局标志,确保只初始化一次
let isInitialized = false

/**
 * ThemeProvider component
 * Manages theme state and provides it to the component tree
 */
export function ThemeProvider({
  children,
  defaultTheme = {},
  storageKey = 'schema-component-theme',
  autoInitialize = true, // 新增: 是否自动初始化渲染器
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<ThemeConfig>(() => {
    // Try to load from localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        try {
          return { ...DEFAULT_THEME, ...JSON.parse(stored) }
        } catch {
          // Ignore parse errors
        }
      }
    }
    return { ...DEFAULT_THEME, ...defaultTheme }
  })

  // Register all renderers once when the provider mounts
  useEffect(() => {
    if (autoInitialize && !isInitialized) {
      isInitialized = true
      // 暂时保留旧的注册方式,确保向后兼容
      // 新架构下应该在应用启动时手动调用 initializeTheme
      registerRenderers()
    }
  }, [autoInitialize])

  // Persist theme to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, JSON.stringify(theme))
    }
  }, [theme, storageKey])

  // Apply theme mode to document
  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')

    let effectiveMode = theme.mode
    if (theme.mode === 'system') {
      effectiveMode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }

    root.classList.add(effectiveMode)
  }, [theme.mode])

  // Apply custom CSS variables
  useEffect(() => {
    if (theme.cssVariables) {
      const root = window.document.documentElement
      Object.entries(theme.cssVariables).forEach(([key, value]) => {
        root.style.setProperty(key, value)
      })
    }
  }, [theme.cssVariables])

  // Apply radius
  useEffect(() => {
    const root = window.document.documentElement
    root.style.setProperty('--radius', `${theme.radius}rem`)
  }, [theme.radius])

  const setMode = useCallback((mode: ThemeMode) => {
    setTheme((prev) => ({ ...prev, mode }))
  }, [])

  const setCSSVariable = useCallback((key: string, value: string) => {
    setTheme((prev) => ({
      ...prev,
      cssVariables: {
        ...prev.cssVariables,
        [key]: value,
      },
    }))
  }, [])

  const setRadius = useCallback((radius: number) => {
    setTheme((prev) => ({ ...prev, radius }))
  }, [])

  const reset = useCallback(() => {
    setTheme(DEFAULT_THEME)
    if (typeof window !== 'undefined') {
      localStorage.removeItem(storageKey)
    }
  }, [storageKey])

  const value: ThemeContextValue = {
    theme,
    setMode,
    setCSSVariable,
    setRadius,
    reset,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

/**
 * Hook to access the theme context
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

/**
 * @schema-component/theme
 * Theme system for schema-component - shadcn/ui implementation
 */

// Core exports
export * from './core'

// Component exports
export * from './components'

// Renderer exports
export * from './components/renderers'

// Type exports
export * from './types'

// Utility exports
export * from './lib/utils'

// API exports
export * from './api'

// Router exports
export * from './router'

// Action exports
export * from './actions'

// Hooks exports
export * from './hooks'

// Adapter exports (新增: 用于将渲染器注册到 Engine)
export * from './adapters'

// Initialization
export { initializeTheme } from './init'

// Styles
import './styles/globals.css'

export const version = '0.0.0'

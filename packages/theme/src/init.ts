/**
 * Theme Initialization
 *
 * 初始化 Theme 层,注册所有渲染器到 Engine
 *
 * 使用方式:
 * ```typescript
 * import { initializeTheme } from '@schema-component/theme'
 * import { registerReactComponent } from '@schema-component/react-connector'
 *
 * // 在应用启动时调用
 * initializeTheme(registerReactComponent)
 * ```
 */

import { setReactComponentRegistrar, registerAllRenderersToEngine } from './adapters'

/**
 * 初始化 Theme 包
 *
 * @param reactComponentRegistrar - react-connector 提供的组件注册函数
 */
export function initializeTheme(
  reactComponentRegistrar: (id: string, component: any) => void
): void {
  // 1. 设置 React 组件注册器
  setReactComponentRegistrar(reactComponentRegistrar)

  // 2. 注册所有渲染器到 Engine
  // 这个过程会自动将 React 组件也注册到 react-connector
  registerAllRenderersToEngine()

  console.log('[Theme] Initialized successfully')
}

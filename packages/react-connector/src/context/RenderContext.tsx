import React, { createContext, useContext, ReactNode } from 'react'
import type { RenderEngine } from '@schema-component/engine'
import type { RenderDescriptorConverter, ComponentMap } from '../core'
import type {
  IViewLoader,
  IGroupLoader,
  IFieldLoader,
  IDataLoader,
  IActionLoader
} from '../layers'

/**
 * React 渲染上下文接口
 */
export interface ReactRenderContextValue {
  // 核心引擎
  engine: RenderEngine

  // 转换器
  converter: RenderDescriptorConverter

  // 各层加载器
  viewLoader: IViewLoader
  groupLoader: IGroupLoader
  fieldLoader: IFieldLoader
  dataLoader: IDataLoader
  actionLoader: IActionLoader

  // 组件映射
  componentMap: ComponentMap

  // 配置选项
  options: {
    enableCache?: boolean
    debugMode?: boolean
    errorBoundary?: boolean
  }
}

/**
 * React 渲染上下文
 */
const ReactRenderContext = createContext<ReactRenderContextValue | null>(null)

/**
 * React 渲染上下文提供者属性
 */
export interface ReactRenderProviderProps {
  value: ReactRenderContextValue
  children: ReactNode
}

/**
 * React 渲染上下文提供者
 */
export const ReactRenderProvider: React.FC<ReactRenderProviderProps> = ({ value, children }) => {
  return (
    <ReactRenderContext.Provider value={value}>
      {children}
    </ReactRenderContext.Provider>
  )
}

/**
 * 使用 React 渲染上下文的 Hook
 */
export const useReactRenderContext = (): ReactRenderContextValue => {
  const context = useContext(ReactRenderContext)
  if (!context) {
    throw new Error('useReactRenderContext must be used within a ReactRenderProvider')
  }
  return context
}

/**
 * 使用渲染引擎的 Hook
 */
export const useRenderEngine = (): RenderEngine => {
  const { engine } = useReactRenderContext()
  return engine
}

/**
 * 使用转换器的 Hook
 */
export const useConverter = (): RenderDescriptorConverter => {
  const { converter } = useReactRenderContext()
  return converter
}

/**
 * 使用组件映射的 Hook
 */
export const useComponentMap = (): ComponentMap => {
  const { componentMap } = useReactRenderContext()
  return componentMap
}

/**
 * 使用加载器的 Hook
 */
export const useLoaders = () => {
  const { viewLoader, groupLoader, fieldLoader, dataLoader, actionLoader } = useReactRenderContext()
  return {
    viewLoader,
    groupLoader,
    fieldLoader,
    dataLoader,
    actionLoader
  }
}
// Context
export {
  RenderContextProvider,
  useRenderContext,
  useRegistry,
  type IReactRenderContext,
  type IRendererRegistry,
  type IApiLayer,
  type IReactRenderer
} from './context/RenderContext'

// Renderers
export * from './renderers'

// Helper function to setup the connector
import React from 'react'
import type { RenderContext as EngineRenderContext } from '@schema-component/engine'
import { RenderContextProvider, useRegistry } from './context/RenderContext'
import { registerDefaultRenderers } from './renderers'

/**
 * Setup props for react connector
 */
export interface ReactConnectorSetupProps {
  engineContext: EngineRenderContext
  children: React.ReactNode
}

/**
 * React Connector Setup Component
 * 自动注册默认渲染器并提供 RenderContext
 */
export const ReactConnectorSetup: React.FC<ReactConnectorSetupProps> = ({ 
  engineContext, 
  children 
}) => {
  return (
    <RenderContextProvider engineContext={engineContext}>
      <RendererRegistrationWrapper>
        {children}
      </RendererRegistrationWrapper>
    </RenderContextProvider>
  )
}

/**
 * 内部组件：自动注册默认渲染器
 */
const RendererRegistrationWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const registry = useRegistry()
  
  React.useEffect(() => {
    registerDefaultRenderers(registry)
  }, [registry])

  return <>{children}</>
}

/**
 * Hook to use view rendering
 */
export const useViewRenderer = () => {
  const context = useRenderContext()
  
  return {
    renderView: context.renderView,
    api: context.api
  }
}

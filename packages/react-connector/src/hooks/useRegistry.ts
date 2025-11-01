import { useCallback } from 'react'
import { useRenderEngine } from '../context'
import type {
  IViewRenderer,
  IGroupRenderer,
  IFieldRenderer,
  IDataRenderer,
  IActionRenderer
} from '@schema-component/engine'

/**
 * 使用渲染器注册的 Hook
 */
export const useRendererRegistry = () => {
  const engine = useRenderEngine()

  const registerView = useCallback(
    (type: string, renderer: IViewRenderer) => {
      engine.registerRenderer(renderer)
    },
    [engine]
  )

  const registerGroup = useCallback(
    (type: string, renderer: IGroupRenderer) => {
      engine.registerRenderer(renderer)
    },
    [engine]
  )

  const registerField = useCallback(
    (layout: string, renderer: IFieldRenderer) => {
      engine.registerRenderer(renderer)
    },
    [engine]
  )

  const registerData = useCallback(
    (type: string, renderer: IDataRenderer) => {
      engine.registerRenderer(renderer)
    },
    [engine]
  )

  const registerAction = useCallback(
    (type: string, renderer: IActionRenderer) => {
      engine.registerRenderer(renderer)
    },
    [engine]
  )

  const getStats = useCallback(() => {
    return engine.getRendererStats()
  }, [engine])

  const getAvailableTypes = useCallback(
    (category: 'view' | 'group' | 'field' | 'data' | 'action') => {
      return engine.getAvailableTypes(category)
    },
    [engine]
  )

  return {
    registerView,
    registerGroup,
    registerField,
    registerData,
    registerAction,
    getStats,
    getAvailableTypes
  }
}

/**
 * 使用组件映射注册的 Hook
 */
export const useComponentRegistry = () => {
  const { converter } = useReactRenderContext()

  const updateComponentMap = useCallback(
    (componentMap: Record<string, React.ComponentType<any>>) => {
      converter.updateComponentMap(componentMap)
    },
    [converter]
  )

  const getComponentMap = useCallback(() => {
    return converter.getComponentMap()
  }, [converter])

  return {
    updateComponentMap,
    getComponentMap
  }
}

/**
 * 使用批量注册的 Hook
 */
export const useBatchRegistry = () => {
  const { registerView, registerGroup, registerField, registerData, registerAction } = useRendererRegistry()

  const registerRenderers = useCallback(
    (renderers: {
      views?: Array<{ type: string; renderer: IViewRenderer }>
      groups?: Array<{ type: string; renderer: IGroupRenderer }>
      fields?: Array<{ layout: string; renderer: IFieldRenderer }>
      data?: Array<{ type: string; renderer: IDataRenderer }>
      actions?: Array<{ type: string; renderer: IActionRenderer }>
    }) => {
      // 注册视图渲染器
      renderers.views?.forEach(({ type, renderer }) => {
        registerView(type, renderer)
      })

      // 注册分组渲染器
      renderers.groups?.forEach(({ type, renderer }) => {
        registerGroup(type, renderer)
      })

      // 注册字段渲染器
      renderers.fields?.forEach(({ layout, renderer }) => {
        registerField(layout, renderer)
      })

      // 注册数据渲染器
      renderers.data?.forEach(({ type, renderer }) => {
        registerData(type, renderer)
      })

      // 注册动作渲染器
      renderers.actions?.forEach(({ type, renderer }) => {
        registerAction(type, renderer)
      })
    },
    [registerView, registerGroup, registerField, registerData, registerAction]
  )

  return {
    registerRenderers
  }
}

// 修复导入问题
import { useReactRenderContext } from '../context'
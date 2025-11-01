import { useState, useEffect, useCallback } from 'react'
import type {
  ViewDefinition,
  GroupDefinition,
  FieldDefinition,
  DataDefinition,
  RenderContext
} from '@schema-component/engine'
import type { ClientActionDefinition } from '../layers/ActionLayer'
import { useReactRenderContext } from '../context'
import {
  ReactViewRender,
  ReactGroupRender,
  ReactFieldRender,
  ReactDataRender,
  ReactActionRender
} from '../layers'

/**
 * 渲染状态
 */
export interface RenderState<T> {
  data: T | null
  loading: boolean
  error: Error | null
}

/**
 * 使用视图渲染的 Hook
 */
export const useViewRender = () => {
  const { viewLoader, converter } = useReactRenderContext()
  const renderer = new ReactViewRender(viewLoader, converter)

  return useCallback(
    (view: ViewDefinition, data: any, context: RenderContext) => {
      return renderer.render(view, data, context)
    },
    [renderer]
  )
}

/**
 * 使用分组渲染的 Hook
 */
export const useGroupRender = () => {
  const { groupLoader, converter } = useReactRenderContext()
  const renderer = new ReactGroupRender(groupLoader, converter)

  return useCallback(
    (group: GroupDefinition, data: any, context: RenderContext) => {
      return renderer.render(group, data, context)
    },
    [renderer]
  )
}

/**
 * 使用字段渲染的 Hook
 */
export const useFieldRender = () => {
  const { fieldLoader, converter } = useReactRenderContext()
  const renderer = new ReactFieldRender(fieldLoader, converter)

  return useCallback(
    (
      field: FieldDefinition,
      value: any,
      record: any,
      context: RenderContext & { mode?: 'view' | 'edit' }
    ) => {
      return renderer.render(field, value, record, context)
    },
    [renderer]
  )
}

/**
 * 使用数据渲染的 Hook
 */
export const useDataRender = () => {
  const { dataLoader, converter } = useReactRenderContext()
  const renderer = new ReactDataRender(dataLoader, converter)

  return useCallback(
    (data: DataDefinition, value: any, context: RenderContext) => {
      return renderer.render(data, value, context)
    },
    [renderer]
  )
}

/**
 * 使用动作渲染的 Hook
 */
export const useActionRender = () => {
  const { actionLoader, converter } = useReactRenderContext()
  const renderer = new ReactActionRender(actionLoader, converter)

  return useCallback(
    (action: ClientActionDefinition, context: RenderContext) => {
      return renderer.render(action, context)
    },
    [renderer]
  )
}

/**
 * 使用异步渲染状态的 Hook
 */
export const useAsyncRender = <T, R>(
  renderFn: (input: T) => Promise<R>,
  input: T | null
): RenderState<R> => {
  const [state, setState] = useState<RenderState<R>>({
    data: null,
    loading: false,
    error: null
  })

  useEffect(() => {
    if (!input) {
      setState({ data: null, loading: false, error: null })
      return
    }

    setState(prev => ({ ...prev, loading: true, error: null }))

    renderFn(input)
      .then(data => {
        setState({ data, loading: false, error: null })
      })
      .catch(error => {
        setState({ data: null, loading: false, error })
      })
  }, [renderFn, input])

  return state
}

/**
 * 使用批量渲染的 Hook
 */
export const useBatchRender = () => {
  const renderHooks = {
    view: useViewRender(),
    group: useGroupRender(),
    field: useFieldRender(),
    data: useDataRender(),
    action: useActionRender()
  }

  return useCallback(
    async (
      items: Array<{
        type: 'view' | 'group' | 'field' | 'data' | 'action'
        definition: any
        context: RenderContext
        props?: any
      }>
    ) => {
      const promises = items.map(item => {
        switch (item.type) {
          case 'view':
            return renderHooks.view(item.definition, item.props?.data, item.context)
          case 'group':
            return renderHooks.group(item.definition, item.props?.data, item.context)
          case 'field':
            return renderHooks.field(
              item.definition,
              item.props?.value,
              item.props?.record,
              item.context
            )
          case 'data':
            return renderHooks.data(item.definition, item.props?.value, item.context)
          case 'action':
            return renderHooks.action(item.definition, item.context)
          default:
            throw new Error(`Unknown render type: ${item.type}`)
        }
      })

      return Promise.all(promises)
    },
    [renderHooks]
  )
}
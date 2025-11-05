/**
 * Renderer Adapter
 *
 * 将 Theme 层的 React 组件适配为 Engine 层的 IRenderer 接口
 *
 * 职责:
 * 1. 将 React 组件包装成符合 Engine IRenderer 接口的渲染器
 * 2. 生成框架无关的 RenderDescriptor
 * 3. 桥接 Theme Props 和 Engine 的定义
 * 4. 自动注册 React 组件到 react-connector 的组件映射表
 */

import type {
  IRenderer,
  RenderDescriptor,
  RenderContext,
  RendererCategory,
  FieldDefinition as EngineFieldDefinition,
  GroupDefinition,
  DataDefinition,
  FieldRenderData,
  FieldRenderContext,
} from '@schema-component/engine'
import type { ActionDefinition, RenderViewDefinition } from '@schema-component/engine'
import type {
  RendererComponent,
  DataRendererProps,
  FieldRendererProps,
  GroupRendererProps,
  ActionRendererProps,
  ViewRendererProps,
} from '../types'

// 延迟导入 react-connector 的注册函数,避免循环依赖
// 这个函数在运行时会被 registerReactComponent 替换
let reactComponentRegistrar: ((id: string, component: any) => void) | null = null

/**
 * 设置 React 组件注册器
 * 由 Theme 包在初始化时调用
 */
export function setReactComponentRegistrar(registrar: (id: string, component: any) => void): void {
  reactComponentRegistrar = registrar
}

/**
 * 生成唯一的组件标识符
 * 格式: category:type (不再使用计数器,因为同一个 type 应该使用同一个组件)
 */
function generateComponentId(category: string, type: string): string {
  return `${category}:${type}`
}

/**
 * Data Renderer 适配器
 * 将 React 数据渲染组件适配为 Engine IRenderer
 */
export function createDataRendererAdapter(
  type: string,
  component: RendererComponent<DataRendererProps>
): IRenderer<DataDefinition, any, RenderContext> {
  const componentId = generateComponentId('data', type)

  // 注册 React 组件到 react-connector
  if (reactComponentRegistrar) {
    reactComponentRegistrar(componentId, component)
  }

  return {
    category: 'data',
    type,
    render(definition: DataDefinition, data: any, context: RenderContext): RenderDescriptor {
      // 通过 modelRegistry 动态获取 model
      // modelName 从 context.currentModelName 获取（由父 View 传递）
      const modelName = context.currentModelName as string | undefined
      const model = modelName ? context.modelRegistry.get(modelName) : undefined

      return {
        component: componentId,
        props: {
          field: definition,
          name: definition.name,
          value: data,
          schema: model?.schema,
          data: context.record,
          mode: 'view', // 默认为查看模式
        },
        key: definition.name,
      }
    },
  }
}

/**
 * Field Renderer 适配器
 * 将 React 字段渲染组件适配为 Engine IRenderer
 */
export function createFieldRendererAdapter(
  type: string,
  component: RendererComponent<FieldRendererProps>
): IRenderer<EngineFieldDefinition, FieldRenderData, FieldRenderContext> {
  const componentId = generateComponentId('field', type)

  // 注册 React 组件到 react-connector
  if (reactComponentRegistrar) {
    reactComponentRegistrar(componentId, component)
  }

  return {
    category: 'field',
    type,
    render(
      definition: EngineFieldDefinition,
      data: FieldRenderData,
      context: FieldRenderContext
    ): RenderDescriptor {
      // 通过 modelRegistry 动态获取 model
      // modelName 从 context.currentModelName 获取（由父 View 传递）
      const modelName = context.currentModelName as string | undefined
      const model = modelName ? context.modelRegistry.get(modelName) : undefined

      return {
        component: componentId,
        props: {
          field: { name: definition.name, type: definition.type },
          fieldDef: definition,
          value: data.value,
          schema: model?.schema,
          data: data.record,
          mode: context.mode || 'view',
          disabled: context.disabled,
          readOnly: context.disabled,
          error: context.errors?.[0],
        },
        key: definition.name,
      }
    },
  }
}

/**
 * Group Renderer 适配器
 * 将 React 分组渲染组件适配为 Engine IRenderer
 */
export function createGroupRendererAdapter(
  type: string,
  component: RendererComponent<GroupRendererProps>
): IRenderer<GroupDefinition, any, RenderContext> {
  const componentId = generateComponentId('group', type)

  // 注册 React 组件到 react-connector
  if (reactComponentRegistrar) {
    reactComponentRegistrar(componentId, component)
  }

  return {
    category: 'group',
    type,
    render(definition: GroupDefinition, data: any, context: RenderContext): RenderDescriptor {
      // 通过 modelRegistry 动态获取 model
      // modelName 从 context.currentModelName 获取（由父 View 传递）
      const modelName = context.currentModelName as string | undefined
      const model = modelName ? context.modelRegistry.get(modelName) : undefined

      return {
        component: componentId,
        props: {
          group: definition,
          data,
          schema: model?.schema,
          mode: 'view',
        },
        key: definition.name,
      }
    },
  }
}

/**
 * Action Renderer 适配器
 * 将 React 动作渲染组件适配为 Engine IRenderer
 */
export function createActionRendererAdapter(
  type: string,
  component: RendererComponent<ActionRendererProps>
): IRenderer<ActionDefinition, any, RenderContext> {
  const componentId = generateComponentId('action', type)

  // 注册 React 组件到 react-connector
  if (reactComponentRegistrar) {
    reactComponentRegistrar(componentId, component)
  }

  return {
    category: 'action',
    type,
    render(definition: ActionDefinition, data: any, context: RenderContext): RenderDescriptor {
      return {
        component: componentId,
        props: {
          action: definition,
          data,
        },
        key: definition.name,
      }
    },
  }
}

/**
 * View Renderer 适配器
 * 将 React 视图渲染组件适配为 Engine IRenderer
 */
export function createViewRendererAdapter(
  type: string,
  component: RendererComponent<ViewRendererProps>
): IRenderer<RenderViewDefinition, any, RenderContext> {
  const componentId = generateComponentId('view', type)

  // 注册 React 组件到 react-connector
  if (reactComponentRegistrar) {
    reactComponentRegistrar(componentId, component)
  }

  return {
    category: 'view',
    type,
    render(definition: RenderViewDefinition, data: any, context: RenderContext): RenderDescriptor {
      // 通过 modelRegistry 动态获取 model（使用 definition.modelName）
      const model = context.modelRegistry.get(definition.modelName)

      // schema 优先从 context 获取（由 renderView 传入），否则从 model 获取
      const schema = (context as any).schema || model?.schema

      return {
        component: componentId,
        props: {
          view: definition,
          data,
          schema,
          onChange: (context as any).onChange,
          onAction: (context as any).onAction,
          mode: 'view',
          actions: definition.actions,
        },
        key: definition.name,
      }
    },
  }
}

/**
 * 通用适配器工厂
 */
export function createRendererAdapter<TComponent = any>(
  category: RendererCategory,
  type: string,
  component: TComponent
): IRenderer {
  switch (category) {
    case 'data':
      return createDataRendererAdapter(type, component as any)
    case 'field':
      return createFieldRendererAdapter(type, component as any)
    case 'group':
      return createGroupRendererAdapter(type, component as any)
    case 'action':
      return createActionRendererAdapter(type, component as any)
    case 'view':
      return createViewRendererAdapter(type, component as any)
    default:
      throw new Error(`Unknown renderer category: ${category}`)
  }
}

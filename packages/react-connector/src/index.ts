// Context and Core Interfaces
export {
  RenderContextProvider,
  useRenderContext,
  useApi,
  useConverter,
  type IReactRenderContext,
  type IApiLayer,
  type IRenderDescriptorConverter
} from './context/RenderContext'

// Hooks
export {
  useModelData,
  useModelAction,
  type UseModelDataOptions,
  type UseModelDataResult,
  type UseModelActionOptions,
  type UseModelActionResult,
  type ActionExecutionState,
  type ExtendedActionDefinition
} from './hooks'

// Components
export {
  ErrorBoundary,
  RenderErrorBoundary,
  type ErrorBoundaryProps,
  type RenderErrorBoundaryProps
} from './components'

// Converters
export {
  descriptorToReact,
  descriptorsToReact,
  registerReactComponent,
  registerReactComponents,
  getReactComponent,
  clearReactComponents,
  type ComponentMap,
} from './converters'

// Re-export Engine types for convenience
export type {
  RenderViewDefinition as ViewDefinition,
  GroupDefinition,
  FieldDefinition,
  DataDefinition,
  ActionDefinition,
  FieldRenderData,
  FieldRenderContext,
  RenderContext as EngineRenderContext
} from '@schema-component/engine'

/**
 * React Connector
 *
 * 这是一个纯桥接层，提供：
 * 1. React Context 管理
 * 2. 继承上层 Engine Context
 * 3. API 层桥接（getList/getOne/create/update/delete）
 * 4. RenderDescriptor 转换器（将 Engine 输出转换为 React 元素）
 * 5. 直接调用 Engine 的渲染方法并转换结果
 *
 * 注意：此层不包含任何具体的渲染器实现！
 * 所有具体实现都在 Engine 层的 renderer registry 中注册。
 * 下层组件包负责向 Engine 注册具体实现：
 * - @schema-component/antd-components
 * - @schema-component/mui-components
 * - @schema-component/custom-components
 *
 * 使用方式：
 * ```typescript
 * // 1. 在应用层设置
 * import { RenderContextProvider } from '@schema-component/react-connector'
 *
 * function App() {
 *   return (
 *     <RenderContextProvider engineContext={engineContext}>
 *       <MyApp />
 *     </RenderContextProvider>
 *   )
 * }
 *
 * // 2. 使用渲染
 * function MyApp() {
 *   const context = useRenderContext()
 *
 *   // 直接调用 Engine 层渲染（通过桥接器转换为 React 元素）
 *   return context.renderView(viewDefinition, { id: 123 })
 * }
 * ```
 */
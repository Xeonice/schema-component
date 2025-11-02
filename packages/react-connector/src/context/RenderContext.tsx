import React, { createContext, useContext, ReactNode } from 'react'
import type {
  RenderContext as EngineRenderContext,
  ViewDefinition,
  GroupDefinition,
  FieldDefinition,
  ActionDefinition,
  FieldRenderData,
  FieldRenderContext,
  DataDefinition,
  RenderDescriptor
} from '@schema-component/engine'
import { RenderEngine } from '@schema-component/engine'

/**
 * API 层接口
 */
export interface IApiLayer {
  getList(params?: any): Promise<any[]>
  getOne(id: string | number): Promise<any>
  create(data: any): Promise<any>
  update(id: string | number, data: any): Promise<any>
  delete(id: string | number): Promise<void>
}

/**
 * RenderDescriptor 转换器接口
 */
export interface IRenderDescriptorConverter {
  convert(descriptor: RenderDescriptor): React.ReactElement
}

/**
 * React 渲染上下文接口
 */
export interface IReactRenderContext {
  // 继承 Engine 的 context
  engineContext: EngineRenderContext

  // API 层
  api: IApiLayer

  // 转换器
  converter: IRenderDescriptorConverter

  // 核心渲染方法 - 直接调用 Engine 层并转换结果
  renderView(view: ViewDefinition, options?: { id?: string | number; params?: any }): React.ReactElement
  renderGroup(group: GroupDefinition, data: any): React.ReactElement
  renderField(field: FieldDefinition, data: FieldRenderData, context?: Partial<FieldRenderContext>): React.ReactElement
  renderData(definition: DataDefinition, value: any): React.ReactElement
  renderAction(action: ActionDefinition): React.ReactElement
}

/**
 * API 层实现
 */
class ApiLayer implements IApiLayer {
  constructor(private engineContext: EngineRenderContext) {}

  async getList(params?: any): Promise<any[]> {
    const model = this.engineContext.model
    if (!model || !model.apis || !model.apis.getList) {
      throw new Error(`No getList API found in model: ${this.engineContext.modelName}`)
    }
    const result = await model.apis.getList(params)
    return result.data || result
  }

  async getOne(id: string | number): Promise<any> {
    const model = this.engineContext.model
    if (!model || !model.apis || !model.apis.getOne) {
      throw new Error(`No getOne API found in model: ${this.engineContext.modelName}`)
    }
    return await model.apis.getOne(id)
  }

  async create(data: any): Promise<any> {
    const model = this.engineContext.model
    if (!model || !model.apis || !model.apis.create) {
      throw new Error(`No create API found in model: ${this.engineContext.modelName}`)
    }
    return await model.apis.create(data)
  }

  async update(id: string | number, data: any): Promise<any> {
    const model = this.engineContext.model
    if (!model || !model.apis || !model.apis.update) {
      throw new Error(`No update API found in model: ${this.engineContext.modelName}`)
    }
    return await model.apis.update(id, data)
  }

  async delete(id: string | number): Promise<void> {
    const model = this.engineContext.model
    if (!model || !model.apis || !model.apis.delete) {
      throw new Error(`No delete API found in model: ${this.engineContext.modelName}`)
    }
    return await model.apis.delete(id)
  }
}

/**
 * RenderDescriptor 转换器实现
 */
class RenderDescriptorConverter implements IRenderDescriptorConverter {
  convert(descriptor: RenderDescriptor): React.ReactElement {
    const { component, props = {}, children, key } = descriptor

    // 递归转换子元素
    const reactChildren = children?.map((child, index) => {
      if (typeof child === 'string') {
        return child
      }
      return this.convert({
        ...child,
        key: child.key ?? index
      })
    })

    // 创建 React 元素
    return React.createElement(component, { key, ...props }, ...reactChildren || [])
  }
}

/**
 * React 渲染上下文实现
 */
class ReactRenderContext implements IReactRenderContext {
  public api: IApiLayer
  public converter: IRenderDescriptorConverter

  constructor(public engineContext: EngineRenderContext) {
    this.api = new ApiLayer(engineContext)
    this.converter = new RenderDescriptorConverter()
  }

  renderView(view: ViewDefinition, options?: { id?: string | number; params?: any }): React.ReactElement {
    // 直接调用 Engine 的渲染方法
    const renderEngine = RenderEngine.getInstance()
    const descriptor = renderEngine.renderView(view, {}, this.engineContext)
    return this.converter.convert(descriptor)
  }

  renderGroup(group: GroupDefinition, data: any): React.ReactElement {
    // 直接调用 Engine 的渲染方法
    const renderEngine = RenderEngine.getInstance()
    const descriptor = renderEngine.renderGroup(group, data, this.engineContext)
    return this.converter.convert(descriptor)
  }

  renderField(field: FieldDefinition, data: FieldRenderData, context?: Partial<FieldRenderContext>): React.ReactElement {
    // 构建字段上下文
    const fieldContext: FieldRenderContext = {
      ...this.engineContext,
      mode: context?.mode || 'view',
      required: context?.required || field.required,
      disabled: context?.disabled || false,
      errors: context?.errors || []
    }

    // 直接调用 Engine 的渲染方法
    const renderEngine = RenderEngine.getInstance()
    const descriptor = renderEngine.renderField(
      field,
      data.value,
      data.record,
      fieldContext
    )
    return this.converter.convert(descriptor)
  }

  renderData(definition: DataDefinition, value: any): React.ReactElement {
    // 直接调用 Engine 的渲染方法
    const renderEngine = RenderEngine.getInstance()
    const descriptor = renderEngine.renderData(
      definition,
      value,
      this.engineContext
    )
    return this.converter.convert(descriptor)
  }

  renderAction(action: ActionDefinition): React.ReactElement {
    // 直接调用 Engine 的渲染方法
    const renderEngine = RenderEngine.getInstance()
    const descriptor = renderEngine.renderAction(action, this.engineContext)
    return this.converter.convert(descriptor)
  }
}

/**
 * React Context
 */
const RenderContext = createContext<IReactRenderContext | undefined>(undefined)

/**
 * RenderContext Provider Props
 */
export interface RenderContextProviderProps {
  engineContext: EngineRenderContext
  children: ReactNode
}

/**
 * RenderContext Provider
 */
export const RenderContextProvider: React.FC<RenderContextProviderProps> = ({
  engineContext,
  children
}) => {
  const [context] = React.useState(() => new ReactRenderContext(engineContext))

  return (
    <RenderContext.Provider value={context}>
      {children}
    </RenderContext.Provider>
  )
}

/**
 * useRenderContext Hook
 */
export const useRenderContext = (): IReactRenderContext => {
  const context = useContext(RenderContext)
  if (!context) {
    throw new Error('useRenderContext must be used within a RenderContextProvider')
  }
  return context
}

/**
 * useApi Hook - 访问 API 层
 */
export const useApi = (): IApiLayer => {
  const context = useRenderContext()
  return context.api
}

/**
 * useConverter Hook - 访问转换器
 */
export const useConverter = (): IRenderDescriptorConverter => {
  const context = useRenderContext()
  return context.converter
}
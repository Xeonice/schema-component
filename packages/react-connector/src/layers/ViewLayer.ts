import React from 'react'
import type {
  ViewDefinition,
  RenderContext,
  RenderDescriptor,
  IViewRenderer
} from '@schema-component/engine'
import type { RenderDescriptorConverter } from '../core'

/**
 * ViewLoader 接口
 */
export interface IViewLoader {
  load(viewDef: ViewDefinition, context: RenderContext): Promise<IViewRenderer>
}

/**
 * ViewRegistry 接口
 */
export interface IViewRegistry {
  register(type: string, renderer: IViewRenderer): void
  get(type: string): IViewRenderer | undefined
  getTypes(): string[]
}

/**
 * React ViewRenderer 接口
 */
export interface IReactViewRenderer extends IViewRenderer {
  renderReact(view: ViewDefinition, data: any, context: RenderContext): React.ReactElement
}

/**
 * ViewRegistry 实现
 */
export class ViewRegistry implements IViewRegistry {
  private renderers = new Map<string, IViewRenderer>()

  register(type: string, renderer: IViewRenderer): void {
    this.renderers.set(type, renderer)
  }

  get(type: string): IViewRenderer | undefined {
    return this.renderers.get(type)
  }

  getTypes(): string[] {
    return Array.from(this.renderers.keys())
  }

  clear(): void {
    this.renderers.clear()
  }
}

/**
 * ViewLoader 实现
 */
export class ViewLoader implements IViewLoader {
  private registry: IViewRegistry

  constructor(registry: IViewRegistry) {
    this.registry = registry
  }

  async load(viewDef: ViewDefinition, context: RenderContext): Promise<IViewRenderer> {
    const renderer = this.registry.get(viewDef.type)
    if (!renderer) {
      throw new Error(`No view renderer found for type: ${viewDef.type}`)
    }
    return renderer
  }
}

/**
 * React ViewRender - 视图层渲染器
 */
export class ReactViewRender {
  private loader: IViewLoader
  private converter: RenderDescriptorConverter

  constructor(loader: IViewLoader, converter: RenderDescriptorConverter) {
    this.loader = loader
    this.converter = converter
  }

  /**
   * 渲染视图为 React 元素
   */
  async render(view: ViewDefinition, data: any, context: RenderContext): Promise<React.ReactElement> {
    const renderer = await this.loader.load(view, context)

    // 优先使用 React 原生渲染方法
    if ('renderReact' in renderer && typeof renderer.renderReact === 'function') {
      return (renderer as IReactViewRenderer).renderReact(view, data, context)
    }

    // 回退到 RenderDescriptor 转换
    const descriptor = renderer.render(view, data, context)
    return this.converter.convert(descriptor)
  }

  /**
   * 批量渲染视图
   */
  async renderMany(views: ViewDefinition[], data: any, context: RenderContext): Promise<React.ReactElement[]> {
    const promises = views.map(view => this.render(view, data, context))
    return Promise.all(promises)
  }
}
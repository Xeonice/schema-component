import React from 'react'
import type {
  GroupDefinition,
  RenderContext,
  RenderDescriptor,
  IGroupRenderer
} from '@schema-component/engine'
import type { RenderDescriptorConverter } from '../core'

/**
 * GroupLoader 接口
 */
export interface IGroupLoader {
  load(groupDef: GroupDefinition, context: RenderContext): Promise<IGroupRenderer>
}

/**
 * GroupRegistry 接口
 */
export interface IGroupRegistry {
  register(type: string, renderer: IGroupRenderer): void
  get(type: string): IGroupRenderer | undefined
  getTypes(): string[]
}

/**
 * React GroupRenderer 接口
 */
export interface IReactGroupRenderer extends IGroupRenderer {
  renderReact(group: GroupDefinition, data: any, context: RenderContext): React.ReactElement
}

/**
 * GroupRegistry 实现
 */
export class GroupRegistry implements IGroupRegistry {
  private renderers = new Map<string, IGroupRenderer>()

  register(type: string, renderer: IGroupRenderer): void {
    this.renderers.set(type, renderer)
  }

  get(type: string): IGroupRenderer | undefined {
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
 * GroupLoader 实现
 */
export class GroupLoader implements IGroupLoader {
  private registry: IGroupRegistry

  constructor(registry: IGroupRegistry) {
    this.registry = registry
  }

  async load(groupDef: GroupDefinition, context: RenderContext): Promise<IGroupRenderer> {
    const renderer = this.registry.get(groupDef.type)
    if (!renderer) {
      throw new Error(`No group renderer found for type: ${groupDef.type}`)
    }
    return renderer
  }
}

/**
 * React GroupRender - 分组层渲染器
 */
export class ReactGroupRender {
  private loader: IGroupLoader
  private converter: RenderDescriptorConverter

  constructor(loader: IGroupLoader, converter: RenderDescriptorConverter) {
    this.loader = loader
    this.converter = converter
  }

  /**
   * 渲染分组为 React 元素
   */
  async render(group: GroupDefinition, data: any, context: RenderContext): Promise<React.ReactElement> {
    const renderer = await this.loader.load(group, context)

    // 优先使用 React 原生渲染方法
    if ('renderReact' in renderer && typeof renderer.renderReact === 'function') {
      return (renderer as IReactGroupRenderer).renderReact(group, data, context)
    }

    // 回退到 RenderDescriptor 转换
    const descriptor = renderer.render(group, data, context)
    return this.converter.convert(descriptor)
  }

  /**
   * 批量渲染分组
   */
  async renderMany(groups: GroupDefinition[], data: any, context: RenderContext): Promise<React.ReactElement[]> {
    const promises = groups.map(group => this.render(group, data, context))
    return Promise.all(promises)
  }
}
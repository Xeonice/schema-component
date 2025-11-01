import React from 'react'
import type {
  FieldDefinition,
  RenderContext,
  RenderDescriptor,
  IFieldRenderer
} from '@schema-component/engine'
import type { RenderDescriptorConverter } from '../core'

/**
 * FieldLoader 接口
 */
export interface IFieldLoader {
  load(fieldDef: FieldDefinition, context: RenderContext): Promise<IFieldRenderer>
}

/**
 * FieldRegistry 接口
 */
export interface IFieldRegistry {
  register(layout: string, renderer: IFieldRenderer): void
  get(layout: string): IFieldRenderer | undefined
  getLayouts(): string[]
}

/**
 * React FieldRenderer 接口
 */
export interface IReactFieldRenderer extends Omit<IFieldRenderer, 'render'> {
  renderReact(
    field: FieldDefinition,
    value: any,
    record: any,
    context: RenderContext & { mode?: 'view' | 'edit' }
  ): React.ReactElement
}

/**
 * FieldRegistry 实现
 */
export class FieldRegistry implements IFieldRegistry {
  private renderers = new Map<string, IFieldRenderer>()

  register(layout: string, renderer: IFieldRenderer): void {
    this.renderers.set(layout, renderer)
  }

  get(layout: string): IFieldRenderer | undefined {
    return this.renderers.get(layout)
  }

  getLayouts(): string[] {
    return Array.from(this.renderers.keys())
  }

  clear(): void {
    this.renderers.clear()
  }
}

/**
 * FieldLoader 实现
 */
export class FieldLoader implements IFieldLoader {
  private registry: IFieldRegistry

  constructor(registry: IFieldRegistry) {
    this.registry = registry
  }

  async load(fieldDef: FieldDefinition, context: RenderContext): Promise<IFieldRenderer> {
    const layout = fieldDef.layout || 'vertical'
    const renderer = this.registry.get(layout)
    if (!renderer) {
      throw new Error(`No field renderer found for layout: ${layout}`)
    }
    return renderer
  }
}

/**
 * React FieldRender - 字段层渲染器
 */
export class ReactFieldRender {
  private loader: IFieldLoader
  private converter: RenderDescriptorConverter

  constructor(loader: IFieldLoader, converter: RenderDescriptorConverter) {
    this.loader = loader
    this.converter = converter
  }

  /**
   * 渲染字段为 React 元素
   */
  async render(
    field: FieldDefinition,
    value: any,
    record: any,
    context: RenderContext & { mode?: 'view' | 'edit' }
  ): Promise<React.ReactElement> {
    const renderer = await this.loader.load(field, context)

    // 优先使用 React 原生渲染方法
    if ('renderReact' in renderer && typeof renderer.renderReact === 'function') {
      return (renderer as IReactFieldRenderer).renderReact(field, value, record, context)
    }

    // 回退到 RenderDescriptor 转换
    const descriptor = renderer.render(field, value, record, context)
    return this.converter.convert(descriptor)
  }

  /**
   * 批量渲染字段
   */
  async renderMany(
    fields: FieldDefinition[],
    record: any,
    context: RenderContext & { mode?: 'view' | 'edit' }
  ): Promise<React.ReactElement[]> {
    const promises = fields.map(field => {
      const value = record?.[field.name]
      return this.render(field, value, record, context)
    })
    return Promise.all(promises)
  }
}
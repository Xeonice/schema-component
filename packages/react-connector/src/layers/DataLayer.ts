import React from 'react'
import type {
  RenderContext,
  RenderDescriptor,
  IDataRenderer,
  DataDefinition
} from '@schema-component/engine'
import type { RenderDescriptorConverter } from '../core'

/**
 * DataLoader 接口
 */
export interface IDataLoader {
  load(dataDef: DataDefinition, context: RenderContext): Promise<IDataRenderer>
}

/**
 * DataRegistry 接口
 */
export interface IDataRegistry {
  register(type: string, renderer: IDataRenderer): void
  get(type: string): IDataRenderer | undefined
  getTypes(): string[]
}

/**
 * React DataRenderer 接口
 */
export interface IReactDataRenderer extends IDataRenderer {
  renderReact(data: DataDefinition, value: any, context: RenderContext): React.ReactElement
}

/**
 * DataRegistry 实现
 */
export class DataRegistry implements IDataRegistry {
  private renderers = new Map<string, IDataRenderer>()

  register(type: string, renderer: IDataRenderer): void {
    this.renderers.set(type, renderer)
  }

  get(type: string): IDataRenderer | undefined {
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
 * DataLoader 实现
 */
export class DataLoader implements IDataLoader {
  private registry: IDataRegistry

  constructor(registry: IDataRegistry) {
    this.registry = registry
  }

  async load(dataDef: DataDefinition, context: RenderContext): Promise<IDataRenderer> {
    const renderer = this.registry.get(dataDef.type)
    if (!renderer) {
      throw new Error(`No data renderer found for type: ${dataDef.type}`)
    }
    return renderer
  }
}

/**
 * React DataRender - 数据层渲染器
 */
export class ReactDataRender {
  private loader: IDataLoader
  private converter: RenderDescriptorConverter

  constructor(loader: IDataLoader, converter: RenderDescriptorConverter) {
    this.loader = loader
    this.converter = converter
  }

  /**
   * 渲染数据为 React 元素
   */
  async render(data: DataDefinition, value: any, context: RenderContext): Promise<React.ReactElement> {
    const renderer = await this.loader.load(data, context)

    // 优先使用 React 原生渲染方法
    if ('renderReact' in renderer && typeof renderer.renderReact === 'function') {
      return (renderer as IReactDataRenderer).renderReact(data, value, context)
    }

    // 回退到 RenderDescriptor 转换
    const descriptor = renderer.render(data, value, context)
    return this.converter.convert(descriptor)
  }

  /**
   * 批量渲染数据
   */
  async renderMany(dataList: Array<{ data: DataDefinition; value: any }>, context: RenderContext): Promise<React.ReactElement[]> {
    const promises = dataList.map(({ data, value }) => this.render(data, value, context))
    return Promise.all(promises)
  }
}

/**
 * 预置的数据类型渲染器
 */

/**
 * 字符串数据渲染器
 */
export class StringDataRenderer implements IReactDataRenderer {
  category = 'data' as const
  type = 'string'

  render(data: DataDefinition, value: any, context: RenderContext): RenderDescriptor {
    return {
      component: 'span',
      props: {
        className: 'string-data',
        title: value?.toString()
      },
      children: [value?.toString() || '']
    }
  }

  renderReact(data: DataDefinition, value: any, context: RenderContext): React.ReactElement {
    return React.createElement('span', {
      className: 'string-data',
      title: value?.toString()
    }, value?.toString() || '')
  }
}

/**
 * 数字数据渲染器
 */
export class NumberDataRenderer implements IReactDataRenderer {
  category = 'data' as const
  type = 'number'

  render(data: DataDefinition, value: any, context: RenderContext): RenderDescriptor {
    const numValue = Number(value)
    const formatted = isNaN(numValue) ? '0' : numValue.toLocaleString()

    return {
      component: 'span',
      props: {
        className: 'number-data',
        title: formatted
      },
      children: [formatted]
    }
  }

  renderReact(data: DataDefinition, value: any, context: RenderContext): React.ReactElement {
    const numValue = Number(value)
    const formatted = isNaN(numValue) ? '0' : numValue.toLocaleString()

    return React.createElement('span', {
      className: 'number-data',
      title: formatted
    }, formatted)
  }
}

/**
 * 日期数据渲染器
 */
export class DateDataRenderer implements IReactDataRenderer {
  category = 'data' as const
  type = 'date'

  render(data: DataDefinition, value: any, context: RenderContext): RenderDescriptor {
    const date = value instanceof Date ? value : new Date(value)
    const formatted = isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString()

    return {
      component: 'span',
      props: {
        className: 'date-data',
        title: date.toISOString()
      },
      children: [formatted]
    }
  }

  renderReact(data: DataDefinition, value: any, context: RenderContext): React.ReactElement {
    const date = value instanceof Date ? value : new Date(value)
    const formatted = isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString()

    return React.createElement('span', {
      className: 'date-data',
      title: date.toISOString()
    }, formatted)
  }
}

/**
 * 布尔数据渲染器
 */
export class BooleanDataRenderer implements IReactDataRenderer {
  category = 'data' as const
  type = 'boolean'

  render(data: DataDefinition, value: any, context: RenderContext): RenderDescriptor {
    const boolValue = Boolean(value)

    return {
      component: 'span',
      props: {
        className: `boolean-data ${boolValue ? 'true' : 'false'}`,
        'data-value': boolValue
      },
      children: [boolValue ? 'True' : 'False']
    }
  }

  renderReact(data: DataDefinition, value: any, context: RenderContext): React.ReactElement {
    const boolValue = Boolean(value)

    return React.createElement('span', {
      className: `boolean-data ${boolValue ? 'true' : 'false'}`,
      'data-value': boolValue
    }, boolValue ? 'True' : 'False')
  }
}

/**
 * 数组数据渲染器
 */
export class ArrayDataRenderer implements IReactDataRenderer {
  category = 'data' as const
  type = 'array'

  render(data: DataDefinition, value: any, context: RenderContext): RenderDescriptor {
    const arrayValue = Array.isArray(value) ? value : []

    return {
      component: 'div',
      props: {
        className: 'array-data'
      },
      children: arrayValue.map((item, index): RenderDescriptor => ({
        component: 'div',
        props: {
          key: index,
          className: 'array-item'
        },
        children: [JSON.stringify(item)]
      }))
    }
  }

  renderReact(data: DataDefinition, value: any, context: RenderContext): React.ReactElement {
    const arrayValue = Array.isArray(value) ? value : []

    return React.createElement('div', {
      className: 'array-data'
    }, arrayValue.map((item, index) =>
      React.createElement('div', {
        key: index,
        className: 'array-item'
      }, JSON.stringify(item))
    ))
  }
}

/**
 * 对象数据渲染器
 */
export class ObjectDataRenderer implements IReactDataRenderer {
  category = 'data' as const
  type = 'object'

  render(data: DataDefinition, value: any, context: RenderContext): RenderDescriptor {
    if (!value || typeof value !== 'object') {
      return {
        component: 'span',
        props: { className: 'object-data empty' },
        children: ['{}']
      }
    }

    const entries = Object.entries(value)

    return {
      component: 'div',
      props: {
        className: 'object-data'
      },
      children: entries.map(([key, val]): RenderDescriptor => ({
        component: 'div',
        props: {
          className: 'object-entry'
        },
        children: [
          {
            component: 'span',
            props: { className: 'object-key' },
            children: [`${key}: `]
          },
          {
            component: 'span',
            props: { className: 'object-value' },
            children: [JSON.stringify(val)]
          }
        ]
      }))
    }
  }

  renderReact(data: DataDefinition, value: any, context: RenderContext): React.ReactElement {
    if (!value || typeof value !== 'object') {
      return React.createElement('span', {
        className: 'object-data empty'
      }, '{}')
    }

    const entries = Object.entries(value)

    return React.createElement('div', {
      className: 'object-data'
    }, entries.map(([key, val], index) =>
      React.createElement('div', {
        key: index,
        className: 'object-entry'
      }, [
        React.createElement('span', {
          key: 'key',
          className: 'object-key'
        }, `${key}: `),
        React.createElement('span', {
          key: 'value',
          className: 'object-value'
        }, JSON.stringify(val))
      ])
    ))
  }
}
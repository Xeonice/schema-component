import React from 'react'
import type { RenderDescriptor } from '@schema-component/engine'

/**
 * 组件映射表接口
 */
export interface ComponentMap {
  [componentName: string]: React.ComponentType<any>
}

/**
 * 转换器配置
 */
export interface ConverterConfig {
  componentMap: ComponentMap
  defaultComponent?: React.ComponentType<any>
}

/**
 * RenderDescriptor 到 React 元素的转换器
 */
export class RenderDescriptorConverter {
  private componentMap: ComponentMap
  private defaultComponent: React.ComponentType<any>

  constructor(config: ConverterConfig) {
    this.componentMap = config.componentMap
    this.defaultComponent = config.defaultComponent || (() => React.createElement('div', {}, 'Unknown Component'))
  }

  /**
   * 转换 RenderDescriptor 为 React 元素
   */
  convert(descriptor: RenderDescriptor): React.ReactElement {
    const Component = this.componentMap[descriptor.component] || this.defaultComponent

    // 处理子元素
    const children = descriptor.children?.map((child, index) => {
      if (typeof child === 'string') {
        return child
      }
      return React.createElement(React.Fragment, { key: index }, this.convert(child))
    })

    return React.createElement(Component, descriptor.props, ...children || [])
  }

  /**
   * 批量转换多个 RenderDescriptor
   */
  convertMany(descriptors: RenderDescriptor[]): React.ReactElement[] {
    return descriptors.map((descriptor, index) =>
      React.createElement(React.Fragment, { key: index }, this.convert(descriptor))
    )
  }

  /**
   * 更新组件映射
   */
  updateComponentMap(componentMap: Partial<ComponentMap>): void {
    Object.assign(this.componentMap, componentMap)
  }

  /**
   * 获取当前组件映射
   */
  getComponentMap(): ComponentMap {
    return { ...this.componentMap }
  }
}
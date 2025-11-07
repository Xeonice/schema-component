/**
 * RenderDescriptor to React Element Converter
 *
 * 将 Engine 层的 RenderDescriptor (框架无关) 转换为 React 元素
 *
 * 职责:
 * 1. 解析 RenderDescriptor 的 component 字段
 * 2. 从组件注册表中获取真实的 React 组件
 * 3. 递归转换子元素
 * 4. 返回可渲染的 React 元素
 */

import React, { ComponentType } from 'react'
import type { RenderDescriptor } from '@schema-component/engine'

/**
 * 组件注册表类型
 * 用于存储 component ID 到 React 组件的映射
 */
export type ComponentMap = Map<string, ComponentType<any>>

/**
 * 全局组件注册表
 * 由 Theme 层在初始化时填充
 */
const globalComponentMap: ComponentMap = new Map()

/**
 * 注册 React 组件
 * Theme 层使用此函数注册组件实现
 */
export function registerReactComponent(id: string, component: ComponentType<any>): void {
  globalComponentMap.set(id, component)
}

/**
 * 批量注册 React 组件
 */
export function registerReactComponents(components: Record<string, ComponentType<any>>): void {
  Object.entries(components).forEach(([id, component]) => {
    registerReactComponent(id, component)
  })
}

/**
 * 获取注册的 React 组件
 */
export function getReactComponent(id: string): ComponentType<any> | undefined {
  return globalComponentMap.get(id)
}

/**
 * 清空组件注册表 (主要用于测试)
 */
export function clearReactComponents(): void {
  globalComponentMap.clear()
}

/**
 * 将 RenderDescriptor 转换为 React 元素
 *
 * @param descriptor - Engine 返回的渲染描述符
 * @param componentMap - 可选的自定义组件映射表 (默认使用全局注册表)
 * @returns React 元素
 */
export function descriptorToReact(
  descriptor: RenderDescriptor | string,
  componentMap: ComponentMap = globalComponentMap
): React.ReactElement | string | null {
  // 处理字符串类型 (文本节点)
  if (typeof descriptor === 'string') {
    return descriptor
  }

  // 处理空值
  if (!descriptor) {
    return null
  }

  const { component, props = {}, children, key } = descriptor

  // 从注册表中获取组件
  const Component = componentMap.get(component)

  if (!Component) {
    // 组件未注册,返回错误提示
    console.error(`[descriptorToReact] Component not registered: ${component}`)
    return (
      <div key={key} style={{ padding: '8px', color: '#ef4444', fontSize: '14px' }}>
        ⚠️ Component not registered: {component}
      </div>
    )
  }

  // 递归转换子元素
  const reactChildren = children?.map((child, index) => {
    if (typeof child === 'string') {
      return child
    }
    // 使用子元素的 key 或回退到索引
    const childKey = child.key ?? `${key}-child-${index}`
    return descriptorToReact({ ...child, key: childKey }, componentMap)
  })

  // 创建 React 元素
  return React.createElement(
    Component,
    { ...props, key },
    reactChildren && reactChildren.length > 0 ? reactChildren : undefined
  )
}

/**
 * 批量转换 RenderDescriptor 数组
 */
export function descriptorsToReact(
  descriptors: (RenderDescriptor | string)[],
  componentMap: ComponentMap = globalComponentMap
): (React.ReactElement | string | null)[] {
  return descriptors.map((descriptor, index) => {
    if (typeof descriptor === 'string') {
      return descriptor
    }
    // 确保每个元素都有 key
    const key = descriptor.key ?? `batch-${index}`
    return descriptorToReact({ ...descriptor, key }, componentMap)
  })
}

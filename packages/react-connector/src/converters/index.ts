/**
 * Converters
 *
 * 转换器模块 - 负责将 Engine 的输出转换为 React 可渲染的元素
 */

export {
  descriptorToReact,
  descriptorsToReact,
  registerReactComponent,
  registerReactComponents,
  getReactComponent,
  clearReactComponents,
  type ComponentMap,
} from './descriptorToReact'

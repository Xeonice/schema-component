import type { RenderContext, RenderDescriptor, IRenderer } from './types'

/**
 * 字段定义
 */
export interface FieldDefinition {
  type: string        // 字段类型：string、number、boolean、date、enum、json、array、belongsTo、hasMany
  name: string        // 字段名称
  label?: string      // 显示标签
  required?: boolean  // 是否必填
  format?: string     // 显示格式
  [key: string]: any  // 扩展属性
}

import type { DataDefinition } from './types'

/**
 * DataRenderer 接口
 * 基于数据类型渲染（修复LSP违反问题）
 */
export interface IDataRenderer extends IRenderer<DataDefinition, any, RenderContext> {
  category: 'data'
  type: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object' | string

  /** 渲染字段（编辑模式） */
  renderEdit?(definition: DataDefinition, value: any, context: RenderContext): RenderDescriptor

  /** 格式化显示值 */
  format?(value: any, definition: DataDefinition): string
}

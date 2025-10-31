import type { RenderContext, RenderDescriptor } from './types'

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

/**
 * DataRenderer 接口
 * 基于 Schema 字段类型渲染
 */
export interface IDataRenderer {
  /** 支持的字段类型 */
  type: string

  /** 渲染字段（展示模式） */
  render(value: any, field: FieldDefinition, context: RenderContext): RenderDescriptor

  /** 渲染字段（编辑模式） */
  renderEdit?(value: any, field: FieldDefinition, context: RenderContext): RenderDescriptor

  /** 格式化显示值 */
  format?(value: any, field: FieldDefinition): string
}

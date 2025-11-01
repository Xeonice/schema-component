import type { RenderContext, RenderDescriptor, IRenderer } from './types'
import type { ActionDefinition } from './actionTypes'

export type ViewType = 'list' | 'form' | 'detail' | 'kanban' | 'calendar' | string

/**
 * 列定义
 */
export interface ColumnDefinition {
  field: string
  title?: string
  width?: number | string
  align?: 'left' | 'center' | 'right'
  sortable?: boolean
  filterable?: boolean
  render?: (value: any, record: any, context: RenderContext) => RenderDescriptor
  [key: string]: any
}

/**
 * View 定义
 */
export interface ViewDefinition {
  type: ViewType
  title?: string
  fields?: string[]
  layout?: string
  columns?: ColumnDefinition[]
  actions?: ActionDefinition[]
  [key: string]: any
}

/**
 * ViewRenderer 接口
 * 基于 View 类型渲染
 */
export interface IViewRenderer extends IRenderer {
  category: 'view'
  type: ViewType

  /** 渲染视图 */
  render(view: ViewDefinition, data: any, context: RenderContext): RenderDescriptor
}

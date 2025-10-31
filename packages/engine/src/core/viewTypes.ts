/**
 * View related types
 */

import type { ModelContext } from './types'

// ============================================================================
// View Types
// ============================================================================

/**
 * 视图类型
 */
export type ViewType = 'list' | 'form' | 'kanban' | 'calendar' | 'table' | 'grid' | string

/**
 * 视图配置基础接口
 */
export interface ViewConfig {
  type: ViewType
  title?: string
  description?: string
  [key: string]: any
}

/**
 * 列表视图配置
 */
export interface ListViewConfig extends ViewConfig {
  type: 'list'
  columns?: Array<{
    field: string
    label: string
    sortable?: boolean
    filterable?: boolean
    render?: string
    width?: number | string
  }>
  actions?: string[]
  bulkActions?: string[]
  defaultSort?: {
    field: string
    order: 'ASC' | 'DESC'
  }
  pagination?: {
    pageSize?: number
    pageSizeOptions?: number[]
  }
}

/**
 * 表单视图配置
 */
export interface FormViewConfig extends ViewConfig {
  type: 'form'
  layout?: 'horizontal' | 'vertical' | 'inline'
  sections?: Array<{
    title?: string
    fields: string[]
    columns?: number
  }>
  submitText?: string
  cancelText?: string
}

/**
 * 看板视图配置
 */
export interface KanbanViewConfig extends ViewConfig {
  type: 'kanban'
  groupBy: string
  cardFields?: string[]
  allowDrag?: boolean
}

/**
 * 日历视图配置
 */
export interface CalendarViewConfig extends ViewConfig {
  type: 'calendar'
  dateField: string
  titleField: string
  descriptionField?: string
}

/**
 * 视图定义集合
 */
export interface ViewDefinitions {
  list?: ListViewConfig
  form?: FormViewConfig
  kanban?: KanbanViewConfig
  calendar?: CalendarViewConfig
  [key: string]: ViewConfig | undefined
}

/**
 * Views 定义：函数形式或对象形式
 * - 函数形式：可以访问 context，支持动态生成
 * - 对象形式：静态配置
 */
export type ViewsDefinition =
  | ViewDefinitions
  | ((context: ModelContext) => ViewDefinitions)

import type { IModel } from '../core/defineModel'
import type { IViewStack } from './ViewStack'
import type { IActionQueue } from './ActionQueue'

/**
 * 渲染器分类
 */
export type RendererCategory = 'view' | 'group' | 'field' | 'data' | 'action'

/**
 * 统一的渲染器接口（使用泛型支持类型安全）
 */
export interface IRenderer<TDefinition = any, TData = any, TContext = RenderContext> {
  category: RendererCategory
  type: string
  render(definition: TDefinition, data: TData, context: TContext): RenderDescriptor
}

/**
 * 渲染描述符（框架无关）
 */
export interface RenderDescriptor {
  component: string
  props: Record<string, any>
  children?: (RenderDescriptor | string)[]
  key?: string | number
}

/**
 * 渲染上下文
 */
export interface RenderContext {
  // Model 信息
  modelName: string
  model: IModel

  // 数据
  record?: any
  records?: any[]

  // Engine 提供的状态（Action 专属）
  viewStack: IViewStack
  actionQueue: IActionQueue

  // UI 控制器（由框架层实现）
  modal?: IModalController
  drawer?: IDrawerController
  message?: IMessageController
  navigate?: (path: string) => void

  // 其他上下文
  [key: string]: any
}

/**
 * Modal 控制器
 */
export interface IModalController {
  open: (config: ModalConfig) => void
  close: () => void
}

/**
 * Drawer 控制器
 */
export interface IDrawerController {
  open: (config: DrawerConfig) => void
  close: () => void
}

/**
 * Message 控制器
 */
export interface IMessageController {
  success: (msg: string) => void
  error: (msg: string) => void
  warning: (msg: string) => void
  info: (msg: string) => void
  loading: (msg: string) => () => void
}

/**
 * Modal 配置
 */
export interface ModalConfig {
  title?: string
  content: any
  width?: number | string
  footer?: any
  onOk?: () => void | Promise<void>
  onCancel?: () => void
}

/**
 * Drawer 配置
 */
export interface DrawerConfig {
  title?: string
  content: any
  width?: number | string
  placement?: 'left' | 'right' | 'top' | 'bottom'
  onClose?: () => void
}

/**
 * 分组定义
 */
export interface GroupDefinition {
  type: 'card' | 'collapse' | 'tab' | 'section' | 'accordion' | string
  name: string
  title: string
  fields: string[]
  collapsible?: boolean
  defaultExpanded?: boolean
  icon?: string
  description?: string
  [key: string]: any
}

/**
 * 字段定义（扩展版本，包含渲染相关配置）
 */
export interface FieldDefinition {
  type: string                    // 数据类型：string、number、boolean、date 等
  name: string                    // 字段名称
  label?: string                  // 显示标签
  required?: boolean              // 是否必填
  format?: string                 // 显示格式
  layout?: 'horizontal' | 'vertical' | 'inline' | 'grid'  // 布局方式
  tooltip?: string                // 提示信息
  helpText?: string              // 帮助文本
  placeholder?: string           // 占位符
  validate?: (value: any) => string | null  // 验证函数
  actions?: any[]                // 字段级动作
  [key: string]: any             // 扩展属性
}

/**
 * GroupRenderer 接口
 */
export interface IGroupRenderer extends IRenderer<GroupDefinition, any, RenderContext> {
  category: 'group'
  type: 'card' | 'collapse' | 'tab' | 'section' | 'accordion' | string
}

/**
 * FieldRenderer 接口（修复LSP违反问题）
 */
export interface IFieldRenderer extends IRenderer<FieldDefinition, FieldRenderData, FieldRenderContext> {
  category: 'field'
  type: 'horizontal' | 'vertical' | 'inline' | 'grid' | string
}

/**
 * 数据定义
 */
export interface DataDefinition {
  type: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object'
  name: string
  format?: string
  [key: string]: any
}

/**
 * 字段渲染数据结构
 */
export interface FieldRenderData {
  /** 当前字段的值 */
  value: any
  /** 完整的记录数据 */
  record: any
  /** 在数组中的索引（可选） */
  index?: number
  /** 字段在表单中的路径（可选） */
  fieldPath?: string
}

/**
 * 字段渲染上下文
 */
export interface FieldRenderContext extends RenderContext {
  /** 渲染模式：查看 | 编辑 */
  mode?: 'view' | 'edit'
  /** 是否为必填字段 */
  required?: boolean
  /** 是否禁用 */
  disabled?: boolean
  /** 验证错误信息 */
  errors?: string[]
}

/**
 * 批量渲染数据结构
 */
export interface BatchRenderData<T = any> {
  /** 数据项列表 */
  items: T[]
  /** 总数量 */
  total?: number
  /** 当前页码 */
  page?: number
  /** 页面大小 */
  pageSize?: number
  /** 是否正在加载 */
  loading?: boolean
}

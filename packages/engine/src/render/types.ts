import type { IModel } from '../core/defineModel'
import type { IViewStack } from './ViewStack'
import type { IActionQueue } from './ActionQueue'

/**
 * 渲染器分类
 */
export type RendererCategory = 'view' | 'group' | 'field' | 'data' | 'action'

/**
 * 统一的渲染器接口
 */
export interface IRenderer {
  category: RendererCategory
  type: string
  render(definition: any, data: any, context: RenderContext): RenderDescriptor
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
export interface IGroupRenderer extends IRenderer {
  category: 'group'
  type: 'card' | 'collapse' | 'tab' | 'section' | 'accordion' | string

  /** 渲染分组 */
  render(group: GroupDefinition, data: any, context: RenderContext): RenderDescriptor
}

/**
 * FieldRenderer 接口
 */
export interface IFieldRenderer extends Omit<IRenderer, 'render'> {
  category: 'field'
  type: 'horizontal' | 'vertical' | 'inline' | 'grid' | string

  /** 渲染字段 */
  render(
    field: FieldDefinition,
    value: any,
    record: any,
    context: RenderContext & { mode?: 'view' | 'edit' }
  ): RenderDescriptor
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

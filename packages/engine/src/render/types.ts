import type { IModel } from '../core/defineModel'
import type { IViewStack } from './ViewStack'
import type { IActionQueue } from './ActionQueue'

/**
 * 渲染描述符（框架无关）
 */
export interface RenderDescriptor {
  type: string
  props: Record<string, any>
  children?: RenderDescriptor[]
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

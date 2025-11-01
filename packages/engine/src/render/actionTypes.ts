import type { RenderContext, RenderDescriptor, IRenderer } from './types'

export type ActionType = 'server' | 'view'

/**
 * 基础 Action 定义
 */
export interface BaseActionDefinition {
  type: ActionType
  name: string
  label: string
  icon?: string
  buttonType?: 'primary' | 'default' | 'dashed' | 'text' | 'link'
  disabled?: boolean | ((context: RenderContext) => boolean)
  visible?: boolean | ((context: RenderContext) => boolean)
  renderAs?: string  // 渲染模式：button、menu、dropdown、toolbar 等
}

/**
 * ServerAction 定义（调用 Model Actions）
 */
export interface ServerActionDefinition extends BaseActionDefinition {
  type: 'server'
  getParams?: (context: RenderContext) => any
  confirm?: string | { title: string; description?: string }
  onSuccess?: (result: any, context: RenderContext) => void
  onError?: (error: Error, context: RenderContext) => void
  successMessage?: string | ((result: any) => string)
  errorMessage?: string | ((error: Error) => string)
}

/**
 * ViewAction 定义（纯前端操作）
 */
export interface ViewActionDefinition extends BaseActionDefinition {
  type: 'view'
  handler: (context: RenderContext) => void | Promise<void>
}

export type ActionDefinition = ServerActionDefinition | ViewActionDefinition

/**
 * ActionRenderer 接口
 */
export interface IActionRenderer extends IRenderer {
  category: 'action'
  type: 'button' | 'menu' | 'dropdown' | 'toolbar' | 'link' | 'fab' | string

  /** 渲染动作 */
  render(action: ActionDefinition, context: RenderContext): RenderDescriptor

  /** 渲染服务端动作（可选，向后兼容） */
  renderServer?(action: ServerActionDefinition, context: RenderContext): RenderDescriptor

  /** 渲染视图动作（可选，向后兼容） */
  renderView?(action: ViewActionDefinition, context: RenderContext): RenderDescriptor
}

import { makeObservable } from 'mobx'
import type { IDataRenderer, FieldDefinition as DataFieldDefinition } from './dataTypes'
import type { IViewRenderer, ViewDefinition } from './viewTypes'
import type { IActionRenderer, ActionDefinition, ServerActionDefinition, ViewActionDefinition } from './actionTypes'
import type {
  RenderContext,
  RenderDescriptor,
  IRenderer,
  RendererCategory,
  IGroupRenderer,
  IFieldRenderer,
  GroupDefinition,
  FieldDefinition
} from './types'
import { ViewStack, type IViewStack } from './ViewStack'
import { ActionQueue, type IActionQueue, type ActionQueueConfig } from './ActionQueue'
import { RendererRegistry } from './RendererRegistry'

export interface RenderEngineConfig {
  viewStack?: IViewStack
  actionQueue?: IActionQueue
  actionQueueConfig?: ActionQueueConfig
}

export class RenderEngine {
  private static instance: RenderEngine
  private registry: RendererRegistry

  public readonly viewStack: IViewStack
  public readonly actionQueue: IActionQueue

  private constructor(config: RenderEngineConfig = {}) {
    this.registry = RendererRegistry.getInstance()
    this.viewStack = config.viewStack || new ViewStack()
    this.actionQueue = config.actionQueue || new ActionQueue(config.actionQueueConfig)

    makeObservable(this)
  }

  static getInstance(config?: RenderEngineConfig): RenderEngine {
    if (!RenderEngine.instance) {
      RenderEngine.instance = new RenderEngine(config)
    }
    return RenderEngine.instance
  }

  // ========== 统一注册方法 ==========

  /**
   * 注册单个渲染器
   */
  registerRenderer(renderer: IRenderer): void {
    this.registry.register(renderer)
  }

  /**
   * 批量注册渲染器
   */
  registerRenderers(renderers: IRenderer[]): void {
    this.registry.registerMany(renderers)
  }

  /**
   * 获取渲染器
   */
  getRenderer(category: RendererCategory, type: string): IRenderer | undefined {
    return this.registry.get(category, type)
  }

  // ========== 分类注册方法（向后兼容） ==========

  /**
   * 注册数据渲染器
   */
  registerDataRenderer(renderer: IDataRenderer): void {
    this.registry.register(renderer)
  }

  /**
   * 获取数据渲染器
   */
  getDataRenderer(type: string): IDataRenderer | undefined {
    return this.registry.get('data', type) as IDataRenderer
  }

  /**
   * 注册视图渲染器
   */
  registerViewRenderer(renderer: IViewRenderer): void {
    this.registry.register(renderer)
  }

  /**
   * 获取视图渲染器
   */
  getViewRenderer(type: string): IViewRenderer | undefined {
    return this.registry.get('view', type) as IViewRenderer
  }

  /**
   * 注册动作渲染器
   */
  registerActionRenderer(type: string, renderer: IActionRenderer): void {
    // 兼容旧的调用方式，确保 type 被正确设置
    if (!renderer.type) {
      (renderer as any).type = type
    }
    this.registry.register(renderer)
  }

  /**
   * 获取动作渲染器
   */
  getActionRenderer(type: string): IActionRenderer | undefined {
    return this.registry.get('action', type) as IActionRenderer
  }

  /**
   * 注册分组渲染器
   */
  registerGroupRenderer(renderer: IGroupRenderer): void {
    this.registry.register(renderer)
  }

  /**
   * 获取分组渲染器
   */
  getGroupRenderer(type: string): IGroupRenderer | undefined {
    return this.registry.get('group', type) as IGroupRenderer
  }

  /**
   * 注册字段渲染器
   */
  registerFieldRenderer(renderer: IFieldRenderer): void {
    this.registry.register(renderer)
  }

  /**
   * 获取字段渲染器
   */
  getFieldRenderer(type: string): IFieldRenderer | undefined {
    return this.registry.get('field', type) as IFieldRenderer
  }

  // ========== 渲染方法 ==========

  /**
   * 渲染数据字段
   */
  renderData(
    value: any,
    field: FieldDefinition,
    context: RenderContext,
    mode: 'view' | 'edit' = 'view'
  ): RenderDescriptor {
    const renderer = this.getDataRenderer(field.type)
    if (!renderer) {
      throw new Error(`No data renderer found for type "${field.type}"`)
    }

    if (mode === 'edit' && renderer.renderEdit) {
      return renderer.renderEdit(value, field, context)
    }

    return renderer.render(value, field, context)
  }

  /**
   * 渲染视图
   */
  renderView(view: ViewDefinition, data: any, context: RenderContext): RenderDescriptor {
    const renderer = this.getViewRenderer(view.type)
    if (!renderer) {
      throw new Error(`No view renderer found for type "${view.type}"`)
    }

    return renderer.render(view, data, context)
  }

  /**
   * 渲染动作
   */
  renderAction(action: ActionDefinition, context: RenderContext): RenderDescriptor {
    const actionType = action.renderAs || 'button'
    const renderer = this.getActionRenderer(actionType)
    if (!renderer) {
      throw new Error(`No action renderer found for type "${actionType}"`)
    }

    // 优先使用统一的 render 方法
    if (renderer.render) {
      return renderer.render(action, context)
    }

    // 向后兼容：使用旧的 renderServer/renderView 方法
    if (action.type === 'server' && renderer.renderServer) {
      return renderer.renderServer(action as ServerActionDefinition, context)
    } else if (action.type === 'view' && renderer.renderView) {
      return renderer.renderView(action as ViewActionDefinition, context)
    }

    throw new Error(`Action renderer for type "${actionType}" does not support action type "${action.type}"`)
  }

  /**
   * 渲染分组
   */
  renderGroup(group: GroupDefinition, data: any, context: RenderContext): RenderDescriptor {
    const renderer = this.getGroupRenderer(group.type)
    if (!renderer) {
      throw new Error(`No group renderer found for type "${group.type}"`)
    }

    return renderer.render(group, data, context)
  }

  /**
   * 渲染字段容器
   */
  renderField(
    field: FieldDefinition,
    value: any,
    record: any,
    context: RenderContext & { mode?: 'view' | 'edit' }
  ): RenderDescriptor {
    const layoutType = field.layout || 'vertical'
    const renderer = this.getFieldRenderer(layoutType)
    if (!renderer) {
      throw new Error(`No field renderer found for layout "${layoutType}"`)
    }

    return renderer.render(field, value, record, context)
  }

  // ========== 管理方法 ==========

  /**
   * 获取渲染器统计信息
   */
  getRendererStats(): Record<RendererCategory, number> {
    return this.registry.getStats()
  }

  /**
   * 获取某个分类的可用类型
   */
  getAvailableTypes(category: RendererCategory): string[] {
    return this.registry.getTypes(category)
  }

  /**
   * 检查渲染器是否存在
   */
  hasRenderer(category: RendererCategory, type: string): boolean {
    return this.registry.has(category, type)
  }

  /**
   * 清空某个分类的渲染器
   */
  clearRenderers(category?: RendererCategory): void {
    if (category) {
      this.registry.clearCategory(category)
    } else {
      this.registry.clear()
    }
  }

  // ========== 上下文管理 ==========

  /**
   * 创建渲染上下文
   */
  createContext(base: Partial<RenderContext>): RenderContext {
    return {
      modelName: base.modelName || '',
      model: base.model!,
      viewStack: this.viewStack,
      actionQueue: this.actionQueue,
      ...base
    } as RenderContext
  }

  // ========== 动作执行 ==========

  /**
   * 执行 ServerAction
   */
  async executeServerAction(
    action: ServerActionDefinition,
    params: any,
    context: RenderContext
  ): Promise<string> {
    return this.actionQueue.enqueue(action, params, context)
  }

  /**
   * 执行 ViewAction
   */
  async executeViewAction(
    action: ViewActionDefinition,
    context: RenderContext
  ): Promise<void> {
    try {
      await action.handler(context)
    } catch (error) {
      console.error(`ViewAction "${action.name}" failed:`, error)
      throw error
    }
  }
}
import { makeObservable } from 'mobx'
import type { IDataRenderer, FieldDefinition } from './dataTypes'
import type { IViewRenderer, ViewDefinition } from './viewTypes'
import type { IActionRenderer, ActionDefinition, ServerActionDefinition, ViewActionDefinition } from './actionTypes'
import type { RenderContext, RenderDescriptor } from './types'
import { ViewStack, type IViewStack } from './ViewStack'
import { ActionQueue, type IActionQueue, type ActionQueueConfig } from './ActionQueue'

export interface RenderEngineConfig {
  viewStack?: IViewStack
  actionQueue?: IActionQueue
  actionQueueConfig?: ActionQueueConfig
}

export class RenderEngine {
  private static instance: RenderEngine

  private dataRenderers: Map<string, IDataRenderer> = new Map()
  private viewRenderers: Map<string, IViewRenderer> = new Map()
  private actionRenderers: Map<string, IActionRenderer> = new Map()

  public readonly viewStack: IViewStack
  public readonly actionQueue: IActionQueue

  private constructor(config: RenderEngineConfig = {}) {
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

  // DataRenderer 注册
  registerDataRenderer(renderer: IDataRenderer): void {
    this.dataRenderers.set(renderer.type, renderer)
  }

  getDataRenderer(type: string): IDataRenderer | undefined {
    return this.dataRenderers.get(type)
  }

  // ViewRenderer 注册
  registerViewRenderer(renderer: IViewRenderer): void {
    this.viewRenderers.set(renderer.type, renderer)
  }

  getViewRenderer(type: string): IViewRenderer | undefined {
    return this.viewRenderers.get(type)
  }

  // ActionRenderer 注册
  registerActionRenderer(name: string, renderer: IActionRenderer): void {
    this.actionRenderers.set(name, renderer)
  }

  getActionRenderer(name: string): IActionRenderer | undefined {
    return this.actionRenderers.get(name)
  }

  // 渲染方法
  renderData(
    value: any,
    field: FieldDefinition,
    context: RenderContext,
    mode: 'view' | 'edit' = 'view'
  ): RenderDescriptor {
    const renderer = this.dataRenderers.get(field.type)
    if (!renderer) {
      throw new Error(`No data renderer found for type "${field.type}"`)
    }

    if (mode === 'edit' && renderer.renderEdit) {
      return renderer.renderEdit(value, field, context)
    }

    return renderer.render(value, field, context)
  }

  renderView(view: ViewDefinition, data: any, context: RenderContext): RenderDescriptor {
    const renderer = this.viewRenderers.get(view.type)
    if (!renderer) {
      throw new Error(`No view renderer found for type "${view.type}"`)
    }

    return renderer.render(view, data, context)
  }

  renderAction(action: ActionDefinition, context: RenderContext): RenderDescriptor {
    const renderer = this.actionRenderers.get(action.renderAs || 'button')
    if (!renderer) {
      throw new Error(`No action renderer found for mode "${action.renderAs}"`)
    }

    if (action.type === 'server') {
      return renderer.renderServer!(action, context)
    } else {
      return renderer.renderView!(action, context)
    }
  }

  // 创建渲染上下文
  createContext(base: Partial<RenderContext>): RenderContext {
    return {
      modelName: base.modelName || '',
      model: base.model!,
      viewStack: this.viewStack,
      actionQueue: this.actionQueue,
      ...base
    } as RenderContext
  }

  // 执行 ServerAction
  async executeServerAction(
    action: ServerActionDefinition,
    params: any,
    context: RenderContext
  ): Promise<string> {
    return this.actionQueue.enqueue(action, params, context)
  }

  // 执行 ViewAction
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

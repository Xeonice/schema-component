import React from 'react'
import type {
  ActionDefinition,
  RenderContext,
  RenderDescriptor,
  IActionRenderer
} from '@schema-component/engine'
import type { RenderDescriptorConverter } from '../core'

/**
 * 扩展的客户端动作定义
 */
export interface ClientActionDefinition {
  type: 'button' | 'link' | 'icon' | 'dropdown' | 'submit' | 'modal'
  name: string
  title?: string
  label?: string
  id?: string
  style?: string
  disabled?: boolean
  handler?: (event?: any) => void
  url?: string
  target?: string
  icon?: string
  form?: string
  modalTarget?: string
  items?: ClientActionDefinition[]
}

/**
 * ActionLoader 接口
 */
export interface IActionLoader {
  load(actionDef: ClientActionDefinition, context: RenderContext): Promise<IActionRenderer>
}

/**
 * ActionRegistry 接口
 */
export interface IActionRegistry {
  register(type: string, renderer: IActionRenderer): void
  get(type: string): IActionRenderer | undefined
  getTypes(): string[]
}

/**
 * React ActionRenderer 接口
 */
export interface IReactActionRenderer extends IActionRenderer {
  renderReact(action: ClientActionDefinition, context: RenderContext): React.ReactElement
}

/**
 * ActionRegistry 实现
 */
export class ActionRegistry implements IActionRegistry {
  private renderers = new Map<string, IActionRenderer>()

  register(type: string, renderer: IActionRenderer): void {
    this.renderers.set(type, renderer)
  }

  get(type: string): IActionRenderer | undefined {
    return this.renderers.get(type)
  }

  getTypes(): string[] {
    return Array.from(this.renderers.keys())
  }

  clear(): void {
    this.renderers.clear()
  }
}

/**
 * ActionLoader 实现
 */
export class ActionLoader implements IActionLoader {
  private registry: IActionRegistry

  constructor(registry: IActionRegistry) {
    this.registry = registry
  }

  async load(actionDef: ClientActionDefinition, context: RenderContext): Promise<IActionRenderer> {
    const renderer = this.registry.get(actionDef.type)
    if (!renderer) {
      throw new Error(`No action renderer found for type: ${actionDef.type}`)
    }
    return renderer
  }
}

/**
 * React ActionRender - 动作层渲染器
 */
export class ReactActionRender {
  private loader: IActionLoader
  private converter: RenderDescriptorConverter

  constructor(loader: IActionLoader, converter: RenderDescriptorConverter) {
    this.loader = loader
    this.converter = converter
  }

  /**
   * 渲染动作为 React 元素
   */
  async render(action: ClientActionDefinition, context: RenderContext): Promise<React.ReactElement> {
    const renderer = await this.loader.load(action, context)

    // 优先使用 React 原生渲染方法
    if ('renderReact' in renderer && typeof renderer.renderReact === 'function') {
      return (renderer as IReactActionRenderer).renderReact(action, context)
    }

    // 回退到 RenderDescriptor 转换
    const descriptor = renderer.render(action, context)
    return this.converter.convert(descriptor)
  }

  /**
   * 批量渲染动作
   */
  async renderMany(actions: ClientActionDefinition[], context: RenderContext): Promise<React.ReactElement[]> {
    const promises = actions.map(action => this.render(action, context))
    return Promise.all(promises)
  }
}

/**
 * 预置的动作类型渲染器
 */

/**
 * 按钮动作渲染器
 */
export class ButtonActionRenderer implements IReactActionRenderer {
  category = 'action' as const
  type = 'button'

  render(action: ClientActionDefinition, context: RenderContext): RenderDescriptor {
    return {
      component: 'button',
      props: {
        className: `action-button ${action.style || 'default'}`,
        disabled: action.disabled,
        onClick: action.handler,
        'data-action-id': action.id
      },
      children: [action.title || action.name]
    }
  }

  renderReact(action: ClientActionDefinition, context: RenderContext): React.ReactElement {
    return React.createElement('button', {
      className: `action-button ${action.style || 'default'}`,
      disabled: action.disabled,
      onClick: action.handler,
      'data-action-id': action.id
    }, action.title || action.name)
  }
}

/**
 * 链接动作渲染器
 */
export class LinkActionRenderer implements IReactActionRenderer {
  category = 'action' as const
  type = 'link'

  render(action: ClientActionDefinition, context: RenderContext): RenderDescriptor {
    return {
      component: 'a',
      props: {
        className: `action-link ${action.style || 'default'}`,
        href: action.url,
        target: action.target || '_self',
        onClick: action.handler,
        'data-action-id': action.id
      },
      children: [action.title || action.name]
    }
  }

  renderReact(action: ClientActionDefinition, context: RenderContext): React.ReactElement {
    return React.createElement('a', {
      className: `action-link ${action.style || 'default'}`,
      href: action.url,
      target: action.target || '_self',
      onClick: action.handler,
      'data-action-id': action.id
    }, action.title || action.name)
  }
}

/**
 * 图标动作渲染器
 */
export class IconActionRenderer implements IReactActionRenderer {
  category = 'action' as const
  type = 'icon'

  render(action: ClientActionDefinition, context: RenderContext): RenderDescriptor {
    return {
      component: 'span',
      props: {
        className: `action-icon ${action.style || 'default'}`,
        onClick: action.handler,
        title: action.title || action.name,
        'data-action-id': action.id
      },
      children: [
        {
          component: 'i',
          props: {
            className: action.icon || 'default-icon'
          },
          children: []
        }
      ]
    }
  }

  renderReact(action: ClientActionDefinition, context: RenderContext): React.ReactElement {
    return React.createElement('span', {
      className: `action-icon ${action.style || 'default'}`,
      onClick: action.handler,
      title: action.title || action.name,
      'data-action-id': action.id
    }, React.createElement('i', {
      className: action.icon || 'default-icon'
    }))
  }
}

/**
 * 下拉菜单动作渲染器
 */
export class DropdownActionRenderer implements IReactActionRenderer {
  category = 'action' as const
  type = 'dropdown'

  render(action: ClientActionDefinition, context: RenderContext): RenderDescriptor {
    const items = action.items || []

    return {
      component: 'div',
      props: {
        className: `action-dropdown ${action.style || 'default'}`,
        'data-action-id': action.id
      },
      children: [
        {
          component: 'button',
          props: {
            className: 'dropdown-trigger',
            onClick: action.handler
          },
          children: [action.title || action.name]
        },
        {
          component: 'div',
          props: {
            className: 'dropdown-menu'
          },
          children: items.map((item: any) => ({
            component: 'div',
            props: {
              className: 'dropdown-item',
              onClick: item.handler
            },
            children: [item.title || item.name]
          }))
        }
      ]
    }
  }

  renderReact(action: ClientActionDefinition, context: RenderContext): React.ReactElement {
    const items = action.items || []

    return React.createElement('div', {
      className: `action-dropdown ${action.style || 'default'}`,
      'data-action-id': action.id
    }, [
      React.createElement('button', {
        key: 'trigger',
        className: 'dropdown-trigger',
        onClick: action.handler
      }, action.title || action.name),
      React.createElement('div', {
        key: 'menu',
        className: 'dropdown-menu'
      }, items.map((item: any, index: number) =>
        React.createElement('div', {
          key: index,
          className: 'dropdown-item',
          onClick: item.handler
        }, item.title || item.name)
      ))
    ])
  }
}

/**
 * 表单提交动作渲染器
 */
export class SubmitActionRenderer implements IReactActionRenderer {
  category = 'action' as const
  type = 'submit'

  render(action: ClientActionDefinition, context: RenderContext): RenderDescriptor {
    return {
      component: 'button',
      props: {
        type: 'submit',
        className: `action-submit ${action.style || 'primary'}`,
        disabled: action.disabled,
        form: action.form,
        onClick: action.handler,
        'data-action-id': action.id
      },
      children: [action.title || '提交']
    }
  }

  renderReact(action: ClientActionDefinition, context: RenderContext): React.ReactElement {
    return React.createElement('button', {
      type: 'submit',
      className: `action-submit ${action.style || 'primary'}`,
      disabled: action.disabled,
      form: action.form,
      onClick: action.handler,
      'data-action-id': action.id
    }, action.title || '提交')
  }
}

/**
 * 模态框动作渲染器
 */
export class ModalActionRenderer implements IReactActionRenderer {
  category = 'action' as const
  type = 'modal'

  render(action: ClientActionDefinition, context: RenderContext): RenderDescriptor {
    return {
      component: 'button',
      props: {
        className: `action-modal ${action.style || 'default'}`,
        disabled: action.disabled,
        onClick: () => {
          // 模态框逻辑应该由外部处理
          if (action.handler) {
            action.handler()
          }
        },
        'data-action-id': action.id,
        'data-modal-target': action.modalTarget
      },
      children: [action.title || action.name]
    }
  }

  renderReact(action: ClientActionDefinition, context: RenderContext): React.ReactElement {
    return React.createElement('button', {
      className: `action-modal ${action.style || 'default'}`,
      disabled: action.disabled,
      onClick: () => {
        if (action.handler) {
          action.handler()
        }
      },
      'data-action-id': action.id,
      'data-modal-target': action.modalTarget
    }, action.title || action.name)
  }
}
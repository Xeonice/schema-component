# Engine 层渲染架构重新设计 (V2)

## 问题

当前的 Engine 层渲染器注册分散在多个独立的注册表中：
- ActionRenderer 单独注册
- ViewRenderer 单独注册
- DataRenderer 单独注册

这导致：
1. 注册流程复杂，需要调用多个注册方法
2. 渲染器管理分散，难以统一扩展
3. 查找逻辑复杂，需要根据类型选择不同的注册表

## 解决方案

### 统一渲染器注册表

将所有渲染器注册到同一张表上，通过 `category:type` 的形式进行标识和查找。

```typescript
// src/render/types.ts - 更新渲染器接口
export type RendererCategory = 'view' | 'group' | 'field' | 'data' | 'action'

export interface RendererDefinition {
  category: RendererCategory
  type: string
  renderer: IRenderer
}

// 统一的渲染器接口
export interface IRenderer {
  category: RendererCategory
  type: string
  render(definition: any, data: any, context: RenderContext): RenderDescriptor
}

// 具体的渲染器接口（向后兼容）
export interface IViewRenderer extends IRenderer {
  category: 'view'
  render(view: ViewDefinition, data: any, context: RenderContext): RenderDescriptor
}

export interface IGroupRenderer extends IRenderer {
  category: 'group'
  render(group: GroupDefinition, data: any, context: RenderContext): RenderDescriptor
}

export interface IFieldRenderer extends IRenderer {
  category: 'field'
  render(field: FieldDefinition, value: any, record: any, context: RenderContext): RenderDescriptor
}

export interface IDataRenderer extends IRenderer {
  category: 'data'
  render(value: any, field: FieldDefinition, context: RenderContext): RenderDescriptor
  renderEdit?(value: any, field: FieldDefinition, context: RenderContext): RenderDescriptor
  format?(value: any, field: FieldDefinition): string
}

export interface IActionRenderer extends IRenderer {
  category: 'action'
  render(action: ActionDefinition, context: RenderContext): RenderDescriptor
}
```

### 统一的渲染器注册表

```typescript
// src/render/RendererRegistry.ts
export class RendererRegistry {
  private static instance: RendererRegistry
  private renderers = new Map<string, IRenderer>()

  static getInstance(): RendererRegistry {
    if (!RendererRegistry.instance) {
      RendererRegistry.instance = new RendererRegistry()
    }
    return RendererRegistry.instance
  }

  // 统一注册方法
  register(renderer: IRenderer): void {
    const key = `${renderer.category}:${renderer.type}`
    this.renderers.set(key, renderer)
  }

  // 批量注册
  registerMany(renderers: IRenderer[]): void {
    renderers.forEach(renderer => this.register(renderer))
  }

  // 统一查找方法
  get(category: RendererCategory, type: string): IRenderer | undefined {
    const key = `${category}:${type}`
    return this.renderers.get(key)
  }

  // 获取某个分类的所有渲染器
  getByCategory(category: RendererCategory): IRenderer[] {
    return Array.from(this.renderers.entries())
      .filter(([key]) => key.startsWith(`${category}:`))
      .map(([, renderer]) => renderer)
  }

  // 获取所有渲染器类型
  getTypes(category: RendererCategory): string[] {
    return this.getByCategory(category).map(renderer => renderer.type)
  }

  // 检查是否存在
  has(category: RendererCategory, type: string): boolean {
    const key = `${category}:${type}`
    return this.renderers.has(key)
  }

  // 取消注册
  unregister(category: RendererCategory, type: string): boolean {
    const key = `${category}:${type}`
    return this.renderers.delete(key)
  }

  // 清空某个分类
  clearCategory(category: RendererCategory): void {
    const keys = Array.from(this.renderers.keys())
      .filter(key => key.startsWith(`${category}:`))
    keys.forEach(key => this.renderers.delete(key))
  }

  // 清空所有
  clear(): void {
    this.renderers.clear()
  }

  // 获取统计信息
  getStats(): Record<RendererCategory, number> {
    const stats: Record<RendererCategory, number> = {
      view: 0,
      group: 0,
      field: 0,
      data: 0,
      action: 0
    }

    for (const [key] of this.renderers) {
      const category = key.split(':')[0] as RendererCategory
      if (stats[category] !== undefined) {
        stats[category]++
      }
    }

    return stats
  }
}
```

### 更新 RenderEngine

```typescript
// src/render/RenderEngine.ts - 更新版本
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

  // 统一注册方法
  registerRenderer(renderer: IRenderer): void {
    this.registry.register(renderer)
  }

  // 批量注册
  registerRenderers(renderers: IRenderer[]): void {
    this.registry.registerMany(renderers)
  }

  // 按分类注册（便捷方法，向后兼容）
  registerViewRenderer(renderer: IViewRenderer): void {
    this.registry.register(renderer)
  }

  registerGroupRenderer(renderer: IGroupRenderer): void {
    this.registry.register(renderer)
  }

  registerFieldRenderer(renderer: IFieldRenderer): void {
    this.registry.register(renderer)
  }

  registerDataRenderer(renderer: IDataRenderer): void {
    this.registry.register(renderer)
  }

  registerActionRenderer(renderer: IActionRenderer): void {
    this.registry.register(renderer)
  }

  // 统一获取方法
  getRenderer(category: RendererCategory, type: string): IRenderer | undefined {
    return this.registry.get(category, type)
  }

  // 分类获取方法（向后兼容）
  getViewRenderer(type: string): IViewRenderer | undefined {
    return this.registry.get('view', type) as IViewRenderer
  }

  getGroupRenderer(type: string): IGroupRenderer | undefined {
    return this.registry.get('group', type) as IGroupRenderer
  }

  getFieldRenderer(type: string): IFieldRenderer | undefined {
    return this.registry.get('field', type) as IFieldRenderer
  }

  getDataRenderer(type: string): IDataRenderer | undefined {
    return this.registry.get('data', type) as IDataRenderer
  }

  getActionRenderer(type: string): IActionRenderer | undefined {
    return this.registry.get('action', type) as IActionRenderer
  }

  // 渲染方法
  renderView(view: ViewDefinition, data: any, context: RenderContext): RenderDescriptor {
    const renderer = this.getViewRenderer(view.type)
    if (!renderer) {
      throw new Error(`No view renderer found for type "${view.type}"`)
    }
    return renderer.render(view, data, context)
  }

  renderGroup(group: GroupDefinition, data: any, context: RenderContext): RenderDescriptor {
    const renderer = this.getGroupRenderer(group.type)
    if (!renderer) {
      throw new Error(`No group renderer found for type "${group.type}"`)
    }
    return renderer.render(group, data, context)
  }

  renderField(
    field: FieldDefinition,
    value: any,
    record: any,
    context: RenderContext
  ): RenderDescriptor {
    const layoutType = field.layout || 'vertical'
    const renderer = this.getFieldRenderer(layoutType)
    if (!renderer) {
      throw new Error(`No field renderer found for layout "${layoutType}"`)
    }
    return renderer.render(field, value, record, context)
  }

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

  renderAction(action: ActionDefinition, context: RenderContext): RenderDescriptor {
    const renderer = this.getActionRenderer(action.type)
    if (!renderer) {
      throw new Error(`No action renderer found for type "${action.type}"`)
    }
    return renderer.render(action, context)
  }

  // 获取注册统计
  getRendererStats(): Record<RendererCategory, number> {
    return this.registry.getStats()
  }

  // 获取可用类型
  getAvailableTypes(category: RendererCategory): string[] {
    return this.registry.getTypes(category)
  }
}
```

## React-Connector 层的调整

```typescript
// packages/react-connector/src/setup/RendererSetup.ts
import { RenderEngine } from '@schema-component/engine'
import * as ViewRenderers from '../renderers/view'
import * as GroupRenderers from '../renderers/group'
import * as FieldRenderers from '../renderers/field'
import * as DataRenderers from '../renderers/data'
import * as ActionRenderers from '../renderers/action'

export function setupReactRenderers(engine: RenderEngine): void {
  // 统一注册所有渲染器
  const allRenderers = [
    // View Renderers
    new ViewRenderers.ListViewRenderer(),
    new ViewRenderers.TableViewRenderer(),
    new ViewRenderers.ObjectViewRenderer(),
    new ViewRenderers.FormViewRenderer(),
    new ViewRenderers.KanbanViewRenderer(),
    new ViewRenderers.CalendarViewRenderer(),

    // Group Renderers
    new GroupRenderers.CardGroupRenderer(),
    new GroupRenderers.CollapseGroupRenderer(),
    new GroupRenderers.TabGroupRenderer(),
    new GroupRenderers.SectionGroupRenderer(),
    new GroupRenderers.AccordionGroupRenderer(),

    // Field Renderers
    new FieldRenderers.VerticalFieldRenderer(),
    new FieldRenderers.HorizontalFieldRenderer(),
    new FieldRenderers.InlineFieldRenderer(),
    new FieldRenderers.GridFieldRenderer(),

    // Data Renderers
    new DataRenderers.StringDataRenderer(),
    new DataRenderers.NumberDataRenderer(),
    new DataRenderers.DateDataRenderer(),
    new DataRenderers.BooleanDataRenderer(),
    new DataRenderers.SelectDataRenderer(),
    new DataRenderers.RelationDataRenderer(),
    new DataRenderers.FileDataRenderer(),
    new DataRenderers.ImageDataRenderer(),
    new DataRenderers.JsonDataRenderer(),

    // Action Renderers
    new ActionRenderers.ButtonActionRenderer(),
    new ActionRenderers.LinkActionRenderer(),
    new ActionRenderers.MenuActionRenderer(),
    new ActionRenderers.DropdownActionRenderer(),
    new ActionRenderers.FabActionRenderer(),
    new ActionRenderers.ToolbarActionRenderer(),
  ]

  // 批量注册
  engine.registerRenderers(allRenderers)

  console.log('React renderers registered:', engine.getRendererStats())
}
```

## 具体的渲染器实现示例

```typescript
// packages/react-connector/src/renderers/view/ListViewRenderer.ts
export class ListViewRenderer implements IViewRenderer {
  category: 'view' = 'view'
  type = 'list'

  render(view: ViewDefinition, data: any[], context: RenderContext): RenderDescriptor {
    const { fields = [], groupBy, sortBy, filters } = view

    // 数据处理
    let processedData = this.processData(data, { groupBy, sortBy, filters })

    // 如果有分组配置
    if (view.groups && view.groups.length > 0) {
      return {
        type: 'div',
        props: {
          className: 'list-view grouped',
          children: view.groups.map(group =>
            context.engine.renderGroup(group, processedData, context)
          )
        }
      }
    }

    // 普通列表
    return {
      type: 'div',
      props: {
        className: 'list-view',
        children: processedData.map((record, index) => ({
          type: 'div',
          key: record.id || index,
          props: {
            className: 'list-item',
            children: fields.map(fieldName => {
              const field = context.model.fields[fieldName]
              return context.engine.renderField(field, record[fieldName], record, context)
            })
          }
        }))
      }
    }
  }

  private processData(data: any[], options: any): any[] {
    // 实现数据处理逻辑
    return data
  }
}

// packages/react-connector/src/renderers/data/StringDataRenderer.ts
export class StringDataRenderer implements IDataRenderer {
  category: 'data' = 'data'
  type = 'string'

  render(value: any, field: FieldDefinition, context: RenderContext): RenderDescriptor {
    const formatted = this.format(value, field)

    if (field.richText) {
      return {
        type: 'div',
        props: {
          dangerouslySetInnerHTML: { __html: formatted }
        }
      }
    }

    if (field.multiline) {
      return {
        type: 'pre',
        props: {
          className: 'string-multiline',
          children: formatted
        }
      }
    }

    return {
      type: 'span',
      props: {
        className: 'string-value',
        children: formatted
      }
    }
  }

  renderEdit(value: any, field: FieldDefinition, context: RenderContext): RenderDescriptor {
    if (field.multiline) {
      return {
        type: 'textarea',
        props: {
          className: 'string-textarea',
          value: value || '',
          onChange: (e: any) => context.onChange?.(field.name, e.target.value),
          placeholder: field.placeholder,
          rows: field.rows || 4
        }
      }
    }

    return {
      type: 'input',
      props: {
        type: 'text',
        className: 'string-input',
        value: value || '',
        onChange: (e: any) => context.onChange?.(field.name, e.target.value),
        placeholder: field.placeholder
      }
    }
  }

  format(value: any, field: FieldDefinition): string {
    return String(value || '')
  }
}

// packages/react-connector/src/renderers/action/ButtonActionRenderer.ts
export class ButtonActionRenderer implements IActionRenderer {
  category: 'action' = 'action'
  type = 'button'

  render(action: ActionDefinition, context: RenderContext): RenderDescriptor {
    return {
      type: 'button',
      props: {
        className: `action-button ${action.primary ? 'primary' : ''} ${action.danger ? 'danger' : ''}`,
        onClick: () => this.handleClick(action, context),
        disabled: action.disabled,
        title: action.tooltip,
        children: [
          action.icon && {
            type: 'span',
            props: {
              className: 'action-icon',
              children: action.icon
            }
          },
          action.label
        ].filter(Boolean)
      }
    }
  }

  private async handleClick(action: ActionDefinition, context: RenderContext): Promise<void> {
    if (action.handler) {
      try {
        await action.handler(context)
      } catch (error) {
        console.error(`Action "${action.name}" failed:`, error)
        context.message?.error(`${action.label}失败: ${error.message}`)
      }
    }
  }
}
```

## 使用示例

```typescript
// app.ts - 应用初始化
import { RenderEngine } from '@schema-component/engine'
import { setupReactRenderers } from '@schema-component/react-connector'

const engine = RenderEngine.getInstance()

// 一次性注册所有 React 渲染器
setupReactRenderers(engine)

// 查看注册情况
console.log('Available view types:', engine.getAvailableTypes('view'))
console.log('Available data types:', engine.getAvailableTypes('data'))
console.log('Available action types:', engine.getAvailableTypes('action'))
console.log('Renderer stats:', engine.getRendererStats())

// 使用统一的渲染方法
const viewDescriptor = engine.renderView(viewDef, data, context)
const fieldDescriptor = engine.renderField(fieldDef, value, record, context)
const actionDescriptor = engine.renderAction(actionDef, context)
```

## 优势

1. **统一管理**：所有渲染器都在同一个注册表中，便于管理和扩展
2. **简化注册**：一次性批量注册所有渲染器，不需要分别调用多个注册方法
3. **类型安全**：通过 category:type 的形式，保证类型安全
4. **向后兼容**：保留了原有的分类获取方法，不影响现有代码
5. **统计信息**：可以方便地获取各类渲染器的注册统计
6. **灵活扩展**：支持动态注册和取消注册，便于插件化扩展

这样的设计让 Engine 层更加统一和灵活，同时简化了 React-Connector 层的集成工作。
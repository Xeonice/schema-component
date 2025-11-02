# @schema-component/react-connector 设计文档

## 概述

`@schema-component/react-connector` 是一个连接层包，负责将 `@schema-component/engine` 的框架无关渲染系统与 React 框架进行集成。通过这个包，可以实现 render 层与具体框架的完全解耦。

## 设计目标

1. **完全解耦**：Engine 层保持框架无关，React 相关逻辑全部封装在 connector 中
2. **类型安全**：提供完整的 TypeScript 类型支持
3. **性能优化**：利用 React 18+ 特性和 MobX 响应式更新
4. **可扩展性**：支持自定义组件和渲染器的注册
5. **开发体验**：提供便捷的 Hooks 和 HOC API

## 架构设计

```
┌──────────────────────────────────────────────────────────┐
│                    React Application                      │
│  ┌────────────────────────────────────────────────────┐ │
│  │         React Components (Ant Design, MUI...)       │ │
│  └────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
                              ↑
                              │ 使用
                              │
┌──────────────────────────────────────────────────────────┐
│            @schema-component/react-connector              │
│  ┌────────────────────────────────────────────────────┐ │
│  │                Core Converter                       │ │
│  │  - RenderDescriptor → React.Element                 │ │
│  │  - Component Registry                               │ │
│  │  - Context Bridge                                   │ │
│  └────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────┐ │
│  │              React Renderers                        │ │
│  │  - ReactDataRenderer                                │ │
│  │  - ReactViewRenderer                                │ │
│  │  - ReactActionRenderer                              │ │
│  └────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────┐ │
│  │            React UI Controllers                     │ │
│  │  - Modal / Drawer / Message                         │ │
│  │  - Navigation / Router Integration                  │ │
│  └────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────┐ │
│  │              State Integration                      │ │
│  │  - MobX-React Bindings                              │ │
│  │  - React Context Provider                           │ │
│  │  - Hooks (useEngine, useModel, useView)             │ │
│  └────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
                              ↑
                              │ 调用
                              │
┌──────────────────────────────────────────────────────────┐
│             @schema-component/engine                      │
│  - RenderEngine (框架无关)                                │
│  - RenderDescriptor (纯数据结构)                          │
│  - ViewStack / ActionQueue (状态管理)                    │
└──────────────────────────────────────────────────────────┘
```

## 核心模块

### 1. Core Converter (核心转换器)

#### 1.1 RenderDescriptor to React

```typescript
// src/core/converter.tsx
import React from 'react'
import { RenderDescriptor } from '@schema-component/engine'

export interface ConverterConfig {
  // 组件映射表
  componentMap?: Map<string, React.ComponentType<any>>
  // 默认组件
  defaultComponent?: React.ComponentType<any>
  // 属性转换器
  propsTransformer?: (props: any, type: string) => any
}

export class ReactConverter {
  private componentMap: Map<string, React.ComponentType<any>>

  constructor(config: ConverterConfig = {}) {
    this.componentMap = config.componentMap || new Map()
  }

  // 注册组件
  registerComponent(type: string, component: React.ComponentType<any>): void {
    this.componentMap.set(type, component)
  }

  // 批量注册
  registerComponents(components: Record<string, React.ComponentType<any>>): void {
    Object.entries(components).forEach(([type, component]) => {
      this.registerComponent(type, component)
    })
  }

  // 核心转换方法
  convert(descriptor: RenderDescriptor): React.ReactElement {
    const Component = this.componentMap.get(descriptor.type)

    if (!Component) {
      throw new Error(`Component type "${descriptor.type}" not registered`)
    }

    const { children, ...props } = descriptor.props

    // 递归转换子元素
    const reactChildren = descriptor.children?.map(child =>
      this.convert(child)
    )

    return React.createElement(
      Component,
      { key: descriptor.key, ...props },
      children || reactChildren
    )
  }
}
```

#### 1.2 Component Registry (组件注册表)

```typescript
// src/core/registry.ts
export class ComponentRegistry {
  private static instance: ComponentRegistry
  private components = new Map<string, React.ComponentType<any>>()

  static getInstance(): ComponentRegistry {
    if (!ComponentRegistry.instance) {
      ComponentRegistry.instance = new ComponentRegistry()
    }
    return ComponentRegistry.instance
  }

  register(type: string, component: React.ComponentType<any>): void {
    this.components.set(type, component)
  }

  get(type: string): React.ComponentType<any> | undefined {
    return this.components.get(type)
  }

  // 预设组件注册
  registerPresets(preset: 'antd' | 'mui' | 'chakra'): void {
    switch(preset) {
      case 'antd':
        this.registerAntdComponents()
        break
      case 'mui':
        this.registerMuiComponents()
        break
      // ...
    }
  }

  private registerAntdComponents(): void {
    // 注册 Ant Design 组件映射
    this.register('button', require('antd').Button)
    this.register('input', require('antd').Input)
    this.register('form', require('antd').Form)
    this.register('table', require('antd').Table)
    // ...
  }
}
```

### 2. React Renderers (渲染器实现)

#### 2.1 渲染层级架构

```
┌──────────────────────────────────────────────────────────┐
│                   ViewLayer (视图层)                      │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐ │
│  │ ViewLoader  │→ │ ViewRegistry │→ │ ViewRender      │ │
│  │ (视图加载)   │  │ (视图注册表)  │  │ (视图渲染器)     │ │
│  └─────────────┘  └──────────────┘  └─────────────────┘ │
└──────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────┐
│                   GroupLayer (分组层)                     │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐ │
│  │ GroupLoader │→ │ GroupRegistry│→ │ GroupRender     │ │
│  │ (分组加载)   │  │ (分组注册表)  │  │ (分组渲染器)     │ │
│  └─────────────┘  └──────────────┘  └─────────────────┘ │
└──────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────┐
│                   FieldLayer (字段层)                     │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐ │
│  │ FieldLoader │→ │ FieldRegistry│→ │ FieldRender     │ │
│  │ (字段加载)   │  │ (字段注册表)  │  │ (字段渲染器)     │ │
│  └─────────────┘  └──────────────┘  └─────────────────┘ │
└──────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────┐
│              DataLayer & ActionLayer (数据和动作层)       │
│  ┌─────────────────────────────────────────────────────┐│
│  │                   DataLayer                         ││
│  │ ┌─────────────┐  ┌──────────────┐ ┌──────────────┐ ││
│  │ │ DataLoader  │→ │ DataRegistry │→│ DataRender   │ ││
│  │ └─────────────┘  └──────────────┘ └──────────────┘ ││
│  └─────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────┐│
│  │                  ActionLayer                        ││
│  │ ┌─────────────┐  ┌──────────────┐ ┌──────────────┐ ││
│  │ │ActionLoader │→ │ActionRegistry│→│ ActionRender │ ││
│  │ └─────────────┘  └──────────────┘ └──────────────┘ ││
│  └─────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────┘

每一层的工作流程：
1. Loader: 根据配置类型查找对应的渲染器
2. Registry: 存储和管理渲染器映射关系
3. Render: 执行具体的渲染逻辑

渲染器类型示例：
• ViewRender: list, table, object, form, kanban, calendar, grid
• GroupRender: card, collapse, tab, section, accordion
• FieldRender: horizontal, vertical, inline, grid
• DataRender: string, number, date, boolean, select, relation, file, image, json
• ActionRender: button, link, menu, dropdown, fab, toolbar
```

#### 2.2 通用 Loader 和 Registry 基础架构

```typescript
// src/loaders/BaseLoader.ts
export interface LoaderConfig {
  cache?: boolean
  lazyLoad?: boolean
  loadingComponent?: React.ComponentType
  errorComponent?: React.ComponentType<{ error: Error }>
}

export abstract class BaseLoader<T, R> {
  protected cache = new Map<string, R>()
  protected config: LoaderConfig

  constructor(config: LoaderConfig = {}) {
    this.config = {
      cache: true,
      lazyLoad: false,
      loadingComponent: () => <div>Loading...</div>,
      errorComponent: ({ error }) => <div>Error: {error.message}</div>,
      ...config
    }
  }

  abstract load(definition: T, context: any): Promise<R> | R

  clearCache(key?: string): void {
    if (key) {
      this.cache.delete(key)
    } else {
      this.cache.clear()
    }
  }
}

// src/registry/BaseRegistry.ts
export abstract class BaseRegistry<T> {
  protected renderers = new Map<string, T>()

  register(type: string, renderer: T): void {
    this.renderers.set(type, renderer)
  }

  get(type: string): T | undefined {
    return this.renderers.get(type)
  }

  has(type: string): boolean {
    return this.renderers.has(type)
  }

  getTypes(): string[] {
    return Array.from(this.renderers.keys())
  }

  unregister(type: string): boolean {
    return this.renderers.delete(type)
  }
}
```

#### 2.3 ViewLayer (视图层)

```typescript
// src/view/ViewRegistry.ts
export interface IViewRender {
  type: string
  render(view: ViewDefinition, data: any, context: RenderContext): React.ReactElement
}

export class ViewRegistry extends BaseRegistry<IViewRender> {
  private static instance: ViewRegistry

  static getInstance(): ViewRegistry {
    if (!ViewRegistry.instance) {
      ViewRegistry.instance = new ViewRegistry()
    }
    return ViewRegistry.instance
  }

  // 注册内置视图渲染器
  registerBuiltins(): void {
    this.register('list', new ListViewRender())
    this.register('table', new TableViewRender())
    this.register('object', new ObjectViewRender())
    this.register('form', new FormViewRender())
    this.register('kanban', new KanbanViewRender())
    this.register('calendar', new CalendarViewRender())
    this.register('grid', new GridViewRender())
  }
}

// src/view/ViewLoader.ts
export class ViewLoader extends BaseLoader<ViewDefinition, React.ReactElement> {
  private registry: ViewRegistry

  constructor(config: LoaderConfig = {}) {
    super(config)
    this.registry = ViewRegistry.getInstance()
  }

  load(
    view: ViewDefinition,
    data: any,
    context: RenderContext
  ): React.ReactElement {
    const cacheKey = `${view.type}:${JSON.stringify(view)}`

    // 检查缓存
    if (this.config.cache && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!
    }

    // 获取视图渲染器
    const renderer = this.registry.get(view.type)
    if (!renderer) {
      throw new Error(`View renderer for type "${view.type}" not found`)
    }

    // 创建组件并传递给下一层 (GroupLoader)
    const element = renderer.render(view, data, {
      ...context,
      groupLoader: new GroupLoader()
    })

    // 缓存
    if (this.config.cache) {
      this.cache.set(cacheKey, element)
    }

    return element
  }
}

// 具体的视图渲染器实现
export class ListViewRender implements IViewRender {
  type = 'list'

  render(
    view: ViewDefinition,
    data: any[],
    context: RenderContext
  ): React.ReactElement {
    const { fields = [], groupBy, sortBy, filters } = view

    // 数据处理
    let processedData = this.processData(data, { groupBy, sortBy, filters })

    // 如果有分组配置，使用 GroupLoader 处理
    if (view.groups && view.groups.length > 0) {
      return (
        <div className="list-view grouped">
          {view.groups.map((group, index) =>
            context.groupLoader.load(group, processedData, context)
          )}
        </div>
      )
    }

    // 普通列表，直接使用 FieldLoader 渲染字段
    return (
      <div className="list-view">
        {processedData.map((record, index) => (
          <div key={record.id || index} className="list-item">
            {fields.map(fieldName =>
              context.fieldLoader.load(fieldName, record[fieldName], record, context)
            )}
          </div>
        ))}
      </div>
    )
  }

  private processData(data: any[], options: any): any[] {
    // 实现数据处理逻辑（过滤、排序、分组）
    return data
  }
}

export class TableViewRender implements IViewRender {
  type = 'table'

  render(
    view: ViewDefinition,
    data: any[],
    context: RenderContext
  ): React.ReactElement {
    const columns = this.buildColumns(view, context)

    return (
      <table className="table-view">
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key}>{col.title}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((record, index) => (
            <tr key={record.id || index}>
              {columns.map(col => (
                <td key={col.key}>
                  {context.fieldLoader.load(col.dataIndex, record[col.dataIndex], record, context)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    )
  }

  private buildColumns(view: ViewDefinition, context: RenderContext) {
    const fields = view.fields || []
    return fields.map(fieldName => {
      const field = context.model.fields[fieldName]
      return {
        title: field.label || fieldName,
        dataIndex: fieldName,
        key: fieldName
      }
    })
  }
}

export class ObjectViewRender implements IViewRender {
  type = 'object'

  render(
    view: ViewDefinition,
    data: any,
    context: RenderContext
  ): React.ReactElement {
    const { fields = [], layout = 'vertical', groups } = view

    // 如果有分组配置
    if (groups && groups.length > 0) {
      return (
        <div className="object-view grouped">
          {groups.map((group, index) =>
            context.groupLoader.load(group, data, context)
          )}
        </div>
      )
    }

    // 渲染普通对象视图
    return (
      <div className={`object-view layout-${layout}`}>
        {fields.map(fieldName =>
          context.fieldLoader.load(fieldName, data[fieldName], data, {
            ...context,
            mode: 'view'
          })
        )}
      </div>
    )
  }
}

export class FormViewRender implements IViewRender {
  type = 'form'

  render(
    view: ViewDefinition,
    data: any,
    context: RenderContext
  ): React.ReactElement {
    const { fields = [], layout = 'vertical', groups } = view

    // 如果有分组配置
    if (groups && groups.length > 0) {
      return (
        <form className="form-view grouped">
          {groups.map((group, index) =>
            context.groupLoader.load(group, data, context)
          )}
        </form>
      )
    }

    // 渲染普通表单
    return (
      <form className={`form-view layout-${layout}`}>
        {fields.map(fieldName =>
          context.fieldLoader.load(fieldName, data[fieldName], data, {
            ...context,
            mode: 'edit'
          })
        )}
      </form>
    )
  }
}
```

#### 2.4 GroupLayer (分组层)

```typescript
// src/group/GroupRegistry.ts
export interface GroupDefinition {
  type: 'card' | 'collapse' | 'tab' | 'section' | 'accordion'
  name: string
  title: string
  fields: string[]
  collapsible?: boolean
  defaultExpanded?: boolean
  icon?: string
  description?: string
}

export interface IGroupRender {
  type: string
  render(group: GroupDefinition, data: any, context: RenderContext): React.ReactElement
}

export class GroupRegistry extends BaseRegistry<IGroupRender> {
  private static instance: GroupRegistry

  static getInstance(): GroupRegistry {
    if (!GroupRegistry.instance) {
      GroupRegistry.instance = new GroupRegistry()
    }
    return GroupRegistry.instance
  }

  registerBuiltins(): void {
    this.register('card', new CardGroupRender())
    this.register('collapse', new CollapseGroupRender())
    this.register('tab', new TabGroupRender())
    this.register('section', new SectionGroupRender())
    this.register('accordion', new AccordionGroupRender())
  }
}

// src/group/GroupLoader.ts
export class GroupLoader extends BaseLoader<GroupDefinition, React.ReactElement> {
  private registry: GroupRegistry

  constructor(config: LoaderConfig = {}) {
    super(config)
    this.registry = GroupRegistry.getInstance()
  }

  load(
    group: GroupDefinition,
    data: any,
    context: RenderContext
  ): React.ReactElement {
    const cacheKey = `${group.type}:${group.name}`

    if (this.config.cache && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!
    }

    const renderer = this.registry.get(group.type)
    if (!renderer) {
      throw new Error(`Group renderer for type "${group.type}" not found`)
    }

    // 创建组件并传递 FieldLoader 给下一层
    const element = renderer.render(group, data, {
      ...context,
      fieldLoader: new FieldLoader()
    })

    if (this.config.cache) {
      this.cache.set(cacheKey, element)
    }

    return element
  }
}

// 具体的分组渲染器实现
export class CardGroupRender implements IGroupRender {
  type = 'card'

  render(
    group: GroupDefinition,
    data: any,
    context: RenderContext
  ): React.ReactElement {
    return (
      <div className="group-card">
        <div className="group-card-header">
          {group.icon && <span className="group-icon">{group.icon}</span>}
          <h3>{group.title}</h3>
          {group.description && (
            <p className="group-description">{group.description}</p>
          )}
        </div>
        <div className="group-card-body">
          {group.fields.map(fieldName =>
            context.fieldLoader.load(fieldName, data[fieldName], data, context)
          )}
        </div>
      </div>
    )
  }
}

export class CollapseGroupRender implements IGroupRender {
  type = 'collapse'

  render(
    group: GroupDefinition,
    data: any,
    context: RenderContext
  ): React.ReactElement {
    const [expanded, setExpanded] = useState(group.defaultExpanded ?? true)

    return (
      <div className={`group-collapse ${expanded ? 'expanded' : ''}`}>
        <div
          className="group-collapse-header"
          onClick={() => group.collapsible && setExpanded(!expanded)}
        >
          <span className="collapse-icon">{expanded ? '▼' : '▶'}</span>
          {group.icon && <span className="group-icon">{group.icon}</span>}
          <h3>{group.title}</h3>
        </div>
        {expanded && (
          <div className="group-collapse-body">
            {group.fields.map(fieldName =>
              context.fieldLoader.load(fieldName, data[fieldName], data, context)
            )}
          </div>
        )}
      </div>
    )
  }
}

export class SectionGroupRender implements IGroupRender {
  type = 'section'

  render(
    group: GroupDefinition,
    data: any,
    context: RenderContext
  ): React.ReactElement {
    return (
      <div className="group-section">
        <h3 className="group-section-title">
          {group.icon && <span className="group-icon">{group.icon}</span>}
          {group.title}
        </h3>
        {group.description && (
          <p className="group-description">{group.description}</p>
        )}
        <div className="group-section-content">
          {group.fields.map(fieldName =>
            context.fieldLoader.load(fieldName, data[fieldName], data, context)
          )}
        </div>
      </div>
    )
  }
}
```

#### 2.5 FieldLayer (字段层)

```typescript
// src/field/FieldRegistry.ts
export interface FieldDefinition {
  name: string
  type: string
  label?: string
  required?: boolean
  tooltip?: string
  helpText?: string
  layout?: 'horizontal' | 'vertical' | 'inline'
  validate?: (value: any) => string | null
  [key: string]: any
}

export interface IFieldRender {
  type: string
  render(
    fieldName: string,
    value: any,
    record: any,
    context: RenderContext & { mode?: 'view' | 'edit' }
  ): React.ReactElement
}

export class FieldRegistry extends BaseRegistry<IFieldRender> {
  private static instance: FieldRegistry

  static getInstance(): FieldRegistry {
    if (!FieldRegistry.instance) {
      FieldRegistry.instance = new FieldRegistry()
    }
    return FieldRegistry.instance
  }

  registerBuiltins(): void {
    this.register('horizontal', new HorizontalFieldRender())
    this.register('vertical', new VerticalFieldRender())
    this.register('inline', new InlineFieldRender())
    this.register('grid', new GridFieldRender())
  }
}

// src/field/FieldLoader.ts
export class FieldLoader extends BaseLoader<string, React.ReactElement> {
  private registry: FieldRegistry

  constructor(config: LoaderConfig = {}) {
    super(config)
    this.registry = FieldRegistry.getInstance()
  }

  load(
    fieldName: string,
    value: any,
    record: any,
    context: RenderContext & { mode?: 'view' | 'edit' }
  ): React.ReactElement {
    const field = context.model.fields[fieldName]
    if (!field) {
      console.warn(`Field "${fieldName}" not found in model`)
      return <div>Field not found: {fieldName}</div>
    }

    const cacheKey = `${fieldName}:${field.layout || 'vertical'}:${context.mode || 'view'}`

    if (this.config.cache && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!
    }

    // 根据字段的 layout 配置选择渲染器
    const layoutType = field.layout || 'vertical'
    const renderer = this.registry.get(layoutType)

    if (!renderer) {
      throw new Error(`Field renderer for layout "${layoutType}" not found`)
    }

    // 创建组件并传递 DataLoader/ActionLoader 给下一层
    const element = renderer.render(fieldName, value, record, {
      ...context,
      dataLoader: new DataLoader(),
      actionLoader: new ActionLoader()
    })

    if (this.config.cache) {
      this.cache.set(cacheKey, element)
    }

    return element
  }
}

// 具体的字段渲染器实现
export class VerticalFieldRender implements IFieldRender {
  type = 'vertical'

  render(
    fieldName: string,
    value: any,
    record: any,
    context: RenderContext & { mode?: 'view' | 'edit' }
  ): React.ReactElement {
    const field = context.model.fields[fieldName]
    const mode = context.mode || 'view'

    // 字段级验证
    const validation = mode === 'edit' ? this.validateField(value, field) : null

    return (
      <div className={`field-container layout-vertical mode-${mode}`}>
        {/* 字段标签 */}
        {field.label && (
          <label className="field-label">
            {field.label}
            {field.required && <span className="required-mark">*</span>}
            {field.tooltip && (
              <span className="field-tooltip" title={field.tooltip}>ⓘ</span>
            )}
          </label>
        )}

        {/* 字段内容 */}
        <div className="field-content">
          {context.dataLoader.load(field, value, record, context)}

          {/* 验证错误 */}
          {validation && validation.error && (
            <div className="field-error">{validation.message}</div>
          )}

          {/* 帮助文本 */}
          {field.helpText && (
            <div className="field-help">{field.helpText}</div>
          )}
        </div>

        {/* 字段级动作 */}
        {field.actions && (
          <div className="field-actions">
            {field.actions.map((action: any) =>
              context.actionLoader.load(action, context)
            )}
          </div>
        )}
      </div>
    )
  }

  private validateField(value: any, field: FieldDefinition): any {
    const errors = []

    // 必填验证
    if (field.required && !value) {
      errors.push(`${field.label || field.name} is required`)
    }

    // 自定义验证
    if (field.validate) {
      const customError = field.validate(value)
      if (customError) {
        errors.push(customError)
      }
    }

    return errors.length > 0
      ? { error: true, message: errors[0] }
      : null
  }
}

export class HorizontalFieldRender implements IFieldRender {
  type = 'horizontal'

  render(
    fieldName: string,
    value: any,
    record: any,
    context: RenderContext & { mode?: 'view' | 'edit' }
  ): React.ReactElement {
    const field = context.model.fields[fieldName]
    const mode = context.mode || 'view'

    return (
      <div className={`field-container layout-horizontal mode-${mode}`}>
        <div className="field-left">
          {field.label && (
            <label className="field-label">
              {field.label}
              {field.required && <span className="required-mark">*</span>}
            </label>
          )}
        </div>
        <div className="field-right">
          <div className="field-content">
            {context.dataLoader.load(field, value, record, context)}
          </div>
          {field.helpText && (
            <div className="field-help">{field.helpText}</div>
          )}
        </div>
      </div>
    )
  }
}

export class InlineFieldRender implements IFieldRender {
  type = 'inline'

  render(
    fieldName: string,
    value: any,
    record: any,
    context: RenderContext & { mode?: 'view' | 'edit' }
  ): React.ReactElement {
    const field = context.model.fields[fieldName]

    return (
      <span className="field-container layout-inline">
        {field.label && <span className="field-label">{field.label}: </span>}
        <span className="field-content">
          {context.dataLoader.load(field, value, record, context)}
        </span>
      </span>
    )
  }
}
```

#### 2.6 DataLayer (数据层)

```typescript
// src/data/DataRegistry.ts
export interface IDataRender {
  type: string
  render(value: any, field: FieldDefinition, context: RenderContext): React.ReactElement
  renderEdit(value: any, field: FieldDefinition, context: RenderContext): React.ReactElement
  format?(value: any, field: FieldDefinition): string
}

export class DataRegistry extends BaseRegistry<IDataRender> {
  private static instance: DataRegistry

  static getInstance(): DataRegistry {
    if (!DataRegistry.instance) {
      DataRegistry.instance = new DataRegistry()
    }
    return DataRegistry.instance
  }

  registerBuiltins(): void {
    this.register('string', new StringDataRender())
    this.register('number', new NumberDataRender())
    this.register('date', new DateDataRender())
    this.register('boolean', new BooleanDataRender())
    this.register('select', new SelectDataRender())
    this.register('relation', new RelationDataRender())
    this.register('file', new FileDataRender())
    this.register('image', new ImageDataRender())
    this.register('json', new JsonDataRender())
  }
}

// src/data/DataLoader.ts
export class DataLoader extends BaseLoader<FieldDefinition, React.ReactElement> {
  private registry: DataRegistry

  constructor(config: LoaderConfig = {}) {
    super(config)
    this.registry = DataRegistry.getInstance()
  }

  load(
    field: FieldDefinition,
    value: any,
    record: any,
    context: RenderContext & { mode?: 'view' | 'edit' }
  ): React.ReactElement {
    const cacheKey = `${field.type}:${field.name}:${context.mode || 'view'}`

    if (this.config.cache && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!
    }

    const renderer = this.registry.get(field.type)
    if (!renderer) {
      throw new Error(`Data renderer for type "${field.type}" not found`)
    }

    const mode = context.mode || 'view'
    const element = mode === 'edit'
      ? renderer.renderEdit(value, field, context)
      : renderer.render(value, field, context)

    if (this.config.cache) {
      this.cache.set(cacheKey, element)
    }

    return element
  }
}

// 简化的数据渲染器示例（完整版本见之前的设计）
export class StringDataRender implements IDataRender {
  type = 'string'

  render(value: any, field: FieldDefinition, context: RenderContext): React.ReactElement {
    const formatted = this.format(value, field)
    return <span className="string-value">{formatted}</span>
  }

  renderEdit(value: any, field: FieldDefinition, context: RenderContext): React.ReactElement {
    return (
      <input
        type="text"
        value={value || ''}
        onChange={(e) => context.onChange?.(field.name, e.target.value)}
        placeholder={field.placeholder}
      />
    )
  }

  format(value: any, field: FieldDefinition): string {
    return String(value || '')
  }
}
```

#### 2.7 ActionLayer (动作层)

```typescript
// src/action/ActionRegistry.ts
export interface ActionDefinition {
  type: 'button' | 'link' | 'menu' | 'dropdown' | 'fab' | 'toolbar'
  name: string
  label?: string
  icon?: string
  primary?: boolean
  danger?: boolean
  disabled?: boolean
  tooltip?: string
  handler?: (context: RenderContext) => void | Promise<void>
  children?: ActionDefinition[]
}

export interface IActionRender {
  type: string
  render(action: ActionDefinition, context: RenderContext): React.ReactElement
}

export class ActionRegistry extends BaseRegistry<IActionRender> {
  private static instance: ActionRegistry

  static getInstance(): ActionRegistry {
    if (!ActionRegistry.instance) {
      ActionRegistry.instance = new ActionRegistry()
    }
    return ActionRegistry.instance
  }

  registerBuiltins(): void {
    this.register('button', new ButtonActionRender())
    this.register('link', new LinkActionRender())
    this.register('menu', new MenuActionRender())
    this.register('dropdown', new DropdownActionRender())
    this.register('fab', new FabActionRender())
    this.register('toolbar', new ToolbarActionRender())
  }
}

// src/action/ActionLoader.ts
export class ActionLoader extends BaseLoader<ActionDefinition, React.ReactElement> {
  private registry: ActionRegistry

  constructor(config: LoaderConfig = {}) {
    super(config)
    this.registry = ActionRegistry.getInstance()
  }

  load(
    action: ActionDefinition,
    context: RenderContext
  ): React.ReactElement {
    const cacheKey = `${action.type}:${action.name}`

    if (this.config.cache && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!
    }

    const renderer = this.registry.get(action.type)
    if (!renderer) {
      throw new Error(`Action renderer for type "${action.type}" not found`)
    }

    const element = renderer.render(action, context)

    if (this.config.cache) {
      this.cache.set(cacheKey, element)
    }

    return element
  }
}

// 具体的动作渲染器实现
export class ButtonActionRender implements IActionRender {
  type = 'button'

  render(action: ActionDefinition, context: RenderContext): React.ReactElement {
    const handleClick = async () => {
      if (action.handler) {
        try {
          await action.handler(context)
        } catch (error) {
          console.error(`Action "${action.name}" failed:`, error)
          context.message?.error(`${action.label}失败: ${error.message}`)
        }
      }
    }

    return (
      <button
        className={`action-button ${action.primary ? 'primary' : ''} ${action.danger ? 'danger' : ''}`}
        onClick={handleClick}
        disabled={action.disabled}
        title={action.tooltip}
      >
        {action.icon && <span className="action-icon">{action.icon}</span>}
        {action.label}
      </button>
    )
  }
}

export class LinkActionRender implements IActionRender {
  type = 'link'

  render(action: ActionDefinition, context: RenderContext): React.ReactElement {
    const handleClick = async (e: React.MouseEvent) => {
      e.preventDefault()
      if (action.handler) {
        await action.handler(context)
      }
    }

    return (
      <a
        href="#"
        className={`action-link ${action.danger ? 'danger' : ''}`}
        onClick={handleClick}
        title={action.tooltip}
      >
        {action.icon && <span className="action-icon">{action.icon}</span>}
        {action.label}
      </a>
    )
  }
}

export class MenuActionRender implements IActionRender {
  type = 'menu'

  render(action: ActionDefinition, context: RenderContext): React.ReactElement {
    return (
      <div className="action-menu">
        {action.children?.map(child => (
          <div key={child.name} className="menu-item">
            {context.actionLoader.load(child, context)}
          </div>
        ))}
      </div>
    )
  }
}

export class DropdownActionRender implements IActionRender {
  type = 'dropdown'

  render(action: ActionDefinition, context: RenderContext): React.ReactElement {
    const [open, setOpen] = useState(false)

    return (
      <div className="action-dropdown">
        <button
          className="dropdown-trigger"
          onClick={() => setOpen(!open)}
        >
          {action.icon && <span className="action-icon">{action.icon}</span>}
          {action.label}
          <span className="dropdown-arrow">▼</span>
        </button>
        {open && (
          <div className="dropdown-menu">
            {action.children?.map(child => (
              <div key={child.name} className="dropdown-item">
                {context.actionLoader.load(child, context)}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }
}

export class FabActionRender implements IActionRender {
  type = 'fab'

  render(action: ActionDefinition, context: RenderContext): React.ReactElement {
    const handleClick = async () => {
      if (action.handler) {
        await action.handler(context)
      }
    }

    return (
      <button
        className={`action-fab ${action.primary ? 'primary' : ''}`}
        onClick={handleClick}
        title={action.tooltip}
      >
        {action.icon && <span className="fab-icon">{action.icon}</span>}
      </button>
    )
  }
}

export class ToolbarActionRender implements IActionRender {
  type = 'toolbar'

  render(action: ActionDefinition, context: RenderContext): React.ReactElement {
    return (
      <div className="action-toolbar">
        {action.children?.map(child => (
          <div key={child.name} className="toolbar-item">
            {context.actionLoader.load(child, context)}
          </div>
        ))}
      </div>
    )
  }
}
```

### 3. 完整的 RenderContext 扩展

```typescript
// src/context/ExtendedRenderContext.ts
export interface ExtendedRenderContext extends RenderContext {
  // Loader 实例
  viewLoader: ViewLoader
  groupLoader: GroupLoader
  fieldLoader: FieldLoader
  dataLoader: DataLoader
  actionLoader: ActionLoader

  // 渲染模式
  mode?: 'view' | 'edit'

  // 布局配置
  layout?: 'horizontal' | 'vertical' | 'inline' | 'grid'

  // 数据变更回调
  onChange?: (fieldName: string, value: any) => void

  // 表单提交回调
  onSubmit?: (values: any) => void

  // 记录点击回调
  onRecordClick?: (record: any) => void
}

// 创建扩展上下文的工厂函数
export function createExtendedContext(
  baseContext: RenderContext,
  loaderConfig: LoaderConfig = {}
): ExtendedRenderContext {
  return {
    ...baseContext,
    viewLoader: new ViewLoader(loaderConfig),
    groupLoader: new GroupLoader(loaderConfig),
    fieldLoader: new FieldLoader(loaderConfig),
    dataLoader: new DataLoader(loaderConfig),
    actionLoader: new ActionLoader(loaderConfig)
  }
}
```

### 4. React UI Controllers (UI 控制器)

```typescript
// src/controllers/UIControllers.tsx
import React from 'react'
import { Modal, Drawer, message } from 'antd'
import {
  IModalController,
  IDrawerController,
  IMessageController,
  ModalConfig,
  DrawerConfig
} from '@schema-component/engine'

// Modal 控制器实现
export class AntdModalController implements IModalController {
  open(config: ModalConfig): void {
    const modal = Modal.confirm({
      title: config.title,
      content: config.content,
      width: config.width,
      footer: config.footer,
      onOk: config.onOk,
      onCancel: config.onCancel
    })
  }

  close(): void {
    Modal.destroyAll()
  }
}

// Drawer 控制器实现
export class AntdDrawerController implements IDrawerController {
  private drawerInstance: any = null

  open(config: DrawerConfig): void {
    // 使用 React 18 的 createRoot API
    const container = document.createElement('div')
    document.body.appendChild(container)

    const root = ReactDOM.createRoot(container)

    root.render(
      <Drawer
        title={config.title}
        width={config.width}
        placement={config.placement}
        open={true}
        onClose={() => {
          config.onClose?.()
          this.close()
        }}
      >
        {config.content}
      </Drawer>
    )

    this.drawerInstance = { root, container }
  }

  close(): void {
    if (this.drawerInstance) {
      this.drawerInstance.root.unmount()
      document.body.removeChild(this.drawerInstance.container)
      this.drawerInstance = null
    }
  }
}

// Message 控制器实现
export class AntdMessageController implements IMessageController {
  success(msg: string): void {
    message.success(msg)
  }

  error(msg: string): void {
    message.error(msg)
  }

  warning(msg: string): void {
    message.warning(msg)
  }

  info(msg: string): void {
    message.info(msg)
  }

  loading(msg: string): () => void {
    const hide = message.loading(msg, 0)
    return hide
  }
}
```

### 5. State Integration (状态集成)

#### 5.1 Context Provider

```typescript
// src/context/EngineContext.tsx
import React, { createContext, useContext } from 'react'
import { RenderEngine } from '@schema-component/engine'
import { ReactConverter } from '../core/converter'
import { ComponentRegistry } from '../core/registry'

export interface EngineContextValue {
  engine: RenderEngine
  converter: ReactConverter
  registry: ComponentRegistry
}

const EngineContext = createContext<EngineContextValue | null>(null)

export interface EngineProviderProps {
  engine: RenderEngine
  preset?: 'antd' | 'mui' | 'chakra'
  children: React.ReactNode
}

export const EngineProvider: React.FC<EngineProviderProps> = ({
  engine,
  preset = 'antd',
  children
}) => {
  const registry = ComponentRegistry.getInstance()
  registry.registerPresets(preset)

  const converter = new ReactConverter({
    componentMap: registry.components
  })

  // 注册 UI 控制器到引擎上下文
  const uiControllers = {
    modal: new AntdModalController(),
    drawer: new AntdDrawerController(),
    message: new AntdMessageController()
  }

  const value = {
    engine,
    converter,
    registry
  }

  return (
    <EngineContext.Provider value={value}>
      {children}
    </EngineContext.Provider>
  )
}

export const useEngine = () => {
  const context = useContext(EngineContext)
  if (!context) {
    throw new Error('useEngine must be used within EngineProvider')
  }
  return context
}
```

#### 5.2 Hooks

```typescript
// src/hooks/index.ts
import { useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { IModel, ViewDefinition } from '@schema-component/engine'
import { useEngine } from '../context/EngineContext'

// 使用 Model 的 Hook
export const useModel = (modelName: string) => {
  const { engine } = useEngine()
  const [model, setModel] = useState<IModel | null>(null)

  useEffect(() => {
    const model = engine.getModel(modelName)
    setModel(model)
  }, [modelName, engine])

  return model
}

// 使用 View 的 Hook
export const useView = (modelName: string, viewName: string) => {
  const { engine, converter } = useEngine()
  const model = useModel(modelName)
  const [element, setElement] = useState<React.ReactElement | null>(null)

  useEffect(() => {
    if (!model) return

    const view = model.views[viewName]
    if (!view) return

    const context = engine.createContext({
      modelName,
      model,
      // 添加 UI 控制器
      modal: new AntdModalController(),
      drawer: new AntdDrawerController(),
      message: new AntdMessageController()
    })

    // 获取数据
    const data = model.repository.getAll()

    // 渲染视图
    const descriptor = engine.renderView(view, data, context)
    const reactElement = converter.convert(descriptor)

    setElement(reactElement)
  }, [model, viewName, engine, converter])

  return element
}

// 创建响应式组件
export const createObserverComponent = observer
```

#### 5.3 高阶组件

```typescript
// src/hoc/withEngine.tsx
import React from 'react'
import { observer } from 'mobx-react-lite'
import { useEngine } from '../context/EngineContext'

export interface WithEngineProps {
  engine: RenderEngine
  converter: ReactConverter
}

export function withEngine<P extends object>(
  Component: React.ComponentType<P & WithEngineProps>
): React.ComponentType<P> {
  const WithEngineComponent: React.FC<P> = (props) => {
    const { engine, converter } = useEngine()

    return <Component {...props} engine={engine} converter={converter} />
  }

  return observer(WithEngineComponent)
}
```

### 6. Render Component (渲染组件)

```typescript
// src/components/RenderComponent.tsx
import React from 'react'
import { observer } from 'mobx-react-lite'
import { RenderDescriptor } from '@schema-component/engine'
import { useEngine } from '../context/EngineContext'

export interface RenderComponentProps {
  descriptor: RenderDescriptor
  context?: any
}

export const RenderComponent: React.FC<RenderComponentProps> = observer(({
  descriptor,
  context
}) => {
  const { converter } = useEngine()

  // 转换为 React 元素
  const element = React.useMemo(() => {
    return converter.convert(descriptor)
  }, [descriptor, converter])

  return element
})

// 便捷的 Model 渲染组件
export interface ModelRenderProps {
  modelName: string
  viewName: string
  data?: any
}

export const ModelRender: React.FC<ModelRenderProps> = observer(({
  modelName,
  viewName,
  data
}) => {
  const { engine, converter } = useEngine()

  const element = React.useMemo(() => {
    const model = engine.getModel(modelName)
    if (!model) return null

    const view = model.views[viewName]
    if (!view) return null

    const context = engine.createContext({
      modelName,
      model
    })

    const descriptor = engine.renderView(view, data, context)
    return converter.convert(descriptor)
  }, [modelName, viewName, data, engine, converter])

  return element || <div>Loading...</div>
})
```

## 使用示例

### 1. 初始化配置

```typescript
// app.tsx
import React from 'react'
import { RenderEngine } from '@schema-component/engine'
import { EngineProvider } from '@schema-component/react-connector'
import { ConfigProvider } from 'antd'

const engine = RenderEngine.getInstance()

// 注册渲染器
engine.registerDataRenderer(new TextDataRenderer())
engine.registerDataRenderer(new DateDataRenderer())
engine.registerViewRenderer(new ListViewRenderer())
engine.registerViewRenderer(new FormViewRenderer())
engine.registerActionRenderer('button', new ButtonActionRenderer())

export const App: React.FC = () => {
  return (
    <ConfigProvider>
      <EngineProvider engine={engine} preset="antd">
        <AppContent />
      </EngineProvider>
    </ConfigProvider>
  )
}
```

### 2. 使用 Hooks

```tsx
// UserList.tsx
import React from 'react'
import { useView } from '@schema-component/react-connector'

export const UserList: React.FC = () => {
  const userListView = useView('User', 'list')

  return (
    <div>
      <h1>用户列表</h1>
      {userListView}
    </div>
  )
}
```

### 3. 使用渲染组件

```tsx
// Dashboard.tsx
import React from 'react'
import { ModelRender } from '@schema-component/react-connector'

export const Dashboard: React.FC = () => {
  return (
    <div>
      <ModelRender modelName="User" viewName="list" />
      <ModelRender modelName="Order" viewName="kanban" />
    </div>
  )
}
```

### 4. 自定义组件注册

```typescript
// CustomComponents.tsx
import { ComponentRegistry } from '@schema-component/react-connector'

// 自定义组件
const CustomCard: React.FC<any> = ({ title, children }) => (
  <div className="custom-card">
    <h3>{title}</h3>
    <div>{children}</div>
  </div>
)

// 注册到组件表
const registry = ComponentRegistry.getInstance()
registry.register('custom-card', CustomCard)
```

## 项目结构

```
packages/react-connector/
├── src/
│   ├── core/                    # 核心转换器
│   │   ├── converter.tsx        # RenderDescriptor 转换
│   │   ├── registry.ts          # 组件注册表
│   │   └── index.ts
│   ├── renderers/               # 渲染器实现
│   │   ├── DataRenderer.tsx    # 数据渲染器
│   │   ├── ViewRenderer.tsx    # 视图渲染器
│   │   ├── ActionRenderer.tsx  # 动作渲染器
│   │   └── index.ts
│   ├── controllers/            # UI 控制器
│   │   ├── UIControllers.tsx
│   │   └── index.ts
│   ├── context/               # React Context
│   │   ├── EngineContext.tsx
│   │   └── index.ts
│   ├── hooks/                # React Hooks
│   │   ├── useEngine.ts
│   │   ├── useModel.ts
│   │   ├── useView.ts
│   │   └── index.ts
│   ├── hoc/                 # 高阶组件
│   │   ├── withEngine.tsx
│   │   └── index.ts
│   ├── components/          # React 组件
│   │   ├── RenderComponent.tsx
│   │   ├── ModelRender.tsx
│   │   └── index.ts
│   ├── presets/            # 预设配置
│   │   ├── antd/
│   │   ├── mui/
│   │   └── index.ts
│   └── index.ts
├── tests/                  # 测试文件
├── examples/              # 示例代码
├── package.json
├── tsconfig.json
└── README.md
```

## 技术栈

- **React 18+**: 使用最新的 React 特性
- **MobX 6+**: 响应式状态管理
- **mobx-react-lite**: MobX-React 集成
- **TypeScript**: 完整类型支持
- **Ant Design** (可选): UI 组件库预设

## 优势

1. **框架解耦**: Engine 层完全不依赖 React，可以轻松切换到 Vue 或其他框架
2. **类型安全**: 完整的 TypeScript 支持，开发时有完善的类型提示
3. **高性能**: 利用 React 18 的并发特性和 MobX 的细粒度响应式更新
4. **易于扩展**: 支持自定义组件和渲染器的注册
5. **开发友好**: 提供 Hooks、HOC 等多种使用方式

## 后续扩展

1. **Vue Connector**: 基于相同架构实现 Vue 版本
2. **Solid Connector**: 支持 SolidJS
3. **Svelte Connector**: 支持 Svelte
4. **Flutter Connector**: 支持跨平台移动开发

## 总结

通过 `react-connector` 包，我们实现了：

1. Engine 层与 React 的完全解耦
2. 灵活的组件映射和注册机制
3. 完善的状态管理集成
4. 友好的开发体验

这种设计让整个系统具有极高的灵活性，可以轻松切换或同时支持多个前端框架。
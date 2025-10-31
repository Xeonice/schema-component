# Render 层完整设计文档

## 架构概览

```
┌─────────────────────────────────────────────────────────────┐
│                    Render Layer                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ DataRenderer │  │ ViewRenderer │  │ActionRenderer│     │
│  │              │  │              │  │              │     │
│  │ 字段级渲染   │  │ 视图级渲染   │  │ 动作渲染     │     │
│  │ 基于Schema   │  │ 基于ViewType │  │ + 状态管理   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                        │                    │
│                                        ├─ ViewStack        │
│                                        └─ ActionQueue      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 设计原则

1. **职责分离**
   - DataRenderer：负责单个字段的渲染（基于 Schema 字段类型）
   - ViewRenderer：负责整个视图的渲染（基于 View 类型）
   - ActionRenderer：负责动作的渲染 + 专属状态管理（ViewStack & ActionQueue）

2. **类型驱动**
   - DataRenderer 根据 Schema 字段类型自动选择渲染器
   - ViewRenderer 根据 View 类型选择渲染器
   - ActionRenderer 根据 Action 类型（server/view）选择处理逻辑

3. **框架无关**
   - Engine 层只定义接口和提供状态管理
   - 具体实现由框架层（React/Vue）提供

---

## 第一部分：DataRenderer（字段级渲染）

### 设计原则

**基于 Schema 字段类型**进行渲染，每种字段类型对应一个专门的渲染器。

### 支持的字段类型

基于 `@schema-component/schema` 的类型系统：

#### 基础类型
- `string` → StringRenderer
- `number` → NumberRenderer
- `boolean` → BooleanRenderer
- `date` → DateRenderer
- `enum` → EnumRenderer
- `json` → JsonRenderer
- `array` → ArrayRenderer

#### 关系类型
- `belongsTo` → BelongsToRenderer
- `hasMany` → HasManyRenderer
- `manyToMany` → ManyToManyRenderer

### 接口定义

```typescript
/**
 * 字段定义
 */
export interface FieldDefinition {
  type: string        // 字段类型
  name: string        // 字段名称
  label?: string      // 显示标签
  required?: boolean  // 是否必填
  format?: string     // 显示格式
  [key: string]: any  // 扩展属性
}

/**
 * DataRenderer 接口
 */
export interface IDataRenderer {
  /** 支持的字段类型 */
  type: string

  /** 渲染字段（展示模式） */
  render(value: any, field: FieldDefinition, context: RenderContext): RenderDescriptor

  /** 渲染字段（编辑模式） */
  renderEdit?(value: any, field: FieldDefinition, context: RenderContext): RenderDescriptor

  /** 格式化显示值 */
  format?(value: any, field: FieldDefinition): string
}

/**
 * 渲染描述符（框架无关）
 */
export interface RenderDescriptor {
  type: string                      // 组件类型
  props: Record<string, any>        // 组件属性
  children?: RenderDescriptor[]     // 子元素
  key?: string | number             // 唯一标识
}
```

### 实现示例

#### StringRenderer

```typescript
export class StringRenderer implements IDataRenderer {
  type = 'string'

  render(value: string, field: FieldDefinition, context: RenderContext): RenderDescriptor {
    const format = field.format || 'text'

    switch (format) {
      case 'email':
        return { type: 'Link', props: { href: `mailto:${value}`, text: value } }
      case 'url':
        return { type: 'Link', props: { href: value, text: value, target: '_blank' } }
      case 'phone':
        return { type: 'Link', props: { href: `tel:${value}`, text: value } }
      default:
        return { type: 'Text', props: { value } }
    }
  }

  renderEdit(value: string, field: FieldDefinition, context: RenderContext): RenderDescriptor {
    const format = field.format || 'text'

    switch (format) {
      case 'textarea':
        return {
          type: 'TextArea',
          props: { value, placeholder: field.placeholder, rows: field.rows || 4 }
        }
      default:
        return {
          type: 'Input',
          props: {
            value,
            type: format,
            placeholder: field.placeholder,
            maxLength: field.maxLength
          }
        }
    }
  }
}
```

#### NumberRenderer、BooleanRenderer、DateRenderer 等

参考 `RENDER_DESIGN.md` 中的完整实现。

### DataRenderer 注册

```typescript
export class DataRendererRegistry {
  private renderers: Map<string, IDataRenderer> = new Map()

  register(renderer: IDataRenderer): void {
    this.renderers.set(renderer.type, renderer)
  }

  get(type: string): IDataRenderer | undefined {
    return this.renderers.get(type)
  }

  render(
    value: any,
    field: FieldDefinition,
    context: RenderContext,
    mode: 'view' | 'edit' = 'view'
  ): RenderDescriptor {
    const renderer = this.get(field.type)
    if (!renderer) {
      throw new Error(`No renderer found for type "${field.type}"`)
    }

    if (mode === 'edit' && renderer.renderEdit) {
      return renderer.renderEdit(value, field, context)
    }

    return renderer.render(value, field, context)
  }
}
```

---

## 第二部分：ViewRenderer（视图级渲染）

### 设计原则

**基于 View 类型**渲染整个视图布局，负责组织多个字段的展示。

### 支持的视图类型

- `list` → ListRenderer (Table/Grid/Cards)
- `form` → FormRenderer
- `detail` → DetailRenderer
- `kanban` → KanbanRenderer
- `calendar` → CalendarRenderer
- `custom` → 自定义渲染器

### 接口定义

```typescript
/**
 * View 定义
 */
export interface ViewDefinition {
  type: ViewType
  title?: string
  fields?: string[]                 // 要显示的字段
  layout?: string                   // 布局方式
  columns?: ColumnDefinition[]      // 列定义（list view）
  actions?: ActionDefinition[]      // 视图级操作
  [key: string]: any
}

export type ViewType = 'list' | 'form' | 'detail' | 'kanban' | 'calendar' | string

/**
 * ViewRenderer 接口
 */
export interface IViewRenderer {
  /** 支持的视图类型 */
  type: ViewType

  /** 渲染视图 */
  render(view: ViewDefinition, data: any, context: RenderContext): RenderDescriptor
}
```

### 实现示例

#### ListRenderer

```typescript
export class ListRenderer implements IViewRenderer {
  type: ViewType = 'list'

  render(view: ViewDefinition, data: any, context: RenderContext): RenderDescriptor {
    const layout = view.layout || 'table'

    switch (layout) {
      case 'table':
        return this.renderTable(view, data, context)
      case 'grid':
        return this.renderGrid(view, data, context)
      default:
        return this.renderTable(view, data, context)
    }
  }

  private renderTable(view: ViewDefinition, data: any, context: RenderContext): RenderDescriptor {
    return {
      type: 'Table',
      props: {
        columns: view.columns,
        dataSource: data,
        pagination: view.pagination,
        toolbar: {
          title: view.title,
          actions: view.actions  // 由 ActionRenderer 渲染
        }
      }
    }
  }
}
```

#### FormRenderer、DetailRenderer 等

参考 `RENDER_DESIGN.md` 中的完整实现。

### ViewRenderer 注册

```typescript
export class ViewRendererRegistry {
  private renderers: Map<ViewType, IViewRenderer> = new Map()

  register(renderer: IViewRenderer): void {
    this.renderers.set(renderer.type, renderer)
  }

  get(type: ViewType): IViewRenderer | undefined {
    return this.renderers.get(type)
  }

  render(view: ViewDefinition, data: any, context: RenderContext): RenderDescriptor {
    const renderer = this.get(view.type)
    if (!renderer) {
      throw new Error(`No renderer found for view type "${view.type}"`)
    }

    return renderer.render(view, data, context)
  }
}
```

---

## 第三部分：ActionRenderer（动作渲染 + 状态管理）

### 设计原则

1. **Action 分类**：ServerAction（服务端操作）和 ViewAction（视图操作）
2. **专属状态管理**：ViewStack（视图栈）和 ActionQueue（操作队列）
3. **渲染灵活**：支持多种渲染模式（button、menu、dropdown、toolbar 等）

### 3.1 Action 类型定义

```typescript
/**
 * Action 类型
 */
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
}

/**
 * ServerAction 定义（调用 Model Actions）
 */
export interface ServerActionDefinition extends BaseActionDefinition {
  type: 'server'

  /** 参数获取函数 */
  getParams?: (context: RenderContext) => any

  /** 确认提示 */
  confirm?: string | {
    title: string
    description?: string
  }

  /** 成功回调 */
  onSuccess?: (result: any, context: RenderContext) => void

  /** 失败回调 */
  onError?: (error: Error, context: RenderContext) => void

  /** 成功提示消息 */
  successMessage?: string | ((result: any) => string)

  /** 失败提示消息 */
  errorMessage?: string | ((error: Error) => string)
}

/**
 * ViewAction 定义（纯前端操作）
 */
export interface ViewActionDefinition extends BaseActionDefinition {
  type: 'view'

  /** 处理函数（纯前端逻辑） */
  handler: (context: RenderContext) => void | Promise<void>
}

export type ActionDefinition = ServerActionDefinition | ViewActionDefinition
```

### 3.2 ViewStack（视图栈管理）

**职责**：管理视图导航历史，支持前进/后退。

```typescript
/**
 * 视图栈项
 */
export interface ViewStackItem {
  id: string
  type: ViewType
  definition: ViewDefinition
  data?: any
  params?: Record<string, any>
  timestamp: number
}

/**
 * ViewStack 接口
 */
export interface IViewStack {
  /** 当前视图 */
  readonly current: ViewStackItem | null

  /** 视图历史 */
  readonly history: ViewStackItem[]

  /** 是否可以后退 */
  readonly canGoBack: boolean

  /** 是否可以前进 */
  readonly canGoForward: boolean

  /** 压入新视图 */
  push(view: ViewDefinition, data?: any, params?: Record<string, any>): void

  /** 替换当前视图 */
  replace(view: ViewDefinition, data?: any, params?: Record<string, any>): void

  /** 后退 */
  goBack(): ViewStackItem | null

  /** 前进 */
  goForward(): ViewStackItem | null

  /** 跳转到指定索引 */
  goTo(index: number): ViewStackItem | null

  /** 清空栈 */
  clear(): void

  /** 订阅变化 */
  subscribe(listener: (current: ViewStackItem | null) => void): () => void
}

/**
 * ViewStack 实现（基于 MobX）
 */
export class ViewStack implements IViewStack {
  @observable
  private stack: ViewStackItem[] = []

  @observable
  private currentIndex: number = -1

  @computed
  get current(): ViewStackItem | null {
    return this.currentIndex >= 0 ? this.stack[this.currentIndex] : null
  }

  @computed
  get history(): ViewStackItem[] {
    return this.stack.slice(0, this.currentIndex + 1)
  }

  @computed
  get canGoBack(): boolean {
    return this.currentIndex > 0
  }

  @computed
  get canGoForward(): boolean {
    return this.currentIndex < this.stack.length - 1
  }

  // ... 实现方法（参考 RENDER_ARCHITECTURE.md）
}
```

### 3.3 ActionQueue（操作队列管理）

**职责**：管理 ServerAction 的执行队列，支持并发控制、重试、取消等。

```typescript
/**
 * Action 执行状态
 */
export type ActionStatus = 'pending' | 'running' | 'success' | 'failed' | 'cancelled'

/**
 * Action 任务
 */
export interface ActionTask {
  id: string
  action: ServerActionDefinition
  params: any
  context: RenderContext
  status: ActionStatus
  error?: Error
  result?: any
  createdAt: number
  startedAt?: number
  completedAt?: number
  retryCount: number
  maxRetries: number
}

/**
 * ActionQueue 接口
 */
export interface IActionQueue {
  /** 待执行任务 */
  readonly pending: ActionTask[]

  /** 执行中任务 */
  readonly running: ActionTask[]

  /** 已完成任务 */
  readonly completed: ActionTask[]

  /** 失败任务 */
  readonly failed: ActionTask[]

  /** 添加任务 */
  enqueue(
    action: ServerActionDefinition,
    params: any,
    context: RenderContext,
    options?: { maxRetries?: number }
  ): string

  /** 取消任务 */
  cancel(taskId: string): boolean

  /** 重试任务 */
  retry(taskId: string): boolean

  /** 订阅任务状态变化 */
  subscribe(taskId: string, listener: (task: ActionTask) => void): () => void

  /** 订阅队列变化 */
  subscribeQueue(listener: (queue: IActionQueue) => void): () => void
}

/**
 * ActionQueue 配置
 */
export interface ActionQueueConfig {
  /** 最大并发数 */
  concurrency?: number

  /** 默认重试次数 */
  defaultMaxRetries?: number

  /** 任务超时时间（毫秒） */
  timeout?: number
}

/**
 * ActionQueue 实现（基于 MobX）
 */
export class ActionQueue implements IActionQueue {
  @observable
  private tasks: Map<string, ActionTask> = new Map()

  @observable
  private runningCount: number = 0

  private config: Required<ActionQueueConfig>

  constructor(config: ActionQueueConfig = {}) {
    this.config = {
      concurrency: config.concurrency || 3,
      defaultMaxRetries: config.defaultMaxRetries || 0,
      timeout: config.timeout || 30000
    }

    makeObservable(this)
  }

  // ... 实现方法（参考 RENDER_ARCHITECTURE.md）
}
```

### 3.4 ActionRenderer 接口

```typescript
/**
 * ActionRenderer 接口
 */
export interface IActionRenderer {
  /** 渲染模式 */
  renderMode: 'button' | 'menu' | 'dropdown' | 'toolbar'

  /** 渲染 ServerAction */
  renderServer?(action: ServerActionDefinition, context: RenderContext): RenderDescriptor

  /** 渲染 ViewAction */
  renderView?(action: ViewActionDefinition, context: RenderContext): RenderDescriptor
}
```

---

## 第四部分：RenderEngine（统一管理）

### 设计原则

1. **单例模式**：全局唯一的 RenderEngine 实例
2. **注册表管理**：统一管理所有 Renderer
3. **状态提供**：提供 ViewStack 和 ActionQueue
4. **上下文创建**：创建统一的 RenderContext

### RenderEngine 实现

```typescript
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
 * RenderEngine 配置
 */
export interface RenderEngineConfig {
  viewStack?: IViewStack
  actionQueue?: IActionQueue
  actionQueueConfig?: ActionQueueConfig
}

/**
 * RenderEngine（单例）
 */
export class RenderEngine {
  private static instance: RenderEngine

  // Renderer 注册表
  private dataRenderers: DataRendererRegistry
  private viewRenderers: ViewRendererRegistry
  private actionRenderers: Map<string, IActionRenderer> = new Map()

  // 状态管理（Action 专属）
  public readonly viewStack: IViewStack
  public readonly actionQueue: IActionQueue

  private constructor(config: RenderEngineConfig = {}) {
    this.dataRenderers = new DataRendererRegistry()
    this.viewRenderers = new ViewRendererRegistry()
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

  // ============================================================================
  // Renderer 注册
  // ============================================================================

  registerDataRenderer(renderer: IDataRenderer): void {
    this.dataRenderers.register(renderer)
  }

  registerViewRenderer(renderer: IViewRenderer): void {
    this.viewRenderers.register(renderer)
  }

  registerActionRenderer(name: string, renderer: IActionRenderer): void {
    this.actionRenderers.set(name, renderer)
  }

  // ============================================================================
  // 渲染方法
  // ============================================================================

  renderData(
    value: any,
    field: FieldDefinition,
    context: RenderContext,
    mode: 'view' | 'edit' = 'view'
  ): RenderDescriptor {
    return this.dataRenderers.render(value, field, context, mode)
  }

  renderView(view: ViewDefinition, data: any, context: RenderContext): RenderDescriptor {
    return this.viewRenderers.render(view, data, context)
  }

  renderAction(
    action: ActionDefinition,
    context: RenderContext
  ): RenderDescriptor {
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

  // ============================================================================
  // 辅助方法
  // ============================================================================

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
```

---

## 第五部分：使用示例

### 5.1 初始化 RenderEngine

```typescript
// 应用启动时初始化
const engine = RenderEngine.getInstance({
  actionQueueConfig: {
    concurrency: 3,        // 最大并发 3 个 ServerAction
    defaultMaxRetries: 1,  // 失败后重试 1 次
    timeout: 30000         // 30 秒超时
  }
})

// 注册 DataRenderers
engine.registerDataRenderer(new StringRenderer())
engine.registerDataRenderer(new NumberRenderer())
engine.registerDataRenderer(new BooleanRenderer())
// ... 更多

// 注册 ViewRenderers
engine.registerViewRenderer(new ListRenderer())
engine.registerViewRenderer(new FormRenderer())
engine.registerViewRenderer(new DetailRenderer())
// ... 更多

// 注册 ActionRenderers（由框架层实现）
engine.registerActionRenderer('button', new ReactButtonRenderer())
engine.registerActionRenderer('dropdown', new ReactDropdownRenderer())
// ... 更多
```

### 5.2 使用 DataRenderer

```typescript
const field: FieldDefinition = {
  type: 'string',
  name: 'email',
  label: 'Email',
  format: 'email'
}

const context = engine.createContext({
  modelName: 'User',
  model: UserModel
})

// 渲染字段（展示模式）
const descriptor = engine.renderData('user@example.com', field, context, 'view')
// 输出: { type: 'Link', props: { href: 'mailto:user@example.com', text: 'user@example.com' } }

// 渲染字段（编辑模式）
const editDescriptor = engine.renderData('user@example.com', field, context, 'edit')
// 输出: { type: 'Input', props: { value: 'user@example.com', type: 'email' } }
```

### 5.3 使用 ViewRenderer

```typescript
const listView: ViewDefinition = {
  type: 'list',
  title: 'Users',
  columns: [
    { field: 'name', label: 'Name' },
    { field: 'email', label: 'Email' },
    { field: 'status', label: 'Status' }
  ]
}

const descriptor = engine.renderView(listView, users, context)
// 输出: { type: 'Table', props: { dataSource: users, columns: [...] } }
```

### 5.4 使用 ActionRenderer + ViewStack

```typescript
// ViewAction: 打开创建表单
const createAction: ViewActionDefinition = {
  type: 'view',
  name: 'openCreateForm',
  label: 'Create User',
  buttonType: 'primary',
  handler: (context) => {
    // 使用 ViewStack 管理视图导航
    context.viewStack.push({
      type: 'form',
      title: 'Create User',
      fields: ['name', 'email', 'status']
    })
  }
}

// 渲染 Action
const descriptor = engine.renderAction(createAction, context)
// 输出: { type: 'Button', props: { type: 'primary', children: 'Create User', onClick: ... } }

// ViewStack 状态
console.log(engine.viewStack.current)  // 当前视图
console.log(engine.viewStack.canGoBack)  // 是否可以后退
```

### 5.5 使用 ActionRenderer + ActionQueue

```typescript
// ServerAction: 删除用户
const deleteAction: ServerActionDefinition = {
  type: 'server',
  name: 'delete',
  label: 'Delete User',
  danger: true,
  confirm: 'Are you sure to delete this user?',
  successMessage: 'User deleted successfully',
  getParams: (context) => ({ id: context.record.id })
}

// 渲染 Action
const descriptor = engine.renderAction(deleteAction, context)

// 执行 ServerAction（自动加入队列）
const taskId = await engine.executeServerAction(deleteAction, { id: 123 }, context)

// ActionQueue 状态
console.log(engine.actionQueue.pending.length)   // 待执行任务数
console.log(engine.actionQueue.running.length)   // 执行中任务数
console.log(engine.actionQueue.completed.length) // 已完成任务数

// 监听任务状态
engine.actionQueue.subscribe(taskId, (task) => {
  console.log(`Task ${task.id} status: ${task.status}`)
})
```

### 5.6 在 React 中使用

```typescript
import { observer } from 'mobx-react-lite'
import { RenderEngine } from '@schema-component/engine'

const App = observer(() => {
  const engine = RenderEngine.getInstance()
  const viewStack = engine.viewStack
  const actionQueue = engine.actionQueue

  return (
    <div>
      {/* 导航控制 */}
      <div>
        <button
          disabled={!viewStack.canGoBack}
          onClick={() => viewStack.goBack()}
        >
          Back
        </button>
        <button
          disabled={!viewStack.canGoForward}
          onClick={() => viewStack.goForward()}
        >
          Forward
        </button>
      </div>

      {/* 操作队列状态 */}
      <div>
        <p>Running Actions: {actionQueue.running.length}</p>
        <p>Pending Actions: {actionQueue.pending.length}</p>
      </div>

      {/* 当前视图 */}
      {viewStack.current && (
        <ViewRenderer view={viewStack.current.definition} />
      )}
    </div>
  )
})
```

---

## 总结

### 职责划分

| 组件 | 职责 | 状态管理 |
|-----|------|---------|
| **DataRenderer** | 字段级渲染（基于 Schema 类型） | ❌ 无 |
| **ViewRenderer** | 视图级渲染（基于 View 类型） | ❌ 无 |
| **ActionRenderer** | 动作渲染（server/view） | ✅ ViewStack + ActionQueue |

### 核心特性

1. **DataRenderer**
   - ✅ 基于 Schema 字段类型自动选择渲染器
   - ✅ 支持 9+ 种基础类型和关系类型
   - ✅ 支持 view/edit 双模式

2. **ViewRenderer**
   - ✅ 基于 View 类型渲染整个视图
   - ✅ 支持 list/form/detail/kanban/calendar 等
   - ✅ 集成 DataRenderer 渲染字段

3. **ActionRenderer**
   - ✅ 区分 ServerAction 和 ViewAction
   - ✅ ViewStack 管理视图导航（前进/后退）
   - ✅ ActionQueue 管理服务端操作（并发控制、重试、状态跟踪）
   - ✅ 支持多种渲染模式（button、menu、dropdown、toolbar）

### 架构优势

✅ **职责清晰** - 三大 Renderer 各司其职
✅ **类型驱动** - 基于 Schema/View 类型自动选择渲染器
✅ **状态集中** - ViewStack/ActionQueue 专属于 Action 管理
✅ **框架无关** - Engine 只定义接口，框架层实现
✅ **可扩展** - 易于添加新的 Renderer 和状态管理器

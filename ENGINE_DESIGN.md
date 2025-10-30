# @schema-component/engine 设计文档

## 概述

`@schema-component/engine` 是一个基于 DDD（领域驱动设计）原则的框架无关的数据引擎层，提供模型管理、状态管理、视图定义、动作编排和渲染注册等核心能力。本设计参考了 Odoo 的模型管理模式，支持声明式定义和灵活扩展。

## 设计原则

1. **领域驱动设计（DDD）**：清晰的分层架构，包括领域模型、仓储、服务等
2. **框架无关性**：不依赖任何前端框架（React、Vue 等），可在任何环境中使用
3. **观察者模式**：基于成熟的状态管理库实现响应式数据流
4. **依赖注入**：通过 IoC 容器管理依赖关系
5. **插件化架构**：支持通过插件扩展功能
6. **类型安全**：完整的 TypeScript 类型支持

## 技术选型

| 模块 | 技术选型 | 理由 |
|------|---------|------|
| 状态管理 | MobX | 框架无关，成熟的观察者模式实现，API 简洁 |
| 依赖注入 | InversifyJS | 成熟的 IoC 容器，装饰器支持，TypeScript 友好 |
| Schema 验证 | @schema-component/schema | 复用现有的 Schema 系统 |
| 事件系统 | EventEmitter3 | 轻量级，性能好，API 简单 |

## 架构设计

### 整体架构图

```
┌─────────────────────────────────────────────────────────────┐
│                        Application Layer                     │
│                    (外部应用：React/Vue/等)                   │
└─────────────────────────────────────────────────────────────┘
                              ▲
                              │
┌─────────────────────────────┼─────────────────────────────────┐
│                             │                                  │
│                    @schema-component/engine                   │
│                                                                │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Render Registry (渲染管理器)             │   │
│  │  • DataRender 注册/反注册                             │   │
│  │  • ViewRender 注册/反注册                             │   │
│  │  • Context 注入扩展                                   │   │
│  └──────────────────────────────────────────────────────┘   │
│                             ▲                                 │
│  ┌──────────────┬───────────┼────────────┬─────────────┐    │
│  │              │            │            │             │    │
│  │   Model      │   View     │   Action   │   State     │    │
│  │   (模型层)   │  (视图层)  │  (动作层)  │  (状态层)   │    │
│  │              │            │            │             │    │
│  └──────┬───────┴────────────┴────────────┴──────┬──────┘    │
│         │                                         │           │
│  ┌──────▼────────┐                     ┌──────────▼──────┐   │
│  │  Repository   │                     │   Event Bus     │   │
│  │  (数据访问层) │                     │   (事件总线)    │   │
│  └──────┬────────┘                     └─────────────────┘   │
│         │                                                     │
│  ┌──────▼────────────────────────────────────────────────┐   │
│  │            Context & DI Container (依赖注入)          │   │
│  └──────┬────────────────────────────────────────────────┘   │
│         │                                                     │
└─────────┼─────────────────────────────────────────────────────┘
          │
          │ (通过 DI 注入)
          │
┌─────────▼─────────────────────────────────────────────────────┐
│              Data Access Layer (数据访问层 IoC)               │
│                                                                │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────┐   │
│  │  HTTP Client   │  │  GraphQL (待)  │  │ WebSocket(待)│   │
│  │   (第一版)     │  │   (未来支持)   │  │  (未来支持)  │   │
│  └────────────────┘  └────────────────┘  └──────────────┘   │
│                                                                │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────┐   │
│  │    gRPC (待)   │  │   MQTT (待)    │  │  其他协议... │   │
│  │   (未来支持)   │  │   (未来支持)   │  │  (可扩展)    │   │
│  └────────────────┘  └────────────────┘  └──────────────┘   │
│                                                                │
│           ▲ 统一接口：IDataAccessClient                       │
└───────────┼────────────────────────────────────────────────────┘
            ▼
  ┌─────────────────────┐
  │   External Data     │
  │  (外部数据源)       │
  └─────────────────────┘
```

### 核心分层

#### 1. Model 层（领域模型）

基于 DDD 的领域模型设计，类似 Odoo 的模型定义方式。

```typescript
// 核心接口
interface IModel {
  // 模型元数据
  readonly modelName: string
  readonly schema: SchemaDefinition

  // 数据访问
  create(data: any): Promise<any>
  read(id: string | number): Promise<any>
  update(id: string | number, data: any): Promise<any>
  delete(id: string | number): Promise<boolean>
  search(criteria: any): Promise<any[]>

  // 生命周期钩子
  beforeCreate?(data: any): Promise<any>
  afterCreate?(record: any): Promise<void>
  beforeUpdate?(id: string | number, data: any): Promise<any>
  afterUpdate?(record: any): Promise<void>
  beforeDelete?(id: string | number): Promise<boolean>
  afterDelete?(id: string | number): Promise<void>
}

// BaseModel 实现
class BaseModel implements IModel {
  // 由 Repository 注入
  protected repository: IRepository

  // 模型注册表
  private static registry: Map<string, typeof BaseModel> = new Map()

  // 装饰器：定义模型
  static defineModel(name: string, schema: SchemaDefinition) {
    // 注册模型到全局注册表
  }
}

// 使用示例
@Model('User')
class UserModel extends BaseModel {
  // 定义 Schema
  static schema = defineSchema({
    name: 'User',
    fields: {
      id: field.uuid({ required: true }),
      email: field.email({ required: true }),
      name: field.string({ required: true })
    }
  })

  // 自定义业务方法
  async activate() {
    return this.update(this.id, { isActive: true })
  }

  // 生命周期钩子
  async beforeCreate(data: any) {
    // 数据验证、转换等
    return data
  }
}
```

#### 2. Repository 层（数据访问）

负责协调数据访问，通过 Data Access Layer 与外部数据源对接。

```typescript
interface IRepository {
  // 基础 CRUD
  getList(params: GetListParams): Promise<GetListResult>
  getOne(id: string | number): Promise<any>
  createOne(data: any): Promise<any>
  updateOne(id: string | number, data: any): Promise<any>
  deleteOne(id: string | number): Promise<boolean>

  // 批量操作
  getMany(ids: Array<string | number>): Promise<any[]>
  createMany(data: any[]): Promise<any[]>
  updateMany(ids: Array<string | number>, data: any): Promise<any[]>
  deleteMany(ids: Array<string | number>): Promise<boolean>

  // 查询
  search(criteria: SearchCriteria): Promise<SearchResult>
}

// 参数接口
interface GetListParams {
  pagination?: { page: number; pageSize: number }
  sort?: { field: string; order: 'ASC' | 'DESC' }[]
  filter?: Record<string, any>
}

interface GetListResult {
  data: any[]
  total: number
  page?: number
  pageSize?: number
}

// Repository 实现
class Repository implements IRepository {
  constructor(
    private modelName: string,
    private dataAccessClient: IDataAccessClient,
    private cache?: ICache
  ) {}

  async getList(params: GetListParams): Promise<GetListResult> {
    // 1. 检查缓存
    const cacheKey = this.buildCacheKey('list', params)
    const cached = await this.cache?.get(cacheKey)
    if (cached) return cached

    // 2. 通过 Data Access Client 获取数据
    const result = await this.dataAccessClient.getList(this.modelName, params)

    // 3. 转换数据格式（如果需要）
    const transformed = this.transformListResult(result)

    // 4. 更新缓存
    await this.cache?.set(cacheKey, transformed)

    // 5. 返回结果
    return transformed
  }

  async getOne(id: string | number): Promise<any> {
    const cacheKey = this.buildCacheKey('one', id)
    const cached = await this.cache?.get(cacheKey)
    if (cached) return cached

    const result = await this.dataAccessClient.getOne(this.modelName, id)
    await this.cache?.set(cacheKey, result)

    return result
  }

  async createOne(data: any): Promise<any> {
    const result = await this.dataAccessClient.createOne(this.modelName, data)

    // 清除相关缓存
    await this.cache?.invalidate(`${this.modelName}:list:*`)

    return result
  }

  async updateOne(id: string | number, data: any): Promise<any> {
    const result = await this.dataAccessClient.updateOne(this.modelName, id, data)

    // 清除相关缓存
    await this.cache?.delete(this.buildCacheKey('one', id))
    await this.cache?.invalidate(`${this.modelName}:list:*`)

    return result
  }

  async deleteOne(id: string | number): Promise<boolean> {
    const result = await this.dataAccessClient.deleteOne(this.modelName, id)

    // 清除相关缓存
    await this.cache?.delete(this.buildCacheKey('one', id))
    await this.cache?.invalidate(`${this.modelName}:list:*`)

    return result
  }

  private buildCacheKey(operation: string, params: any): string {
    return `${this.modelName}:${operation}:${JSON.stringify(params)}`
  }

  private transformListResult(result: any): GetListResult {
    // 实现数据转换逻辑
    return result
  }

  // ... 其他方法实现
}
```

#### 3. Service 层（业务服务）

编排 Model 和 Repository，处理复杂业务逻辑。

```typescript
interface IService {
  execute(action: string, params: any): Promise<any>
}

class ModelService implements IService {
  constructor(
    private model: IModel,
    private eventBus: EventEmitter3
  ) {}

  async execute(action: string, params: any): Promise<any> {
    // 1. 触发 before 事件
    // 2. 执行动作
    // 3. 触发 after 事件
    // 4. 返回结果
  }
}
```

#### 4. View 层（视图定义）

定义视图类型、配置和元数据。

```typescript
// 视图类型枚举
enum ViewType {
  LIST = 'list',
  FORM = 'form',
  KANBAN = 'kanban',
  CALENDAR = 'calendar',
  GANTT = 'gantt',
  PIVOT = 'pivot',
  GRAPH = 'graph',
  CUSTOM = 'custom'
}

// 视图定义接口
interface IViewDefinition {
  id: string
  type: ViewType
  modelName: string
  title?: string
  fields?: string[] // 显示的字段
  config?: Record<string, any> // 视图特定配置
}

// 列表视图配置
interface ListViewConfig {
  columns: Array<{
    field: string
    label: string
    width?: number
    sortable?: boolean
    filterable?: boolean
    render?: string // 自定义渲染器名称
  }>
  actions?: Array<{
    name: string
    label: string
    type: 'button' | 'menu'
  }>
  bulkActions?: string[]
  defaultSort?: { field: string; order: 'ASC' | 'DESC' }
}

// 表单视图配置
interface FormViewConfig {
  layout: 'vertical' | 'horizontal' | 'grid'
  sections?: Array<{
    title?: string
    fields: string[]
  }>
  readonly?: boolean
}

// 视图注册表
class ViewRegistry {
  private views: Map<string, IViewDefinition> = new Map()

  register(view: IViewDefinition): void {
    this.views.set(view.id, view)
  }

  get(id: string): IViewDefinition | undefined {
    return this.views.get(id)
  }

  getByModel(modelName: string, type?: ViewType): IViewDefinition[] {
    return Array.from(this.views.values())
      .filter(v => v.modelName === modelName && (!type || v.type === type))
  }
}
```

#### 5. Action 层（动作定义）

定义用户操作和系统动作。

```typescript
// 动作类型
enum ActionType {
  WINDOW = 'window',      // 打开视图
  SERVER = 'server',      // 服务端动作
  CLIENT = 'client',      // 客户端动作
  REPORT = 'report',      // 报表
  URL = 'url'            // 跳转 URL
}

// 动作定义接口
interface IActionDefinition {
  id: string
  name: string
  type: ActionType
  modelName?: string
  config?: ActionConfig
}

// 窗口动作配置
interface WindowActionConfig {
  viewType: ViewType
  viewId?: string
  target?: 'current' | 'new' | 'modal'
  context?: Record<string, any>
  domain?: any[] // 过滤条件
}

// 服务端动作配置
interface ServerActionConfig {
  method: string
  params?: Record<string, any>
}

// Action Executor
class ActionExecutor {
  constructor(
    private viewRegistry: ViewRegistry,
    private modelRegistry: Map<string, IModel>,
    private eventBus: EventEmitter3
  ) {}

  async execute(action: IActionDefinition, context?: any): Promise<any> {
    // 1. 根据 action.type 分发
    // 2. 执行对应的动作处理器
    // 3. 返回结果
  }

  private async executeWindowAction(action: IActionDefinition, context?: any) {
    // 打开视图的逻辑
  }

  private async executeServerAction(action: IActionDefinition, context?: any) {
    // 调用服务端方法
  }
}
```

#### 6. State 层（状态管理）

基于 MobX 的响应式状态管理。

```typescript
import { makeObservable, observable, action, computed, reaction } from 'mobx'

// 模型状态
class ModelStore {
  // 数据存储
  @observable
  records: Map<string | number, any> = new Map()

  @observable
  loading: boolean = false

  @observable
  error: Error | null = null

  constructor(private model: IModel) {
    makeObservable(this)
  }

  // 加载数据
  @action
  async load(params: GetListParams) {
    this.loading = true
    this.error = null

    try {
      const result = await this.model.search(params)
      result.forEach(record => {
        this.records.set(record.id, record)
      })
    } catch (error) {
      this.error = error as Error
    } finally {
      this.loading = false
    }
  }

  // 获取单个记录
  @computed
  get(id: string | number) {
    return this.records.get(id)
  }

  // 获取所有记录
  @computed
  get all() {
    return Array.from(this.records.values())
  }

  // 创建记录
  @action
  async create(data: any) {
    const record = await this.model.create(data)
    this.records.set(record.id, record)
    return record
  }

  // 更新记录
  @action
  async update(id: string | number, data: any) {
    const record = await this.model.update(id, data)
    this.records.set(id, record)
    return record
  }

  // 删除记录
  @action
  async delete(id: string | number) {
    await this.model.delete(id)
    this.records.delete(id)
  }
}

// 视图状态
class ViewStore {
  @observable
  currentView: IViewDefinition | null = null

  @observable
  selectedRecords: Set<string | number> = new Set()

  @observable
  filters: Record<string, any> = {}

  @observable
  sort: { field: string; order: 'ASC' | 'DESC' } | null = null

  constructor() {
    makeObservable(this)
  }

  @action
  setView(view: IViewDefinition) {
    this.currentView = view
  }

  @action
  selectRecord(id: string | number) {
    this.selectedRecords.add(id)
  }

  @action
  deselectRecord(id: string | number) {
    this.selectedRecords.delete(id)
  }

  @action
  setFilter(field: string, value: any) {
    this.filters[field] = value
  }

  @action
  setSort(field: string, order: 'ASC' | 'DESC') {
    this.sort = { field, order }
  }
}

// 全局 Store
class RootStore {
  modelStores: Map<string, ModelStore> = new Map()
  viewStore: ViewStore = new ViewStore()

  getModelStore(modelName: string): ModelStore {
    if (!this.modelStores.has(modelName)) {
      // 创建新的 ModelStore
    }
    return this.modelStores.get(modelName)!
  }
}
```

#### 7. Render 层（渲染管理）

管理渲染器的注册和调用，不实现具体渲染逻辑。

```typescript
// 数据渲染器接口
interface IDataRenderer {
  name: string
  render(data: any, context?: RenderContext): any
}

// 视图渲染器接口
interface IViewRenderer {
  type: ViewType
  render(view: IViewDefinition, data: any, context?: RenderContext): any
}

// 渲染上下文
interface RenderContext {
  modelName: string
  viewType?: ViewType
  fieldName?: string
  record?: any
  params?: Record<string, any>
}

// 渲染注册表（单例）
class RenderRegistry {
  private static instance: RenderRegistry

  private dataRenderers: Map<string, IDataRenderer> = new Map()
  private viewRenderers: Map<ViewType, IViewRenderer> = new Map()
  private contextInjectors: Array<(context: RenderContext) => RenderContext> = []

  static getInstance(): RenderRegistry {
    if (!RenderRegistry.instance) {
      RenderRegistry.instance = new RenderRegistry()
    }
    return RenderRegistry.instance
  }

  // 注册数据渲染器
  registerDataRenderer(renderer: IDataRenderer): void {
    this.dataRenderers.set(renderer.name, renderer)
  }

  // 反注册数据渲染器
  unregisterDataRenderer(name: string): void {
    this.dataRenderers.delete(name)
  }

  // 注册视图渲染器
  registerViewRenderer(renderer: IViewRenderer): void {
    this.viewRenderers.set(renderer.type, renderer)
  }

  // 反注册视图渲染器
  unregisterViewRenderer(type: ViewType): void {
    this.viewRenderers.delete(type)
  }

  // 注册上下文注入器
  registerContextInjector(injector: (context: RenderContext) => RenderContext): void {
    this.contextInjectors.push(injector)
  }

  // 渲染数据
  renderData(rendererName: string, data: any, context: RenderContext): any {
    // 应用上下文注入器
    const enrichedContext = this.applyContextInjectors(context)

    const renderer = this.dataRenderers.get(rendererName)
    if (!renderer) {
      throw new Error(`Data renderer "${rendererName}" not found`)
    }

    return renderer.render(data, enrichedContext)
  }

  // 渲染视图
  renderView(view: IViewDefinition, data: any, context: RenderContext): any {
    // 应用上下文注入器
    const enrichedContext = this.applyContextInjectors(context)

    const renderer = this.viewRenderers.get(view.type)
    if (!renderer) {
      throw new Error(`View renderer for type "${view.type}" not found`)
    }

    return renderer.render(view, data, enrichedContext)
  }

  private applyContextInjectors(context: RenderContext): RenderContext {
    return this.contextInjectors.reduce(
      (ctx, injector) => injector(ctx),
      context
    )
  }
}
```

#### 8. Context & DI 层（依赖注入）

使用 InversifyJS 管理依赖关系。

```typescript
import { Container, injectable, inject } from 'inversify'

// 定义标识符
const TYPES = {
  Model: Symbol.for('Model'),
  Repository: Symbol.for('Repository'),
  Service: Symbol.for('Service'),
  ApiAdapter: Symbol.for('ApiAdapter'),
  EventBus: Symbol.for('EventBus'),
  RenderRegistry: Symbol.for('RenderRegistry'),
  Store: Symbol.for('Store')
}

// 创建容器
const container = new Container()

// 注册依赖
@injectable()
class UserRepository implements IRepository {
  constructor(
    @inject(TYPES.ApiAdapter) private apiAdapter: IApiAdapter
  ) {}

  // 实现 IRepository 接口
}

container.bind<IRepository>(TYPES.Repository).to(UserRepository)

// Engine Context
class EngineContext {
  constructor(
    public container: Container,
    public config: EngineConfig
  ) {}

  // 获取服务
  get<T>(identifier: symbol): T {
    return this.container.get<T>(identifier)
  }

  // 注册服务
  bind<T>(identifier: symbol, implementation: any): void {
    this.container.bind<T>(identifier).to(implementation)
  }
}
```

## 生命周期管理

### Model 生命周期

```typescript
// 创建流程
beforeCreate(data) -> validate(data) -> create(data) -> afterCreate(record)

// 更新流程
beforeUpdate(id, data) -> validate(data) -> update(id, data) -> afterUpdate(record)

// 删除流程
beforeDelete(id) -> delete(id) -> afterDelete(id)

// 查询流程
search(criteria) -> transform(results)
```

### 生命周期钩子

```typescript
interface ILifecycleHooks {
  // 创建钩子
  beforeCreate?(data: any): Promise<any>
  afterCreate?(record: any): Promise<void>

  // 读取钩子
  beforeRead?(id: string | number): Promise<void>
  afterRead?(record: any): Promise<any>

  // 更新钩子
  beforeUpdate?(id: string | number, data: any): Promise<any>
  afterUpdate?(record: any): Promise<void>

  // 删除钩子
  beforeDelete?(id: string | number): Promise<boolean>
  afterDelete?(id: string | number): Promise<void>

  // 搜索钩子
  beforeSearch?(criteria: any): Promise<any>
  afterSearch?(results: any[]): Promise<any[]>
}
```

## Data Access Layer（数据访问层 IoC）

数据访问层是一个独立的 IoC 层，负责与外部数据源的通信。第一版只支持 HTTP，但架构设计支持未来扩展其他协议。

### 核心接口设计

#### 统一数据访问客户端接口

```typescript
/**
 * 数据访问客户端统一接口
 * 所有数据访问实现（HTTP、GraphQL、WebSocket 等）都需要实现此接口
 */
interface IDataAccessClient {
  // 基础 CRUD
  getList(modelName: string, params: GetListParams): Promise<GetListResult>
  getOne(modelName: string, id: string | number): Promise<any>
  createOne(modelName: string, data: any): Promise<any>
  updateOne(modelName: string, id: string | number, data: any): Promise<any>
  deleteOne(modelName: string, id: string | number): Promise<boolean>

  // 批量操作
  getMany(modelName: string, ids: Array<string | number>): Promise<any[]>
  createMany(modelName: string, data: any[]): Promise<any[]>
  updateMany(modelName: string, ids: Array<string | number>, data: any): Promise<any[]>
  deleteMany(modelName: string, ids: Array<string | number>): Promise<boolean>

  // 自定义查询
  query(modelName: string, criteria: QueryCriteria): Promise<QueryResult>

  // 连接管理
  connect?(): Promise<void>
  disconnect?(): Promise<void>
  isConnected?(): boolean
}

// 查询条件
interface QueryCriteria {
  filter?: Record<string, any>
  sort?: Array<{ field: string; order: 'ASC' | 'DESC' }>
  pagination?: { page: number; pageSize: number }
  fields?: string[] // 选择返回的字段
  relations?: string[] // 关联查询
}

// 查询结果
interface QueryResult {
  data: any[]
  total: number
  hasMore?: boolean
  cursor?: string // 用于游标分页
}
```

### HTTP Client 实现（第一版）

#### HTTP 配置接口

```typescript
interface HttpClientConfig {
  baseURL: string
  timeout?: number
  headers?: Record<string, string>
  interceptors?: {
    request?: Array<(config: RequestConfig) => RequestConfig | Promise<RequestConfig>>
    response?: Array<(response: ApiResponse) => ApiResponse | Promise<ApiResponse>>
    error?: Array<(error: any) => any>
  }
}

interface RequestConfig {
  url?: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  params?: Record<string, any>
  data?: any
  headers?: Record<string, string>
  timeout?: number
}

interface ApiResponse<T = any> {
  data: T
  status: number
  statusText: string
  headers: Record<string, string>
}
```

#### HTTP 数据访问客户端实现

```typescript
import { injectable, inject } from 'inversify'

@injectable()
class HttpDataAccessClient implements IDataAccessClient {
  private httpClient: any // axios, fetch wrapper 等
  private urlMapper: IUrlMapper

  constructor(
    @inject(TYPES.HttpClient) httpClient: any,
    @inject(TYPES.UrlMapper) urlMapper: IUrlMapper,
    config: HttpClientConfig
  ) {
    this.httpClient = httpClient
    this.urlMapper = urlMapper
    this.setupInterceptors(config.interceptors)
  }

  async getList(modelName: string, params: GetListParams): Promise<GetListResult> {
    const url = this.urlMapper.mapGetList(modelName, params)
    const requestConfig = this.buildRequestConfig('GET', url, { params })

    const response = await this.httpClient.request(requestConfig)

    return this.transformListResponse(response.data)
  }

  async getOne(modelName: string, id: string | number): Promise<any> {
    const url = this.urlMapper.mapGetOne(modelName, id)
    const requestConfig = this.buildRequestConfig('GET', url)

    const response = await this.httpClient.request(requestConfig)

    return response.data
  }

  async createOne(modelName: string, data: any): Promise<any> {
    const url = this.urlMapper.mapCreateOne(modelName)
    const requestConfig = this.buildRequestConfig('POST', url, { data })

    const response = await this.httpClient.request(requestConfig)

    return response.data
  }

  async updateOne(modelName: string, id: string | number, data: any): Promise<any> {
    const url = this.urlMapper.mapUpdateOne(modelName, id)
    const requestConfig = this.buildRequestConfig('PUT', url, { data })

    const response = await this.httpClient.request(requestConfig)

    return response.data
  }

  async deleteOne(modelName: string, id: string | number): Promise<boolean> {
    const url = this.urlMapper.mapDeleteOne(modelName, id)
    const requestConfig = this.buildRequestConfig('DELETE', url)

    const response = await this.httpClient.request(requestConfig)

    return response.status >= 200 && response.status < 300
  }

  async getMany(modelName: string, ids: Array<string | number>): Promise<any[]> {
    const url = this.urlMapper.mapGetMany(modelName, ids)
    const requestConfig = this.buildRequestConfig('GET', url, {
      params: { ids: ids.join(',') }
    })

    const response = await this.httpClient.request(requestConfig)

    return response.data
  }

  async query(modelName: string, criteria: QueryCriteria): Promise<QueryResult> {
    const url = this.urlMapper.mapQuery(modelName)
    const requestConfig = this.buildRequestConfig('POST', url, {
      data: criteria
    })

    const response = await this.httpClient.request(requestConfig)

    return response.data
  }

  private buildRequestConfig(
    method: string,
    url: string,
    options?: { params?: any; data?: any }
  ): RequestConfig {
    return {
      method: method as any,
      url,
      params: options?.params,
      data: options?.data
    }
  }

  private transformListResponse(data: any): GetListResult {
    // 将后端响应转换为标准格式
    // 支持不同的后端 API 响应格式
    if (Array.isArray(data)) {
      return {
        data,
        total: data.length
      }
    }

    // 标准格式：{ data: [], total: number }
    if (data.data && Array.isArray(data.data)) {
      return {
        data: data.data,
        total: data.total || data.data.length,
        page: data.page,
        pageSize: data.pageSize
      }
    }

    // 其他格式
    return data
  }

  private setupInterceptors(interceptors?: HttpClientConfig['interceptors']): void {
    if (!interceptors) return

    // 请求拦截器
    interceptors.request?.forEach(interceptor => {
      this.httpClient.interceptors.request.use(interceptor)
    })

    // 响应拦截器
    interceptors.response?.forEach(interceptor => {
      this.httpClient.interceptors.response.use(interceptor)
    })

    // 错误拦截器
    interceptors.error?.forEach(interceptor => {
      this.httpClient.interceptors.response.use(undefined, interceptor)
    })
  }
}
```

#### URL 映射器

```typescript
/**
 * URL 映射器接口
 * 负责将 Repository 操作映射为具体的 URL
 */
interface IUrlMapper {
  mapGetList(modelName: string, params: GetListParams): string
  mapGetOne(modelName: string, id: string | number): string
  mapGetMany(modelName: string, ids: Array<string | number>): string
  mapCreateOne(modelName: string): string
  mapUpdateOne(modelName: string, id: string | number): string
  mapDeleteOne(modelName: string, id: string | number): string
  mapQuery(modelName: string): string
}

/**
 * REST 风格的 URL 映射器
 */
class RestUrlMapper implements IUrlMapper {
  constructor(
    private baseURL: string = '/api',
    private options?: {
      pluralize?: boolean // 是否复数化模型名
      customRoutes?: Record<string, string> // 自定义路由映射
    }
  ) {}

  mapGetList(modelName: string, params: GetListParams): string {
    const resource = this.getResourceName(modelName)
    const queryString = this.buildQueryString(params)
    return `${this.baseURL}/${resource}${queryString}`
  }

  mapGetOne(modelName: string, id: string | number): string {
    const resource = this.getResourceName(modelName)
    return `${this.baseURL}/${resource}/${id}`
  }

  mapGetMany(modelName: string, ids: Array<string | number>): string {
    const resource = this.getResourceName(modelName)
    return `${this.baseURL}/${resource}`
  }

  mapCreateOne(modelName: string): string {
    const resource = this.getResourceName(modelName)
    return `${this.baseURL}/${resource}`
  }

  mapUpdateOne(modelName: string, id: string | number): string {
    const resource = this.getResourceName(modelName)
    return `${this.baseURL}/${resource}/${id}`
  }

  mapDeleteOne(modelName: string, id: string | number): string {
    const resource = this.getResourceName(modelName)
    return `${this.baseURL}/${resource}/${id}`
  }

  mapQuery(modelName: string): string {
    const resource = this.getResourceName(modelName)
    return `${this.baseURL}/${resource}/query`
  }

  private getResourceName(modelName: string): string {
    // 检查自定义路由
    if (this.options?.customRoutes?.[modelName]) {
      return this.options.customRoutes[modelName]
    }

    // 转换为小写
    let resource = modelName.toLowerCase()

    // 可选：复数化
    if (this.options?.pluralize) {
      resource = this.pluralize(resource)
    }

    return resource
  }

  private pluralize(word: string): string {
    // 简单的复数化规则
    if (word.endsWith('y')) {
      return word.slice(0, -1) + 'ies'
    }
    if (word.endsWith('s')) {
      return word + 'es'
    }
    return word + 's'
  }

  private buildQueryString(params: GetListParams): string {
    const queryParams: string[] = []

    // 分页
    if (params.pagination) {
      queryParams.push(`page=${params.pagination.page}`)
      queryParams.push(`pageSize=${params.pagination.pageSize}`)
    }

    // 排序
    if (params.sort && params.sort.length > 0) {
      const sortStr = params.sort
        .map(s => `${s.field}:${s.order}`)
        .join(',')
      queryParams.push(`sort=${sortStr}`)
    }

    // 过滤
    if (params.filter) {
      Object.entries(params.filter).forEach(([key, value]) => {
        queryParams.push(`${key}=${encodeURIComponent(value)}`)
      })
    }

    return queryParams.length > 0 ? `?${queryParams.join('&')}` : ''
  }
}
```

### 未来扩展示例

#### GraphQL Client（未来支持）

```typescript
class GraphQLDataAccessClient implements IDataAccessClient {
  constructor(
    private endpoint: string,
    private client: any // Apollo Client, urql 等
  ) {}

  async getList(modelName: string, params: GetListParams): Promise<GetListResult> {
    const query = this.buildListQuery(modelName, params)
    const result = await this.client.query({ query })
    return result.data
  }

  private buildListQuery(modelName: string, params: GetListParams): any {
    // 构建 GraphQL 查询
  }

  // 实现其他方法...
}
```

#### WebSocket Client（未来支持）

```typescript
class WebSocketDataAccessClient implements IDataAccessClient {
  constructor(
    private url: string,
    private ws: WebSocket
  ) {}

  async getOne(modelName: string, id: string | number): Promise<any> {
    return new Promise((resolve, reject) => {
      const requestId = this.generateRequestId()

      // 发送请求
      this.ws.send(JSON.stringify({
        id: requestId,
        type: 'getOne',
        modelName,
        params: { id }
      }))

      // 等待响应
      const handler = (event: MessageEvent) => {
        const response = JSON.parse(event.data)
        if (response.id === requestId) {
          this.ws.removeEventListener('message', handler)
          resolve(response.data)
        }
      }

      this.ws.addEventListener('message', handler)
    })
  }

  // 实现其他方法...
}
```

### DI 容器配置

```typescript
// 定义标识符
const TYPES = {
  DataAccessClient: Symbol.for('DataAccessClient'),
  HttpClient: Symbol.for('HttpClient'),
  UrlMapper: Symbol.for('UrlMapper'),
  // ... 其他标识符
}

// 配置 HTTP 客户端
container.bind(TYPES.HttpClient).toConstantValue(axios.create({
  baseURL: 'https://api.example.com',
  timeout: 10000
}))

// 配置 URL 映射器
container.bind<IUrlMapper>(TYPES.UrlMapper).toConstantValue(
  new RestUrlMapper('/api', {
    pluralize: true,
    customRoutes: {
      'User': 'users',
      'Post': 'posts'
    }
  })
)

// 配置数据访问客户端
container.bind<IDataAccessClient>(TYPES.DataAccessClient).to(HttpDataAccessClient)

// 未来切换为 GraphQL
// container.bind<IDataAccessClient>(TYPES.DataAccessClient).to(GraphQLDataAccessClient)
```

## 事件系统

### 事件类型

```typescript
enum EventType {
  // Model 事件
  MODEL_BEFORE_CREATE = 'model:before:create',
  MODEL_AFTER_CREATE = 'model:after:create',
  MODEL_BEFORE_UPDATE = 'model:before:update',
  MODEL_AFTER_UPDATE = 'model:after:update',
  MODEL_BEFORE_DELETE = 'model:before:delete',
  MODEL_AFTER_DELETE = 'model:after:delete',

  // View 事件
  VIEW_MOUNTED = 'view:mounted',
  VIEW_UNMOUNTED = 'view:unmounted',
  VIEW_UPDATED = 'view:updated',

  // Action 事件
  ACTION_EXECUTED = 'action:executed',
  ACTION_FAILED = 'action:failed',

  // State 事件
  STATE_CHANGED = 'state:changed',

  // Custom
  CUSTOM = 'custom'
}

interface IEvent {
  type: EventType | string
  payload: any
  timestamp: number
  source?: string
}
```

### 事件总线

```typescript
import EventEmitter from 'eventemitter3'

class EventBus extends EventEmitter {
  // 发布事件
  publish(event: IEvent): void {
    this.emit(event.type, event)
  }

  // 订阅事件
  subscribe(eventType: string, handler: (event: IEvent) => void): () => void {
    this.on(eventType, handler)

    // 返回取消订阅函数
    return () => this.off(eventType, handler)
  }

  // 订阅一次
  subscribeOnce(eventType: string, handler: (event: IEvent) => void): void {
    this.once(eventType, handler)
  }
}
```

## 使用示例

### 1. 定义 Model

```typescript
import { BaseModel, Model, defineSchema, field } from '@schema-component/engine'

@Model('User')
class UserModel extends BaseModel {
  static schema = defineSchema({
    name: 'User',
    fields: {
      id: field.uuid({ required: true }),
      email: field.email({ required: true, unique: true }),
      name: field.string({ required: true }),
      role: field.enum({ values: ['admin', 'user'] as const })
    },
    options: {
      timestamps: true,
      softDelete: true
    }
  })

  // 自定义方法
  async changeRole(newRole: string) {
    return this.update(this.id, { role: newRole })
  }

  // 生命周期钩子
  async beforeCreate(data: any) {
    // 密码加密等逻辑
    if (data.password) {
      data.password = await hashPassword(data.password)
    }
    return data
  }

  async afterCreate(record: any) {
    // 发送欢迎邮件等
    await sendWelcomeEmail(record.email)
  }
}
```

### 2. 配置 Data Access Layer 和 Repository

```typescript
import {
  Repository,
  HttpDataAccessClient,
  RestUrlMapper
} from '@schema-component/engine'
import axios from 'axios'

// 1. 创建 HTTP 客户端
const httpClient = axios.create({
  baseURL: 'https://api.example.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 2. 创建 URL 映射器
const urlMapper = new RestUrlMapper('/api', {
  pluralize: true,
  customRoutes: {
    'User': 'users',
    'Post': 'posts'
  }
})

// 3. 创建 HTTP Data Access Client
const dataAccessClient = new HttpDataAccessClient(
  httpClient,
  urlMapper,
  {
    baseURL: 'https://api.example.com',
    interceptors: {
      request: [
        async (config) => {
          // 添加认证 token
          const token = await getAuthToken()
          config.headers = {
            ...config.headers,
            Authorization: `Bearer ${token}`
          }
          return config
        }
      ],
      response: [
        async (response) => {
          // 处理响应
          console.log('Response:', response.status)
          return response
        }
      ],
      error: [
        (error) => {
          // 统一错误处理
          if (error.response?.status === 401) {
            // 跳转到登录页
            redirectToLogin()
          }
          throw error
        }
      ]
    }
  }
)

// 4. 创建 Repository（注入 Data Access Client）
const userRepository = new Repository('User', dataAccessClient)

// 5. 使用 Repository
const users = await userRepository.getList({
  pagination: { page: 1, pageSize: 10 },
  sort: [{ field: 'createdAt', order: 'DESC' }],
  filter: { role: 'admin' }
})

// 获取单个用户
const user = await userRepository.getOne('user-123')

// 创建用户
const newUser = await userRepository.createOne({
  email: 'test@example.com',
  name: 'Test User',
  role: 'user'
})

// 更新用户
const updatedUser = await userRepository.updateOne('user-123', {
  name: 'Updated Name'
})

// 删除用户
await userRepository.deleteOne('user-123')
```

#### 通过 DI 容器管理

```typescript
import { Container, injectable, inject } from 'inversify'
import { TYPES } from '@schema-component/engine'

// 配置 DI 容器
const container = new Container()

// 绑定 HTTP 客户端
container.bind(TYPES.HttpClient).toConstantValue(axios.create({
  baseURL: 'https://api.example.com',
  timeout: 10000
}))

// 绑定 URL 映射器
container.bind<IUrlMapper>(TYPES.UrlMapper).toConstantValue(
  new RestUrlMapper('/api', { pluralize: true })
)

// 绑定 Data Access Client
container.bind<IDataAccessClient>(TYPES.DataAccessClient).to(HttpDataAccessClient)

// 绑定 Repository（自动注入 Data Access Client）
container.bind<IRepository>(TYPES.Repository).to(Repository)

// 使用
const userRepository = container.get<IRepository>(TYPES.Repository)
const users = await userRepository.getList({ /* ... */ })
```

### 3. 定义视图

```typescript
import { ViewRegistry, ViewType } from '@schema-component/engine'

const viewRegistry = ViewRegistry.getInstance()

// 注册列表视图
viewRegistry.register({
  id: 'user_list',
  type: ViewType.LIST,
  modelName: 'User',
  title: 'Users',
  fields: ['id', 'email', 'name', 'role', 'createdAt'],
  config: {
    columns: [
      { field: 'email', label: 'Email', sortable: true },
      { field: 'name', label: 'Name', sortable: true },
      { field: 'role', label: 'Role', filterable: true }
    ],
    actions: [
      { name: 'edit', label: 'Edit', type: 'button' },
      { name: 'delete', label: 'Delete', type: 'button' }
    ],
    bulkActions: ['delete', 'export']
  }
})

// 注册表单视图
viewRegistry.register({
  id: 'user_form',
  type: ViewType.FORM,
  modelName: 'User',
  title: 'User Form',
  fields: ['email', 'name', 'role'],
  config: {
    layout: 'vertical',
    sections: [
      {
        title: 'Basic Info',
        fields: ['email', 'name']
      },
      {
        title: 'Permissions',
        fields: ['role']
      }
    ]
  }
})
```

### 4. 定义 Action

```typescript
import { ActionType } from '@schema-component/engine'

const actionExecutor = new ActionExecutor(viewRegistry, modelRegistry, eventBus)

// 定义打开用户列表的动作
const openUserListAction = {
  id: 'open_user_list',
  name: 'Open User List',
  type: ActionType.WINDOW,
  modelName: 'User',
  config: {
    viewType: ViewType.LIST,
    viewId: 'user_list',
    target: 'current'
  }
}

// 执行动作
await actionExecutor.execute(openUserListAction)

// 定义服务端动作
const exportUsersAction = {
  id: 'export_users',
  name: 'Export Users',
  type: ActionType.SERVER,
  modelName: 'User',
  config: {
    method: 'exportToExcel',
    params: { format: 'xlsx' }
  }
}

await actionExecutor.execute(exportUsersAction)
```

### 5. 状态管理

```typescript
import { RootStore } from '@schema-component/engine'
import { autorun } from 'mobx'

const rootStore = new RootStore()
const userStore = rootStore.getModelStore('User')

// 加载数据
await userStore.load({
  pagination: { page: 1, pageSize: 10 }
})

// 监听数据变化
autorun(() => {
  console.log('Users:', userStore.all)
  console.log('Loading:', userStore.loading)
})

// 创建用户
await userStore.create({
  email: 'test@example.com',
  name: 'Test User',
  role: 'user'
})

// 更新用户
await userStore.update('user-id-123', {
  name: 'Updated Name'
})

// 删除用户
await userStore.delete('user-id-123')
```

### 6. 注册渲染器

```typescript
import { RenderRegistry } from '@schema-component/engine'

const renderRegistry = RenderRegistry.getInstance()

// 注册数据渲染器
renderRegistry.registerDataRenderer({
  name: 'email',
  render(data: string, context?: RenderContext) {
    // 这里只返回渲染所需的数据结构，不执行实际渲染
    return {
      type: 'link',
      href: `mailto:${data}`,
      text: data
    }
  }
})

// 注册视图渲染器
renderRegistry.registerViewRenderer({
  type: ViewType.LIST,
  render(view: IViewDefinition, data: any, context?: RenderContext) {
    // 返回视图渲染所需的数据结构
    return {
      type: 'table',
      columns: view.config.columns,
      rows: data,
      actions: view.config.actions
    }
  }
})

// 注册上下文注入器
renderRegistry.registerContextInjector((context) => {
  return {
    ...context,
    currentUser: getCurrentUser(), // 注入当前用户信息
    permissions: getUserPermissions() // 注入权限信息
  }
})

// 使用渲染器
const emailRenderData = renderRegistry.renderData('email', 'test@example.com', {
  modelName: 'User',
  fieldName: 'email'
})

const listView = viewRegistry.get('user_list')
const listRenderData = renderRegistry.renderView(listView, users, {
  modelName: 'User',
  viewType: ViewType.LIST
})
```

### 7. 完整示例：初始化 Engine

```typescript
import { EngineContext, Container } from '@schema-component/engine'

// 1. 创建容器
const container = new Container()

// 2. 注册依赖
container.bind(TYPES.ApiAdapter).to(RestApiAdapter)
container.bind(TYPES.EventBus).toConstantValue(new EventBus())
container.bind(TYPES.RenderRegistry).toConstantValue(RenderRegistry.getInstance())

// 3. 创建 Engine Context
const engineContext = new EngineContext(container, {
  apiBaseUrl: 'https://api.example.com',
  debug: true
})

// 4. 注册 Models
const userModel = new UserModel()
engineContext.registerModel(userModel)

// 5. 注册 Views
const viewRegistry = engineContext.get(TYPES.ViewRegistry)
viewRegistry.register(userListView)
viewRegistry.register(userFormView)

// 6. 注册 Renderers
const renderRegistry = engineContext.get(TYPES.RenderRegistry)
renderRegistry.registerDataRenderer(emailRenderer)
renderRegistry.registerViewRenderer(listViewRenderer)

// 7. 初始化 Store
const rootStore = engineContext.get(TYPES.Store)

// 8. 使用 Engine
export { engineContext, rootStore }
```

## 目录结构

```
packages/engine/
├── src/
│   ├── core/
│   │   ├── BaseModel.ts           # 基础模型类
│   │   ├── ModelRegistry.ts       # 模型注册表
│   │   ├── EngineContext.ts       # Engine 上下文
│   │   └── types.ts               # 核心类型定义
│   │
│   ├── data-access/               # 数据访问层 IoC（独立层）
│   │   ├── interfaces/
│   │   │   ├── IDataAccessClient.ts    # 数据访问客户端接口
│   │   │   ├── IUrlMapper.ts           # URL 映射器接口
│   │   │   └── types.ts                # 共享类型定义
│   │   │
│   │   ├── http/                       # HTTP 实现（第一版）
│   │   │   ├── HttpDataAccessClient.ts # HTTP 客户端实现
│   │   │   ├── RestUrlMapper.ts        # REST URL 映射器
│   │   │   ├── HttpInterceptor.ts      # HTTP 拦截器
│   │   │   └── types.ts                # HTTP 类型定义
│   │   │
│   │   ├── graphql/                    # GraphQL 实现（待支持）
│   │   │   ├── GraphQLDataAccessClient.ts
│   │   │   └── types.ts
│   │   │
│   │   ├── websocket/                  # WebSocket 实现（待支持）
│   │   │   ├── WebSocketDataAccessClient.ts
│   │   │   └── types.ts
│   │   │
│   │   ├── grpc/                       # gRPC 实现（待支持）
│   │   │   └── ...
│   │   │
│   │   └── index.ts                    # 数据访问层导出
│   │
│   ├── repository/
│   │   ├── Repository.ts               # Repository 实现
│   │   ├── CacheStrategy.ts            # 缓存策略
│   │   └── types.ts                    # Repository 类型
│   │
│   ├── service/
│   │   ├── ModelService.ts             # Model Service
│   │   └── types.ts                    # Service 类型
│   │
│   ├── view/
│   │   ├── ViewRegistry.ts             # 视图注册表
│   │   ├── ViewDefinition.ts           # 视图定义
│   │   └── types.ts                    # 视图类型
│   │
│   ├── action/
│   │   ├── ActionExecutor.ts           # 动作执行器
│   │   ├── ActionDefinition.ts         # 动作定义
│   │   └── types.ts                    # 动作类型
│   │
│   ├── state/
│   │   ├── RootStore.ts                # 根 Store
│   │   ├── ModelStore.ts               # 模型 Store
│   │   ├── ViewStore.ts                # 视图 Store
│   │   └── types.ts                    # State 类型
│   │
│   ├── render/
│   │   ├── RenderRegistry.ts           # 渲染注册表
│   │   ├── DataRenderer.ts             # 数据渲染器接口
│   │   ├── ViewRenderer.ts             # 视图渲染器接口
│   │   └── types.ts                    # Render 类型
│   │
│   ├── event/
│   │   ├── EventBus.ts                 # 事件总线
│   │   └── types.ts                    # 事件类型
│   │
│   ├── di/
│   │   ├── Container.ts                # DI 容器
│   │   ├── decorators.ts               # 装饰器
│   │   └── types.ts                    # DI 类型
│   │
│   ├── decorators/
│   │   ├── Model.ts                    # @Model 装饰器
│   │   ├── Field.ts                    # @Field 装饰器
│   │   └── Lifecycle.ts                # 生命周期装饰器
│   │
│   ├── utils/
│   │   ├── validation.ts               # 验证工具
│   │   ├── transform.ts                # 数据转换工具
│   │   └── helpers.ts                  # 辅助函数
│   │
│   └── index.ts                        # 主入口
│
├── examples/
│   ├── basic/                          # 基础示例
│   │   ├── http-basic.ts               # HTTP 基础用法
│   │   └── model-basic.ts              # Model 基础用法
│   ├── advanced/                       # 高级示例
│   │   ├── custom-url-mapper.ts        # 自定义 URL 映射
│   │   ├── interceptors.ts             # 拦截器用法
│   │   └── cache-strategy.ts           # 缓存策略
│   └── integration/                    # 集成示例
│       ├── react-integration.ts        # React 集成
│       └── vue-integration.ts          # Vue 集成
│
├── tests/
│   ├── core/
│   ├── data-access/                    # 数据访问层测试
│   │   ├── http/
│   │   └── mock/
│   ├── repository/
│   ├── state/
│   └── render/
│
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 依赖包

```json
{
  "dependencies": {
    "@schema-component/schema": "workspace:*",
    "mobx": "^6.13.5",
    "inversify": "^6.0.3",
    "eventemitter3": "^5.0.1",
    "reflect-metadata": "^0.2.2"
  },
  "devDependencies": {
    "typescript": "^5.6.3",
    "vite": "^5.0.0",
    "vitest": "^1.0.0"
  },
  "peerDependencies": {
    "axios": "^1.6.0"
  }
}
```

## Data Access Layer 详细说明

### 架构特点

Data Access Layer（数据访问层）是一个**独立的 IoC 层**，具有以下特点：

1. **协议无关**：通过 `IDataAccessClient` 接口抽象，支持多种数据访问协议
2. **插拔式设计**：可以在运行时切换不同的数据访问实现
3. **IoC 管理**：通过依赖注入容器管理生命周期和依赖关系
4. **可扩展性**：轻松添加新的协议支持

### 第一版实现范围

第一版只实现 HTTP 协议支持，包括：

- `HttpDataAccessClient` - HTTP 客户端实现
- `RestUrlMapper` - REST 风格 URL 映射
- HTTP 拦截器支持
- 请求/响应转换

### 切换 Data Access 实现示例

由于采用 IoC 设计，切换不同的数据访问实现非常简单：

```typescript
// 使用 HTTP（第一版）
container.bind<IDataAccessClient>(TYPES.DataAccessClient).to(HttpDataAccessClient)

// 未来切换为 GraphQL
// container.bind<IDataAccessClient>(TYPES.DataAccessClient).to(GraphQLDataAccessClient)

// 未来切换为 WebSocket
// container.bind<IDataAccessClient>(TYPES.DataAccessClient).to(WebSocketDataAccessClient)

// 甚至可以使用多个 Data Access Client（通过 named binding）
container.bind<IDataAccessClient>(TYPES.DataAccessClient)
  .to(HttpDataAccessClient)
  .whenTargetNamed('http')

container.bind<IDataAccessClient>(TYPES.DataAccessClient)
  .to(GraphQLDataAccessClient)
  .whenTargetNamed('graphql')

// 使用时指定
const httpClient = container.getNamed<IDataAccessClient>(TYPES.DataAccessClient, 'http')
const graphqlClient = container.getNamed<IDataAccessClient>(TYPES.DataAccessClient, 'graphql')
```

### 自定义 Data Access Client

如果需要支持自定义协议或特殊需求，可以实现 `IDataAccessClient` 接口：

```typescript
class CustomDataAccessClient implements IDataAccessClient {
  async getList(modelName: string, params: GetListParams): Promise<GetListResult> {
    // 自定义实现
  }

  async getOne(modelName: string, id: string | number): Promise<any> {
    // 自定义实现
  }

  // ... 实现其他方法
}

// 注册
container.bind<IDataAccessClient>(TYPES.DataAccessClient).to(CustomDataAccessClient)
```

### Data Access Layer 与 Repository 的关系

```
┌─────────────────────────────────────────────────┐
│                   Repository                    │
│  ┌──────────────────────────────────────────┐  │
│  │ • 缓存管理                               │  │
│  │ • 数据转换                               │  │
│  │ • 业务逻辑协调                           │  │
│  └──────────────┬───────────────────────────┘  │
└─────────────────┼─────────────────────────────┘
                  │ (依赖注入)
                  ▼
┌─────────────────────────────────────────────────┐
│            IDataAccessClient (接口)             │
│  • getList()                                    │
│  • getOne()                                     │
│  • createOne()                                  │
│  • updateOne()                                  │
│  • deleteOne()                                  │
└─────────────────┬───────────────────────────────┘
                  │ (实现)
      ┌───────────┼───────────┐
      ▼           ▼           ▼
┌──────────┐ ┌──────────┐ ┌──────────┐
│   HTTP   │ │ GraphQL  │ │WebSocket │
│  Client  │ │  Client  │ │  Client  │
└──────────┘ └──────────┘ └──────────┘
```

**职责分离**：
- **Repository**：负责缓存、数据转换、业务逻辑协调
- **Data Access Client**：负责与外部数据源的实际通信

### 扩展路线图

#### Phase 1 (第一版) - HTTP 支持 ✅
- [x] `HttpDataAccessClient` 实现
- [x] `RestUrlMapper` 实现
- [x] HTTP 拦截器支持
- [x] 请求/响应转换

#### Phase 2 (第二版) - GraphQL 支持
- [ ] `GraphQLDataAccessClient` 实现
- [ ] GraphQL 查询构建器
- [ ] GraphQL 缓存策略
- [ ] Subscription 支持

#### Phase 3 (第三版) - 实时通信支持
- [ ] `WebSocketDataAccessClient` 实现
- [ ] 实时数据同步
- [ ] 断线重连机制
- [ ] 消息队列管理

#### Phase 4 (第四版) - 更多协议
- [ ] `gRPC` 支持
- [ ] `MQTT` 支持
- [ ] 自定义协议支持

## 扩展性设计

### 插件系统

```typescript
interface IPlugin {
  name: string
  version: string
  install(context: EngineContext): void
  uninstall?(context: EngineContext): void
}

class PluginManager {
  private plugins: Map<string, IPlugin> = new Map()

  register(plugin: IPlugin): void {
    this.plugins.set(plugin.name, plugin)
    plugin.install(this.context)
  }

  unregister(name: string): void {
    const plugin = this.plugins.get(name)
    if (plugin?.uninstall) {
      plugin.uninstall(this.context)
    }
    this.plugins.delete(name)
  }
}

// 插件示例：缓存插件
class CachePlugin implements IPlugin {
  name = 'cache'
  version = '1.0.0'

  install(context: EngineContext): void {
    // 注册缓存服务
    context.bind(TYPES.Cache, new CacheService())

    // 注册拦截器
    context.eventBus.subscribe('model:before:read', async (event) => {
      // 尝试从缓存读取
    })
  }
}
```

### 中间件系统

```typescript
type Middleware = (context: any, next: () => Promise<any>) => Promise<any>

class MiddlewareChain {
  private middlewares: Middleware[] = []

  use(middleware: Middleware): void {
    this.middlewares.push(middleware)
  }

  async execute(context: any): Promise<any> {
    let index = 0

    const next = async (): Promise<any> => {
      if (index >= this.middlewares.length) {
        return
      }

      const middleware = this.middlewares[index++]
      return middleware(context, next)
    }

    return next()
  }
}

// 使用中间件
const chain = new MiddlewareChain()

chain.use(async (context, next) => {
  console.log('Before')
  await next()
  console.log('After')
})

chain.use(async (context, next) => {
  // 验证逻辑
  if (!context.user) {
    throw new Error('Unauthorized')
  }
  await next()
})

await chain.execute({ user: currentUser })
```

## 性能优化

### 1. 缓存策略

```typescript
interface ICacheStrategy {
  get(key: string): Promise<any>
  set(key: string, value: any, ttl?: number): Promise<void>
  delete(key: string): Promise<void>
  clear(): Promise<void>
}

class MemoryCacheStrategy implements ICacheStrategy {
  private cache: Map<string, { value: any; expiry: number }> = new Map()

  async get(key: string): Promise<any> {
    const item = this.cache.get(key)
    if (!item) return undefined

    if (Date.now() > item.expiry) {
      this.cache.delete(key)
      return undefined
    }

    return item.value
  }

  async set(key: string, value: any, ttl: number = 300000): Promise<void> {
    this.cache.set(key, {
      value,
      expiry: Date.now() + ttl
    })
  }

  // ... 其他方法
}
```

### 2. 批量操作

```typescript
class BatchOperationManager {
  private batches: Map<string, any[]> = new Map()
  private timers: Map<string, any> = new Map()

  queue(operation: string, item: any): void {
    if (!this.batches.has(operation)) {
      this.batches.set(operation, [])
    }

    this.batches.get(operation)!.push(item)

    // 延迟执行
    if (this.timers.has(operation)) {
      clearTimeout(this.timers.get(operation))
    }

    this.timers.set(operation, setTimeout(() => {
      this.flush(operation)
    }, 100))
  }

  private async flush(operation: string): Promise<void> {
    const items = this.batches.get(operation)
    if (!items || items.length === 0) return

    // 执行批量操作
    await this.executeBatch(operation, items)

    this.batches.delete(operation)
    this.timers.delete(operation)
  }

  private async executeBatch(operation: string, items: any[]): Promise<void> {
    // 实现批量操作逻辑
  }
}
```

### 3. 虚拟滚动支持

```typescript
interface VirtualScrollConfig {
  itemHeight: number
  bufferSize: number
  containerHeight: number
}

class VirtualScrollManager {
  constructor(private config: VirtualScrollConfig) {}

  getVisibleRange(scrollTop: number, totalItems: number): { start: number; end: number } {
    const { itemHeight, bufferSize, containerHeight } = this.config

    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - bufferSize)
    const end = Math.min(
      totalItems,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + bufferSize
    )

    return { start, end }
  }
}
```

## 测试策略

### 单元测试

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { UserModel } from './UserModel'

describe('UserModel', () => {
  let userModel: UserModel

  beforeEach(() => {
    userModel = new UserModel()
  })

  it('should create a user', async () => {
    const data = {
      email: 'test@example.com',
      name: 'Test User'
    }

    const user = await userModel.create(data)

    expect(user).toBeDefined()
    expect(user.email).toBe(data.email)
  })

  it('should call beforeCreate hook', async () => {
    const spy = vi.spyOn(userModel, 'beforeCreate')

    await userModel.create({ email: 'test@example.com', name: 'Test' })

    expect(spy).toHaveBeenCalled()
  })
})
```

### 集成测试

```typescript
describe('Engine Integration', () => {
  let engineContext: EngineContext

  beforeEach(() => {
    engineContext = createTestEngineContext()
  })

  it('should execute full CRUD flow', async () => {
    const userStore = engineContext.getModelStore('User')

    // Create
    const user = await userStore.create({
      email: 'test@example.com',
      name: 'Test'
    })

    expect(user.id).toBeDefined()

    // Read
    const fetchedUser = await userStore.get(user.id)
    expect(fetchedUser).toEqual(user)

    // Update
    await userStore.update(user.id, { name: 'Updated' })
    const updatedUser = await userStore.get(user.id)
    expect(updatedUser.name).toBe('Updated')

    // Delete
    await userStore.delete(user.id)
    const deletedUser = await userStore.get(user.id)
    expect(deletedUser).toBeUndefined()
  })
})
```

## 最佳实践

### 1. Model 定义

- 使用装饰器简化代码
- 合理使用生命周期钩子
- 避免在 Model 中包含过多业务逻辑
- 优先使用 Schema 验证而非手动验证

### 2. State 管理

- 使用 computed 优化派生数据
- 避免在 Store 中存储过多数据
- 合理使用 reaction 监听数据变化
- 注意内存泄漏，及时清理订阅

### 3. 渲染器设计

- 渲染器只返回数据结构，不执行实际渲染
- 使用上下文注入器扩展渲染上下文
- 避免在渲染器中包含业务逻辑
- 合理使用缓存优化渲染性能

### 4. API 对接

- 统一错误处理
- 合理使用缓存减少请求
- 支持请求取消
- 实现重试机制

## 后续规划

### Phase 1 (第一版)
- ✅ 核心架构设计
- ✅ Model、Repository、Service 层实现
- ✅ 状态管理（MobX）
- ✅ 渲染注册表
- ✅ 基础 CRUD API

### Phase 2 (第二版)
- 完善视图系统
- 增强 Action 执行器
- 插件系统
- 中间件系统
- 缓存策略

### Phase 3 (第三版)
- 虚拟滚动支持
- 批量操作优化
- 离线支持
- 实时同步
- 性能监控

## 总结

`@schema-component/engine` 提供了一个完整的、框架无关的数据引擎解决方案，具有以下特点：

1. **符合 DDD 原则**：清晰的分层架构，职责明确
2. **框架无关**：可在任何前端框架或 Node.js 环境中使用
3. **响应式设计**：基于 MobX 的观察者模式，数据变化自动更新
4. **灵活扩展**：插件系统、中间件、上下文注入等多种扩展方式
5. **类型安全**：完整的 TypeScript 支持，开发体验好
6. **易于测试**：依赖注入、分层架构使得单元测试和集成测试都很容易

通过合理使用本引擎，可以快速构建复杂的数据驱动应用，同时保持代码的可维护性和可扩展性。

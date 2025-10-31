# @schema-component/engine 实施计划

## 项目概述

基于 `ENGINE_DESIGN.md` 的架构设计，实现一个函数式优先、框架无关的数据引擎层。

## 技术栈

- TypeScript 5.6+
- MobX 6.13+ (状态管理)
- InversifyJS 6.0+ (依赖注入)
- EventEmitter3 5.0+ (事件系统)
- Vitest (测试框架)

## 实施阶段

---

## Phase 1: 核心基础设施搭建

**目标**：建立项目基础架构、类型系统和依赖注入容器

### 1.1 项目初始化

#### 文件清单：
- `packages/engine/package.json` - 包配置
- `packages/engine/tsconfig.json` - TypeScript 配置
- `packages/engine/vite.config.ts` - Vite 构建配置
- `packages/engine/.eslintrc.js` - ESLint 配置
- `packages/engine/.prettierrc` - Prettier 配置

#### package.json 内容：
```json
{
  "name": "@schema-component/engine",
  "version": "0.1.0",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
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
    "vitest": "^1.0.0",
    "axios": "^1.6.0"
  },
  "peerDependencies": {
    "axios": "^1.6.0"
  }
}
```

### 1.2 核心类型定义

#### 文件清单：
- `src/core/types.ts` - 核心类型定义
- `src/core/viewTypes.ts` - View 相关类型
- `src/core/actionTypes.ts` - Action 相关类型
- `src/core/apiTypes.ts` - API 相关类型

#### src/core/types.ts 内容：
```typescript
// 基础类型
export type ModelName = string
export type RecordId = string | number

// Model 上下文
export interface ModelContext {
  modelName: string
  schema: any // 引用 @schema-component/schema
  repository: IRepository
  eventBus: EventBus
  [key: string]: any // 允许扩展
}

// Model 定义接口
export interface ModelDefinition {
  name: string
  schema: any // SchemaDefinition
  views?: ViewsDefinition
  actions?: ActionsDefinition
  apis?: ApisDefinition
  hooks?: HooksDefinition
  methods?: MethodsDefinition
  options?: ModelOptions
}

// Model 选项
export interface ModelOptions {
  tableName?: string
  description?: string
  timestamps?: boolean
  softDelete?: boolean
}

// 查询参数
export interface GetListParams {
  pagination?: {
    page: number
    pageSize: number
  }
  sort?: Array<{
    field: string
    order: 'ASC' | 'DESC'
  }>
  filter?: Record<string, any>
}

// 查询结果
export interface GetListResult<T = any> {
  data: T[]
  total: number
  page?: number
  pageSize?: number
}

// Repository 接口（后续 Phase 4 实现）
export interface IRepository {
  getList(params: GetListParams): Promise<GetListResult>
  getOne(id: RecordId): Promise<any>
  createOne(data: any): Promise<any>
  updateOne(id: RecordId, data: any): Promise<any>
  deleteOne(id: RecordId): Promise<boolean>
  getMany(ids: RecordId[]): Promise<any[]>
  createMany(data: any[]): Promise<any[]>
  updateMany(ids: RecordId[], data: any): Promise<any[]>
  deleteMany(ids: RecordId[]): Promise<boolean>
}

// 导出所有类型
export * from './viewTypes'
export * from './actionTypes'
export * from './apiTypes'
```

#### src/core/viewTypes.ts 内容：
```typescript
import type { ModelContext } from './types'

export type ViewType = 'list' | 'form' | 'kanban' | 'calendar' | string

export interface ViewConfig {
  type: ViewType
  title?: string
  [key: string]: any
}

export interface ViewDefinitions {
  list?: ViewConfig
  form?: ViewConfig
  kanban?: ViewConfig
  calendar?: ViewConfig
  [key: string]: ViewConfig | undefined
}

// Views 定义：函数形式或对象形式
export type ViewsDefinition =
  | ViewDefinitions
  | ((context: ModelContext) => ViewDefinitions)
```

#### src/core/actionTypes.ts 内容：
```typescript
import type { ModelContext } from './types'

// Action 函数类型
export type ActionFunction = (params?: any) => Promise<any>

// Action 定义
export interface ActionDefinitions {
  [actionName: string]: ActionFunction
}

// Actions 定义：函数形式
export type ActionsDefinition =
  | ActionDefinitions
  | ((context: ModelContext) => ActionDefinitions)
```

#### src/core/apiTypes.ts 内容：
```typescript
import type { GetListParams, GetListResult, RecordId } from './types'

// API 标准方法接口
export interface StandardApis {
  getList?: (params: GetListParams) => Promise<GetListResult>
  getOne?: (id: RecordId) => Promise<any>
  createOne?: (data: any) => Promise<any>
  updateOne?: (id: RecordId, data: any) => Promise<any>
  deleteOne?: (id: RecordId) => Promise<boolean>
  [customApi: string]: ((...args: any[]) => Promise<any>) | undefined
}

// APIs 定义
export type ApisDefinition = StandardApis

// Hooks 定义
export interface HooksDefinition {
  beforeCreate?: (data: any) => Promise<any>
  afterCreate?: (record: any) => Promise<void>
  beforeUpdate?: (id: RecordId, data: any) => Promise<any>
  afterUpdate?: (record: any) => Promise<void>
  beforeDelete?: (id: RecordId) => Promise<boolean>
  afterDelete?: (id: RecordId) => Promise<void>
  beforeRead?: (id: RecordId) => Promise<void>
  afterRead?: (record: any) => Promise<any>
  beforeSearch?: (criteria: any) => Promise<any>
  afterSearch?: (results: any[]) => Promise<any[]>
}

// Methods 定义
export interface MethodsDefinition {
  [methodName: string]: (...args: any[]) => Promise<any>
}
```

### 1.3 依赖注入容器

#### 文件清单：
- `src/di/types.ts` - DI 类型标识符
- `src/di/Container.ts` - DI 容器封装
- `src/di/decorators.ts` - DI 装饰器

#### src/di/types.ts 内容：
```typescript
export const TYPES = {
  // Core
  Model: Symbol.for('Model'),
  ModelRegistry: Symbol.for('ModelRegistry'),

  // Data Access
  DataAccessClient: Symbol.for('DataAccessClient'),
  HttpClient: Symbol.for('HttpClient'),
  UrlMapper: Symbol.for('UrlMapper'),

  // Repository
  Repository: Symbol.for('Repository'),
  Cache: Symbol.for('Cache'),

  // State
  RootStore: Symbol.for('RootStore'),
  ModelStore: Symbol.for('ModelStore'),
  ViewStore: Symbol.for('ViewStore'),

  // Event
  EventBus: Symbol.for('EventBus'),

  // Render
  RenderRegistry: Symbol.for('RenderRegistry'),
  DataRenderer: Symbol.for('DataRenderer'),
  ViewRenderer: Symbol.for('ViewRenderer')
} as const
```

#### src/di/Container.ts 内容：
```typescript
import { Container as InversifyContainer } from 'inversify'
import 'reflect-metadata'

export class Container {
  private container: InversifyContainer

  constructor() {
    this.container = new InversifyContainer()
  }

  bind<T>(identifier: symbol): any {
    return this.container.bind<T>(identifier)
  }

  get<T>(identifier: symbol): T {
    return this.container.get<T>(identifier)
  }

  getNamed<T>(identifier: symbol, named: string): T {
    return this.container.getNamed<T>(identifier, named)
  }

  isBound(identifier: symbol): boolean {
    return this.container.isBound(identifier)
  }

  unbind(identifier: symbol): void {
    this.container.unbind(identifier)
  }

  rebind<T>(identifier: symbol): any {
    return this.container.rebind<T>(identifier)
  }
}
```

#### src/di/decorators.ts 内容：
```typescript
import { injectable, inject } from 'inversify'

// 导出 inversify 装饰器
export { injectable, inject }

// 自定义装饰器（未来扩展）
export function Model(name: string) {
  return function (target: any) {
    Reflect.defineMetadata('model:name', name, target)
    return injectable()(target)
  }
}
```

### 1.4 Engine Context

#### 文件清单：
- `src/core/EngineContext.ts` - Engine 上下文

#### src/core/EngineContext.ts 内容：
```typescript
import { Container } from '../di/Container'

export interface EngineConfig {
  apiBaseUrl?: string
  debug?: boolean
  [key: string]: any
}

export class EngineContext {
  constructor(
    public container: Container,
    public config: EngineConfig
  ) {}

  get<T>(identifier: symbol): T {
    return this.container.get<T>(identifier)
  }

  bind<T>(identifier: symbol, implementation: any): void {
    this.container.bind<T>(identifier).to(implementation)
  }

  registerModel(model: any): void {
    // 将在 Phase 2 实现
    throw new Error('Not implemented yet')
  }
}
```

---

## Phase 2: Model 层（统一定义层）实现

**目标**：实现函数式优先的 Model 定义和管理

### 2.1 核心 Model 实现

#### 文件清单：
- `src/core/defineModel.ts` - defineModel 函数
- `src/core/BaseModel.ts` - 基础 Model 类
- `src/core/ModelRegistry.ts` - Model 注册表
- `src/core/ModelExecutor.ts` - Model 执行器

#### src/core/defineModel.ts 内容：
```typescript
import type { ModelDefinition, ModelContext, IModel } from './types'
import { createMockRepository } from '../repository/mock'
import { getEventBus } from '../event/EventBus'

export interface IModel {
  name: string
  schema: any
  views: any
  actions: any
  apis: any
  hooks: any
  methods: any
  options: any
  context: ModelContext
}

export function defineModel(definition: ModelDefinition): IModel {
  // 1. 创建 Model Context
  const context: ModelContext = {
    modelName: definition.name,
    schema: definition.schema,
    repository: createMockRepository(), // 临时 mock，Phase 4 替换
    eventBus: getEventBus()
  }

  // 2. 初始化 views（如果是函数则调用）
  const views = typeof definition.views === 'function'
    ? definition.views(context)
    : definition.views || {}

  // 3. 初始化 actions（如果是函数则调用）
  const actions = typeof definition.actions === 'function'
    ? definition.actions(context)
    : definition.actions || {}

  // 4. 返回 Model 实例
  return {
    name: definition.name,
    schema: definition.schema,
    views,
    actions,
    apis: definition.apis || {},
    hooks: definition.hooks || {},
    methods: definition.methods || {},
    options: definition.options || {},
    context
  }
}
```

#### src/core/ModelRegistry.ts 内容：
```typescript
import type { IModel } from './defineModel'

export class ModelRegistry {
  private static instance: ModelRegistry
  private models: Map<string, IModel> = new Map()

  static getInstance(): ModelRegistry {
    if (!ModelRegistry.instance) {
      ModelRegistry.instance = new ModelRegistry()
    }
    return ModelRegistry.instance
  }

  register(model: IModel): void {
    if (this.models.has(model.name)) {
      throw new Error(`Model "${model.name}" is already registered`)
    }
    this.models.set(model.name, model)
  }

  get(name: string): IModel | undefined {
    return this.models.get(name)
  }

  has(name: string): boolean {
    return this.models.has(name)
  }

  unregister(name: string): boolean {
    return this.models.delete(name)
  }

  getAll(): IModel[] {
    return Array.from(this.models.values())
  }

  clear(): void {
    this.models.clear()
  }
}
```

#### src/core/ModelExecutor.ts 内容：
```typescript
import type { IModel } from './defineModel'
import type { ActionFunction } from './actionTypes'

export class ModelExecutor {
  /**
   * 执行 Model 的 Action
   */
  static async executeAction(
    model: IModel,
    actionName: string,
    params?: any
  ): Promise<any> {
    const action = model.actions[actionName] as ActionFunction

    if (!action) {
      throw new Error(`Action "${actionName}" not found in model "${model.name}"`)
    }

    if (typeof action !== 'function') {
      throw new Error(`Action "${actionName}" is not a function`)
    }

    // 执行 action
    return await action(params)
  }

  /**
   * 执行 Model 的 Method
   */
  static async executeMethod(
    model: IModel,
    methodName: string,
    ...args: any[]
  ): Promise<any> {
    const method = model.methods[methodName]

    if (!method) {
      throw new Error(`Method "${methodName}" not found in model "${model.name}"`)
    }

    if (typeof method !== 'function') {
      throw new Error(`Method "${methodName}" is not a function`)
    }

    // 执行 method
    return await method(...args)
  }

  /**
   * 调用 Model 的 API
   */
  static async callApi(
    model: IModel,
    apiName: string,
    ...args: any[]
  ): Promise<any> {
    const api = model.apis[apiName]

    if (!api) {
      throw new Error(`API "${apiName}" not found in model "${model.name}"`)
    }

    if (typeof api !== 'function') {
      throw new Error(`API "${apiName}" is not a function`)
    }

    // 调用 API
    return await api(...args)
  }
}
```

#### src/core/BaseModel.ts 内容：
```typescript
import type { ModelDefinition } from './types'
import { defineModel, type IModel } from './defineModel'
import { ModelExecutor } from './ModelExecutor'

export abstract class BaseModel {
  private _model: IModel | null = null

  protected abstract getDefinition(): ModelDefinition

  private get model(): IModel {
    if (!this._model) {
      this._model = defineModel(this.getDefinition())
    }
    return this._model
  }

  // 执行 Action
  async executeAction(actionName: string, params?: any): Promise<any> {
    return ModelExecutor.executeAction(this.model, actionName, params)
  }

  // 执行 Method
  async executeMethod(methodName: string, ...args: any[]): Promise<any> {
    return ModelExecutor.executeMethod(this.model, methodName, ...args)
  }

  // 调用 API
  async callApi(apiName: string, ...args: any[]): Promise<any> {
    return ModelExecutor.callApi(this.model, apiName, ...args)
  }

  // 获取 Views
  getViews(): any {
    return this.model.views
  }

  // 获取 Schema
  getSchema(): any {
    return this.model.schema
  }
}
```

### 2.2 测试文件

#### 文件清单：
- `tests/core/defineModel.test.ts`
- `tests/core/ModelRegistry.test.ts`
- `tests/core/ModelExecutor.test.ts`

---

## Phase 3: Data Access Layer（HTTP）实现

**目标**：实现 HTTP 数据访问层，包括客户端、URL 映射器和拦截器

### 3.1 接口定义

#### 文件清单：
- `src/data-access/interfaces/IDataAccessClient.ts`
- `src/data-access/interfaces/IUrlMapper.ts`
- `src/data-access/interfaces/types.ts`

#### src/data-access/interfaces/IDataAccessClient.ts 内容：
```typescript
import type { GetListParams, GetListResult, RecordId } from '../../core/types'

export interface QueryCriteria {
  filter?: Record<string, any>
  sort?: Array<{ field: string; order: 'ASC' | 'DESC' }>
  pagination?: { page: number; pageSize: number }
  fields?: string[]
  relations?: string[]
}

export interface QueryResult {
  data: any[]
  total: number
  hasMore?: boolean
  cursor?: string
}

export interface IDataAccessClient {
  // 基础 CRUD
  getList(modelName: string, params: GetListParams): Promise<GetListResult>
  getOne(modelName: string, id: RecordId): Promise<any>
  createOne(modelName: string, data: any): Promise<any>
  updateOne(modelName: string, id: RecordId, data: any): Promise<any>
  deleteOne(modelName: string, id: RecordId): Promise<boolean>

  // 批量操作
  getMany(modelName: string, ids: RecordId[]): Promise<any[]>
  createMany(modelName: string, data: any[]): Promise<any[]>
  updateMany(modelName: string, ids: RecordId[], data: any): Promise<any[]>
  deleteMany(modelName: string, ids: RecordId[]): Promise<boolean>

  // 自定义查询
  query(modelName: string, criteria: QueryCriteria): Promise<QueryResult>

  // 连接管理（可选）
  connect?(): Promise<void>
  disconnect?(): Promise<void>
  isConnected?(): boolean
}
```

#### src/data-access/interfaces/IUrlMapper.ts 内容：
```typescript
import type { GetListParams, RecordId } from '../../core/types'

export interface IUrlMapper {
  mapGetList(modelName: string, params: GetListParams): string
  mapGetOne(modelName: string, id: RecordId): string
  mapGetMany(modelName: string, ids: RecordId[]): string
  mapCreateOne(modelName: string): string
  mapUpdateOne(modelName: string, id: RecordId): string
  mapDeleteOne(modelName: string, id: RecordId): string
  mapQuery(modelName: string): string
}
```

### 3.2 HTTP 实现

#### 文件清单：
- `src/data-access/http/types.ts`
- `src/data-access/http/HttpDataAccessClient.ts`
- `src/data-access/http/RestUrlMapper.ts`
- `src/data-access/http/HttpInterceptor.ts`

#### src/data-access/http/types.ts 内容：
```typescript
export interface HttpClientConfig {
  baseURL: string
  timeout?: number
  headers?: Record<string, string>
  interceptors?: {
    request?: Array<(config: RequestConfig) => RequestConfig | Promise<RequestConfig>>
    response?: Array<(response: ApiResponse) => ApiResponse | Promise<ApiResponse>>
    error?: Array<(error: any) => any>
  }
}

export interface RequestConfig {
  url?: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  params?: Record<string, any>
  data?: any
  headers?: Record<string, string>
  timeout?: number
}

export interface ApiResponse<T = any> {
  data: T
  status: number
  statusText: string
  headers: Record<string, string>
}
```

#### src/data-access/http/RestUrlMapper.ts 内容：
```typescript
import type { IUrlMapper } from '../interfaces/IUrlMapper'
import type { GetListParams, RecordId } from '../../core/types'

export interface RestUrlMapperOptions {
  pluralize?: boolean
  customRoutes?: Record<string, string>
}

export class RestUrlMapper implements IUrlMapper {
  constructor(
    private baseURL: string = '/api',
    private options?: RestUrlMapperOptions
  ) {}

  mapGetList(modelName: string, params: GetListParams): string {
    const resource = this.getResourceName(modelName)
    const queryString = this.buildQueryString(params)
    return `${this.baseURL}/${resource}${queryString}`
  }

  mapGetOne(modelName: string, id: RecordId): string {
    const resource = this.getResourceName(modelName)
    return `${this.baseURL}/${resource}/${id}`
  }

  mapGetMany(modelName: string, ids: RecordId[]): string {
    const resource = this.getResourceName(modelName)
    return `${this.baseURL}/${resource}`
  }

  mapCreateOne(modelName: string): string {
    const resource = this.getResourceName(modelName)
    return `${this.baseURL}/${resource}`
  }

  mapUpdateOne(modelName: string, id: RecordId): string {
    const resource = this.getResourceName(modelName)
    return `${this.baseURL}/${resource}/${id}`
  }

  mapDeleteOne(modelName: string, id: RecordId): string {
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

#### src/data-access/http/HttpDataAccessClient.ts 内容：
```typescript
import { injectable, inject } from 'inversify'
import type { IDataAccessClient, QueryCriteria, QueryResult } from '../interfaces/IDataAccessClient'
import type { IUrlMapper } from '../interfaces/IUrlMapper'
import type { GetListParams, GetListResult, RecordId } from '../../core/types'
import type { HttpClientConfig, RequestConfig } from './types'
import { TYPES } from '../../di/types'

@injectable()
export class HttpDataAccessClient implements IDataAccessClient {
  private httpClient: any
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

  async getOne(modelName: string, id: RecordId): Promise<any> {
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

  async updateOne(modelName: string, id: RecordId, data: any): Promise<any> {
    const url = this.urlMapper.mapUpdateOne(modelName, id)
    const requestConfig = this.buildRequestConfig('PUT', url, { data })

    const response = await this.httpClient.request(requestConfig)

    return response.data
  }

  async deleteOne(modelName: string, id: RecordId): Promise<boolean> {
    const url = this.urlMapper.mapDeleteOne(modelName, id)
    const requestConfig = this.buildRequestConfig('DELETE', url)

    const response = await this.httpClient.request(requestConfig)

    return response.status >= 200 && response.status < 300
  }

  async getMany(modelName: string, ids: RecordId[]): Promise<any[]> {
    const url = this.urlMapper.mapGetMany(modelName, ids)
    const requestConfig = this.buildRequestConfig('GET', url, {
      params: { ids: ids.join(',') }
    })

    const response = await this.httpClient.request(requestConfig)

    return response.data
  }

  async createMany(modelName: string, data: any[]): Promise<any[]> {
    const url = this.urlMapper.mapCreateOne(modelName)
    const requestConfig = this.buildRequestConfig('POST', url, { data })

    const response = await this.httpClient.request(requestConfig)

    return response.data
  }

  async updateMany(modelName: string, ids: RecordId[], data: any): Promise<any[]> {
    // 实现批量更新逻辑
    const promises = ids.map(id => this.updateOne(modelName, id, data))
    return Promise.all(promises)
  }

  async deleteMany(modelName: string, ids: RecordId[]): Promise<boolean> {
    // 实现批量删除逻辑
    const promises = ids.map(id => this.deleteOne(modelName, id))
    const results = await Promise.all(promises)
    return results.every(r => r === true)
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

### 3.3 测试文件

#### 文件清单：
- `tests/data-access/http/RestUrlMapper.test.ts`
- `tests/data-access/http/HttpDataAccessClient.test.ts`

---

## Phase 4: Repository 层实现

**目标**：实现 Repository 层，协调数据访问和缓存

### 4.1 Repository 实现

#### 文件清单：
- `src/repository/types.ts`
- `src/repository/Repository.ts`
- `src/repository/CacheStrategy.ts`
- `src/repository/mock.ts` - Mock Repository（用于测试）

#### src/repository/Repository.ts 内容：
```typescript
import { injectable, inject } from 'inversify'
import type { IRepository } from '../core/types'
import type { IDataAccessClient } from '../data-access/interfaces/IDataAccessClient'
import type { GetListParams, GetListResult, RecordId } from '../core/types'
import { TYPES } from '../di/types'

export interface ICache {
  get(key: string): Promise<any>
  set(key: string, value: any, ttl?: number): Promise<void>
  delete(key: string): Promise<void>
  invalidate(pattern: string): Promise<void>
  clear(): Promise<void>
}

@injectable()
export class Repository implements IRepository {
  constructor(
    private modelName: string,
    @inject(TYPES.DataAccessClient) private dataAccessClient: IDataAccessClient,
    @inject(TYPES.Cache) private cache?: ICache
  ) {}

  async getList(params: GetListParams): Promise<GetListResult> {
    // 1. 检查缓存
    const cacheKey = this.buildCacheKey('list', params)
    const cached = await this.cache?.get(cacheKey)
    if (cached) return cached

    // 2. 通过 Data Access Client 获取数据
    const result = await this.dataAccessClient.getList(this.modelName, params)

    // 3. 更新缓存
    await this.cache?.set(cacheKey, result)

    // 4. 返回结果
    return result
  }

  async getOne(id: RecordId): Promise<any> {
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

  async updateOne(id: RecordId, data: any): Promise<any> {
    const result = await this.dataAccessClient.updateOne(this.modelName, id, data)

    // 清除相关缓存
    await this.cache?.delete(this.buildCacheKey('one', id))
    await this.cache?.invalidate(`${this.modelName}:list:*`)

    return result
  }

  async deleteOne(id: RecordId): Promise<boolean> {
    const result = await this.dataAccessClient.deleteOne(this.modelName, id)

    // 清除相关缓存
    await this.cache?.delete(this.buildCacheKey('one', id))
    await this.cache?.invalidate(`${this.modelName}:list:*`)

    return result
  }

  async getMany(ids: RecordId[]): Promise<any[]> {
    return this.dataAccessClient.getMany(this.modelName, ids)
  }

  async createMany(data: any[]): Promise<any[]> {
    const result = await this.dataAccessClient.createMany(this.modelName, data)
    await this.cache?.invalidate(`${this.modelName}:list:*`)
    return result
  }

  async updateMany(ids: RecordId[], data: any): Promise<any[]> {
    const result = await this.dataAccessClient.updateMany(this.modelName, ids, data)
    await this.cache?.invalidate(`${this.modelName}:*`)
    return result
  }

  async deleteMany(ids: RecordId[]): Promise<boolean> {
    const result = await this.dataAccessClient.deleteMany(this.modelName, ids)
    await this.cache?.invalidate(`${this.modelName}:*`)
    return result
  }

  private buildCacheKey(operation: string, params: any): string {
    return `${this.modelName}:${operation}:${JSON.stringify(params)}`
  }
}
```

#### src/repository/CacheStrategy.ts 内容：
```typescript
import type { ICache } from './Repository'

export class MemoryCacheStrategy implements ICache {
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

  async delete(key: string): Promise<void> {
    this.cache.delete(key)
  }

  async invalidate(pattern: string): Promise<void> {
    // 简单的模式匹配：支持 * 通配符
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$')

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
      }
    }
  }

  async clear(): Promise<void> {
    this.cache.clear()
  }
}
```

#### src/repository/mock.ts 内容：
```typescript
import type { IRepository } from '../core/types'

// Mock Repository（用于 Phase 2 测试）
export function createMockRepository(): IRepository {
  return {
    async getList() {
      return { data: [], total: 0 }
    },
    async getOne() {
      return null
    },
    async createOne(data: any) {
      return { id: '1', ...data }
    },
    async updateOne(id, data) {
      return { id, ...data }
    },
    async deleteOne() {
      return true
    },
    async getMany() {
      return []
    },
    async createMany() {
      return []
    },
    async updateMany() {
      return []
    },
    async deleteMany() {
      return true
    }
  }
}
```

---

## Phase 5: State 层（MobX）实现

**目标**：实现基于 MobX 的响应式状态管理

### 5.1 State 实现

#### 文件清单：
- `src/state/types.ts`
- `src/state/RootStore.ts`
- `src/state/ModelStore.ts`
- `src/state/ViewStore.ts`

#### src/state/ModelStore.ts 内容：
```typescript
import { makeObservable, observable, action, computed } from 'mobx'
import type { IModel } from '../core/defineModel'
import type { GetListParams } from '../core/types'

export class ModelStore {
  @observable
  records: Map<string | number, any> = new Map()

  @observable
  loading: boolean = false

  @observable
  error: Error | null = null

  constructor(private model: IModel) {
    makeObservable(this)
  }

  @action
  async load(params: GetListParams): Promise<void> {
    this.loading = true
    this.error = null

    try {
      // 通过 Model 的 APIs 获取数据
      const result = await this.model.apis.getList?.(params)
      if (result) {
        result.data.forEach(record => {
          this.records.set(record.id, record)
        })
      }
    } catch (error) {
      this.error = error as Error
    } finally {
      this.loading = false
    }
  }

  @computed
  get(id: string | number) {
    return this.records.get(id)
  }

  @computed
  get all() {
    return Array.from(this.records.values())
  }

  @action
  async create(data: any): Promise<any> {
    const record = await this.model.apis.createOne?.(data)
    if (record) {
      this.records.set(record.id, record)
    }
    return record
  }

  @action
  async update(id: string | number, data: any): Promise<any> {
    const record = await this.model.apis.updateOne?.(id, data)
    if (record) {
      this.records.set(id, record)
    }
    return record
  }

  @action
  async delete(id: string | number): Promise<void> {
    await this.model.apis.deleteOne?.(id)
    this.records.delete(id)
  }
}
```

#### src/state/ViewStore.ts 内容：
```typescript
import { makeObservable, observable, action } from 'mobx'

export class ViewStore {
  @observable
  currentView: any | null = null

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
  setView(view: any): void {
    this.currentView = view
  }

  @action
  selectRecord(id: string | number): void {
    this.selectedRecords.add(id)
  }

  @action
  deselectRecord(id: string | number): void {
    this.selectedRecords.delete(id)
  }

  @action
  setFilter(field: string, value: any): void {
    this.filters[field] = value
  }

  @action
  setSort(field: string, order: 'ASC' | 'DESC'): void {
    this.sort = { field, order }
  }
}
```

#### src/state/RootStore.ts 内容：
```typescript
import { ModelStore } from './ModelStore'
import { ViewStore } from './ViewStore'
import { ModelRegistry } from '../core/ModelRegistry'

export class RootStore {
  modelStores: Map<string, ModelStore> = new Map()
  viewStore: ViewStore = new ViewStore()

  getModelStore(modelName: string): ModelStore {
    if (!this.modelStores.has(modelName)) {
      // 从 ModelRegistry 获取 Model
      const model = ModelRegistry.getInstance().get(modelName)
      if (!model) {
        throw new Error(`Model "${modelName}" not found`)
      }

      // 创建新的 ModelStore
      this.modelStores.set(modelName, new ModelStore(model))
    }
    return this.modelStores.get(modelName)!
  }
}
```

---

## Phase 6: Render 层实现

**目标**：实现渲染层，包括 DataRenderer（字段渲染）、ViewRenderer（视图渲染）、ActionRenderer（动作渲染 + 状态管理）

> 📖 **详细设计文档**：参见 `RENDER_LAYER_DESIGN.md`

### 设计概览

Render 层分为三大部分：

1. **DataRenderer**：字段级渲染（基于 Schema 字段类型）
2. **ViewRenderer**：视图级渲染（基于 View 类型）
3. **ActionRenderer**：动作渲染 + 专属状态管理（ViewStack & ActionQueue）

### 6.1 核心类型定义

#### 文件清单：
- `src/render/types.ts` - 核心类型定义
- `src/render/dataTypes.ts` - DataRenderer 类型
- `src/render/viewTypes.ts` - ViewRenderer 类型
- `src/render/actionTypes.ts` - ActionRenderer 类型

#### src/render/types.ts 内容：

```typescript
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
```

#### src/render/dataTypes.ts 内容：

```typescript
import type { RenderContext, RenderDescriptor } from './types'

/**
 * 字段定义
 */
export interface FieldDefinition {
  type: string        // 字段类型：string、number、boolean、date、enum、json、array、belongsTo、hasMany
  name: string        // 字段名称
  label?: string      // 显示标签
  required?: boolean  // 是否必填
  format?: string     // 显示格式
  [key: string]: any  // 扩展属性
}

/**
 * DataRenderer 接口
 * 基于 Schema 字段类型渲染
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
```

#### src/render/viewTypes.ts 内容：

```typescript
import type { RenderContext, RenderDescriptor } from './types'
import type { ActionDefinition } from './actionTypes'

export type ViewType = 'list' | 'form' | 'detail' | 'kanban' | 'calendar' | string

/**
 * View 定义
 */
export interface ViewDefinition {
  type: ViewType
  title?: string
  fields?: string[]
  layout?: string
  columns?: ColumnDefinition[]
  actions?: ActionDefinition[]
  [key: string]: any
}

/**
 * ViewRenderer 接口
 * 基于 View 类型渲染
 */
export interface IViewRenderer {
  /** 支持的视图类型 */
  type: ViewType

  /** 渲染视图 */
  render(view: ViewDefinition, data: any, context: RenderContext): RenderDescriptor
}
```

#### src/render/actionTypes.ts 内容：

```typescript
import type { RenderContext, RenderDescriptor } from './types'

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
export interface IActionRenderer {
  renderMode: 'button' | 'menu' | 'dropdown' | 'toolbar'
  renderServer?(action: ServerActionDefinition, context: RenderContext): RenderDescriptor
  renderView?(action: ViewActionDefinition, context: RenderContext): RenderDescriptor
}
```

### 6.2 ViewStack（视图栈管理）

#### 文件清单：
- `src/render/ViewStack.ts`

**职责**：管理视图导航历史，支持前进/后退。

```typescript
import { makeObservable, observable, computed, action } from 'mobx'
import type { ViewDefinition } from './viewTypes'

export interface ViewStackItem {
  id: string
  type: string
  definition: ViewDefinition
  data?: any
  params?: Record<string, any>
  timestamp: number
}

export interface IViewStack {
  readonly current: ViewStackItem | null
  readonly history: ViewStackItem[]
  readonly canGoBack: boolean
  readonly canGoForward: boolean

  push(view: ViewDefinition, data?: any, params?: Record<string, any>): void
  replace(view: ViewDefinition, data?: any, params?: Record<string, any>): void
  goBack(): ViewStackItem | null
  goForward(): ViewStackItem | null
  goTo(index: number): ViewStackItem | null
  clear(): void
  subscribe(listener: (current: ViewStackItem | null) => void): () => void
}

export class ViewStack implements IViewStack {
  @observable
  private stack: ViewStackItem[] = []

  @observable
  private currentIndex: number = -1

  private listeners: Set<(current: ViewStackItem | null) => void> = new Set()

  constructor() {
    makeObservable(this)
  }

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

  @action
  push(view: ViewDefinition, data?: any, params?: Record<string, any>): void {
    const item: ViewStackItem = {
      id: this.generateId(),
      type: view.type,
      definition: view,
      data,
      params,
      timestamp: Date.now()
    }

    if (this.currentIndex < this.stack.length - 1) {
      this.stack = this.stack.slice(0, this.currentIndex + 1)
    }

    this.stack.push(item)
    this.currentIndex = this.stack.length - 1
    this.notifyListeners()
  }

  @action
  replace(view: ViewDefinition, data?: any, params?: Record<string, any>): void {
    const item: ViewStackItem = {
      id: this.generateId(),
      type: view.type,
      definition: view,
      data,
      params,
      timestamp: Date.now()
    }

    if (this.currentIndex >= 0) {
      this.stack[this.currentIndex] = item
    } else {
      this.stack = [item]
      this.currentIndex = 0
    }
    this.notifyListeners()
  }

  @action
  goBack(): ViewStackItem | null {
    if (this.canGoBack) {
      this.currentIndex--
      this.notifyListeners()
      return this.current
    }
    return null
  }

  @action
  goForward(): ViewStackItem | null {
    if (this.canGoForward) {
      this.currentIndex++
      this.notifyListeners()
      return this.current
    }
    return null
  }

  @action
  goTo(index: number): ViewStackItem | null {
    if (index >= 0 && index < this.stack.length) {
      this.currentIndex = index
      this.notifyListeners()
      return this.current
    }
    return null
  }

  @action
  clear(): void {
    this.stack = []
    this.currentIndex = -1
    this.notifyListeners()
  }

  subscribe(listener: (current: ViewStackItem | null) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.current))
  }

  private generateId(): string {
    return `view_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}
```

### 6.3 ActionQueue（操作队列管理）

#### 文件清单：
- `src/render/ActionQueue.ts`

**职责**：管理 ServerAction 的执行队列，支持并发控制、重试、取消等。

```typescript
import { makeObservable, observable, computed, action, runInAction } from 'mobx'
import type { ServerActionDefinition } from './actionTypes'
import type { RenderContext } from './types'

export type ActionStatus = 'pending' | 'running' | 'success' | 'failed' | 'cancelled'

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

export interface ActionQueueConfig {
  concurrency?: number
  defaultMaxRetries?: number
  timeout?: number
}

export interface IActionQueue {
  readonly pending: ActionTask[]
  readonly running: ActionTask[]
  readonly completed: ActionTask[]
  readonly failed: ActionTask[]

  enqueue(
    action: ServerActionDefinition,
    params: any,
    context: RenderContext,
    options?: { maxRetries?: number }
  ): string

  cancel(taskId: string): boolean
  retry(taskId: string): boolean
  clear(): void
  getTask(taskId: string): ActionTask | undefined
  subscribe(taskId: string, listener: (task: ActionTask) => void): () => void
  subscribeQueue(listener: (queue: IActionQueue) => void): () => void
}

export class ActionQueue implements IActionQueue {
  @observable
  private tasks: Map<string, ActionTask> = new Map()

  @observable
  private runningCount: number = 0

  private config: Required<ActionQueueConfig>
  private taskListeners: Map<string, Set<(task: ActionTask) => void>> = new Map()
  private queueListeners: Set<(queue: IActionQueue) => void> = new Set()

  constructor(config: ActionQueueConfig = {}) {
    this.config = {
      concurrency: config.concurrency || 3,
      defaultMaxRetries: config.defaultMaxRetries || 0,
      timeout: config.timeout || 30000
    }

    makeObservable(this)
  }

  @computed
  get pending(): ActionTask[] {
    return Array.from(this.tasks.values()).filter(t => t.status === 'pending')
  }

  @computed
  get running(): ActionTask[] {
    return Array.from(this.tasks.values()).filter(t => t.status === 'running')
  }

  @computed
  get completed(): ActionTask[] {
    return Array.from(this.tasks.values()).filter(t => t.status === 'success')
  }

  @computed
  get failed(): ActionTask[] {
    return Array.from(this.tasks.values()).filter(t => t.status === 'failed')
  }

  @action
  enqueue(
    action: ServerActionDefinition,
    params: any,
    context: RenderContext,
    options?: { maxRetries?: number }
  ): string {
    const task: ActionTask = {
      id: this.generateTaskId(),
      action,
      params,
      context,
      status: 'pending',
      createdAt: Date.now(),
      retryCount: 0,
      maxRetries: options?.maxRetries ?? this.config.defaultMaxRetries
    }

    this.tasks.set(task.id, task)
    this.notifyQueueListeners()
    this.processQueue()

    return task.id
  }

  @action
  cancel(taskId: string): boolean {
    const task = this.tasks.get(taskId)
    if (!task || (task.status !== 'pending' && task.status !== 'running')) {
      return false
    }

    task.status = 'cancelled'
    task.completedAt = Date.now()
    this.notifyTaskListeners(taskId, task)
    this.notifyQueueListeners()
    return true
  }

  @action
  retry(taskId: string): boolean {
    const task = this.tasks.get(taskId)
    if (!task || task.status !== 'failed') return false

    task.status = 'pending'
    task.error = undefined
    task.retryCount++
    this.notifyTaskListeners(taskId, task)
    this.notifyQueueListeners()
    this.processQueue()
    return true
  }

  @action
  clear(): void {
    this.tasks.clear()
    this.runningCount = 0
    this.notifyQueueListeners()
  }

  getTask(taskId: string): ActionTask | undefined {
    return this.tasks.get(taskId)
  }

  subscribe(taskId: string, listener: (task: ActionTask) => void): () => void {
    if (!this.taskListeners.has(taskId)) {
      this.taskListeners.set(taskId, new Set())
    }
    this.taskListeners.get(taskId)!.add(listener)
    return () => this.taskListeners.get(taskId)?.delete(listener)
  }

  subscribeQueue(listener: (queue: IActionQueue) => void): () => void {
    this.queueListeners.add(listener)
    return () => this.queueListeners.delete(listener)
  }

  private async processQueue(): Promise<void> {
    if (this.runningCount >= this.config.concurrency) return

    const nextTask = this.pending[0]
    if (!nextTask) return

    await this.executeTask(nextTask)
    this.processQueue()
  }

  @action
  private async executeTask(task: ActionTask): Promise<void> {
    task.status = 'running'
    task.startedAt = Date.now()
    this.runningCount++
    this.notifyTaskListeners(task.id, task)
    this.notifyQueueListeners()

    try {
      const result = await Promise.race([
        task.context.model.actions[task.action.name](task.params),
        this.timeout(this.config.timeout)
      ])

      runInAction(() => {
        task.status = 'success'
        task.result = result
        task.completedAt = Date.now()
        this.runningCount--
      })

      task.action.onSuccess?.(result, task.context)

    } catch (error) {
      runInAction(() => {
        task.error = error as Error
        this.runningCount--

        if (task.retryCount < task.maxRetries) {
          task.status = 'pending'
          task.retryCount++
        } else {
          task.status = 'failed'
          task.completedAt = Date.now()
        }
      })

      if (task.status === 'failed') {
        task.action.onError?.(error as Error, task.context)
      }
    }

    this.notifyTaskListeners(task.id, task)
    this.notifyQueueListeners()
  }

  private timeout(ms: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Action timeout')), ms)
    })
  }

  private notifyTaskListeners(taskId: string, task: ActionTask): void {
    this.taskListeners.get(taskId)?.forEach(listener => listener(task))
  }

  private notifyQueueListeners(): void {
    this.queueListeners.forEach(listener => listener(this))
  }

  private generateTaskId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}
```

### 6.4 RenderEngine（统一管理）

#### 文件清单：
- `src/render/RenderEngine.ts`

```typescript
import { makeObservable } from 'mobx'
import type { IDataRenderer, FieldDefinition } from './dataTypes'
import type { IViewRenderer, ViewDefinition } from './viewTypes'
import type { IActionRenderer, ActionDefinition, ServerActionDefinition, ViewActionDefinition } from './actionTypes'
import type { RenderContext, RenderDescriptor } from './types'
import type { IModel } from '../core/defineModel'
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
```

### 6.5 测试文件

#### 文件清单：
- `tests/render/ViewStack.test.ts`
- `tests/render/ActionQueue.test.ts`
- `tests/render/RenderEngine.test.ts`

---

## Phase 7: 事件系统实现

**目标**：实现事件总线，支持事件发布和订阅

### 7.1 事件系统

#### 文件清单：
- `src/event/types.ts`
- `src/event/EventBus.ts`

#### src/event/types.ts 内容：
```typescript
export enum EventType {
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

export interface IEvent {
  type: EventType | string
  payload: any
  timestamp: number
  source?: string
}
```

#### src/event/EventBus.ts 内容：
```typescript
import EventEmitter from 'eventemitter3'
import type { IEvent } from './types'

export class EventBus extends EventEmitter {
  private static instance: EventBus

  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus()
    }
    return EventBus.instance
  }

  publish(event: IEvent): void {
    this.emit(event.type, event)
  }

  subscribe(eventType: string, handler: (event: IEvent) => void): () => void {
    this.on(eventType, handler)

    // 返回取消订阅函数
    return () => this.off(eventType, handler)
  }

  subscribeOnce(eventType: string, handler: (event: IEvent) => void): void {
    this.once(eventType, handler)
  }
}

// 导出全局单例
export function getEventBus(): EventBus {
  return EventBus.getInstance()
}
```

---

## Phase 8: 集成测试与示例

**目标**：编写集成测试和使用示例

### 8.1 示例代码

#### 文件清单：
- `examples/basic/http-basic.ts`
- `examples/basic/model-basic.ts`
- `examples/advanced/custom-url-mapper.ts`
- `examples/integration/react-integration.tsx`

### 8.2 测试文件

#### 文件清单：
- `tests/integration/crud-flow.test.ts`
- `tests/integration/full-engine.test.ts`

---

## 导出文件

#### src/index.ts 内容：
```typescript
// Core
export * from './core/types'
export * from './core/defineModel'
export * from './core/BaseModel'
export * from './core/ModelRegistry'
export * from './core/ModelExecutor'
export * from './core/EngineContext'

// Data Access
export * from './data-access/interfaces/IDataAccessClient'
export * from './data-access/interfaces/IUrlMapper'
export * from './data-access/http/HttpDataAccessClient'
export * from './data-access/http/RestUrlMapper'

// Repository
export * from './repository/Repository'
export * from './repository/CacheStrategy'

// State
export * from './state/RootStore'
export * from './state/ModelStore'
export * from './state/ViewStore'

// Render
export * from './render/RenderRegistry'

// Event
export * from './event/EventBus'
export * from './event/types'

// DI
export * from './di/Container'
export * from './di/types'
export * from './di/decorators'
```

---

## 里程碑时间线

| 阶段 | 预计时间 | 交付物 |
|------|---------|--------|
| Phase 1 | 2-3 天 | 项目初始化、类型系统、DI 容器 |
| Phase 2 | 3-4 天 | Model 层完整实现 + 测试 |
| Phase 3 | 4-5 天 | HTTP Data Access Layer + 测试 |
| Phase 4 | 2-3 天 | Repository 层 + 缓存策略 |
| Phase 5 | 3-4 天 | MobX State 层 + 测试 |
| Phase 6 | 2-3 天 | Render 注册表 |
| Phase 7 | 1-2 天 | 事件系统 |
| Phase 8 | 3-4 天 | 集成测试 + 示例代码 |

**总计**: 约 20-28 天

---

## 成功标准

1. ✅ 所有核心功能实现并通过单元测试
2. ✅ 函数式优先设计：APIs/Actions/Views 按设计文档实现
3. ✅ Data Access Layer 支持 HTTP，架构可扩展
4. ✅ 完整的 TypeScript 类型支持
5. ✅ 至少 80% 的代码覆盖率
6. ✅ 完整的使用示例和文档
7. ✅ 通过集成测试验证完整 CRUD 流程

---

## 下一步行动

1. **立即开始 Phase 1**：建立项目基础
2. **设置开发环境**：安装依赖、配置工具
3. **创建 Git 分支**：feature/engine-implementation
4. **逐步实现**：按照 Phase 顺序推进

---

## 注意事项

- 每个 Phase 完成后进行代码评审
- 保持测试驱动开发（TDD）
- 及时更新文档
- 定期进行集成测试
- 注意性能优化和内存管理

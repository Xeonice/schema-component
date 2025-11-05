# React Connector 核心代码片段参考

## 1. 核心接口定义

### IApiLayer 接口
**文件**: `src/context/RenderContext.tsx:18-24`

```typescript
export interface IApiLayer {
  getList(params?: any): Promise<any[]>
  getOne(id: string | number): Promise<any>
  create(data: any): Promise<any>
  update(id: string | number, data: any): Promise<any>
  delete(id: string | number): Promise<void>
}
```

**用途**: 定义标准的 CRUD API 操作接口

---

### IRenderDescriptorConverter 接口
**文件**: `src/context/RenderContext.tsx:29-31`

```typescript
export interface IRenderDescriptorConverter {
  convert(descriptor: RenderDescriptor): React.ReactElement
}
```

**用途**: 定义 RenderDescriptor 到 React 元素的转换契约

---

### IReactRenderContext 接口
**文件**: `src/context/RenderContext.tsx:36-52`

```typescript
export interface IReactRenderContext {
  // 继承 Engine 的 context
  engineContext: EngineRenderContext

  // API 层
  api: IApiLayer

  // 转换器
  converter: IRenderDescriptorConverter

  // 核心渲染方法 - 直接调用 Engine 层并转换结果
  renderView(view: ViewDefinition, options?: { id?: string | number; params?: any }): React.ReactElement
  renderGroup(group: GroupDefinition, data: any): React.ReactElement
  renderField(field: FieldDefinition, data: FieldRenderData, context?: Partial<FieldRenderContext>): React.ReactElement
  renderData(definition: DataDefinition, value: any): React.ReactElement
  renderAction(action: ActionDefinition): React.ReactElement
}
```

**核心**: React Connector 对外暴露的主要接口

---

## 2. API 层实现

### ApiLayer 类完整实现
**文件**: `src/context/RenderContext.tsx:57-100`

```typescript
class ApiLayer implements IApiLayer {
  constructor(private engineContext: EngineRenderContext) {}

  async getList(params?: any): Promise<any[]> {
    const model = this.engineContext.model
    if (!model || !model.apis || !model.apis.getList) {
      throw new Error(`No getList API found in model: ${this.engineContext.modelName}`)
    }
    const result = await model.apis.getList(params)
    return result.data || result
  }

  async getOne(id: string | number): Promise<any> {
    const model = this.engineContext.model
    if (!model || !model.apis || !model.apis.getOne) {
      throw new Error(`No getOne API found in model: ${this.engineContext.modelName}`)
    }
    return await model.apis.getOne(id)
  }

  async create(data: any): Promise<any> {
    const model = this.engineContext.model
    if (!model || !model.apis || !model.apis.create) {
      throw new Error(`No create API found in model: ${this.engineContext.modelName}`)
    }
    return await model.apis.create(data)
  }

  async update(id: string | number, data: any): Promise<any> {
    const model = this.engineContext.model
    if (!model || !model.apis || !model.apis.update) {
      throw new Error(`No update API found in model: ${this.engineContext.modelName}`)
    }
    return await model.apis.update(id, data)
  }

  async delete(id: string | number): Promise<void> {
    const model = this.engineContext.model
    if (!model || !model.apis || !model.apis.delete) {
      throw new Error(`No delete API found in model: ${this.engineContext.modelName}`)
    }
    return await model.apis.delete(id)
  }
}
```

**关键点**:
- 完全依赖 `engineContext.model.apis` 的实现
- 不做任何业务逻辑处理，只是转发
- 提供一致的错误处理

---

## 3. 转换器实现

### RenderDescriptorConverter 类
**文件**: `src/context/RenderContext.tsx:105-123`

```typescript
class RenderDescriptorConverter implements IRenderDescriptorConverter {
  convert(descriptor: RenderDescriptor): React.ReactElement {
    const { component, props = {}, children, key } = descriptor

    // 递归转换子元素
    const reactChildren = children?.map((child, index) => {
      if (typeof child === 'string') {
        return child
      }
      return this.convert({
        ...child,
        key: child.key ?? index
      })
    })

    // 创建 React 元素
    return React.createElement(component, { key, ...props }, ...reactChildren || [])
  }
}
```

**关键点**:
- 递归处理嵌套结构
- 区分字符串和 RenderDescriptor 子元素
- 使用 React.createElement 创建元素

---

## 4. 上下文实现

### ReactRenderContext 类
**文件**: `src/context/RenderContext.tsx:128-189`

```typescript
class ReactRenderContext implements IReactRenderContext {
  public api: IApiLayer
  public converter: IRenderDescriptorConverter

  constructor(public engineContext: EngineRenderContext) {
    this.api = new ApiLayer(engineContext)
    this.converter = new RenderDescriptorConverter()
  }

  renderView(view: ViewDefinition, options?: { id?: string | number; params?: any }): React.ReactElement {
    // 直接调用 Engine 的渲染方法
    const renderEngine = RenderEngine.getInstance()
    const descriptor = renderEngine.renderView(view, {}, this.engineContext)
    return this.converter.convert(descriptor)
  }

  renderGroup(group: GroupDefinition, data: any): React.ReactElement {
    // 直接调用 Engine 的渲染方法
    const renderEngine = RenderEngine.getInstance()
    const descriptor = renderEngine.renderGroup(group, data, this.engineContext)
    return this.converter.convert(descriptor)
  }

  renderField(field: FieldDefinition, data: FieldRenderData, context?: Partial<FieldRenderContext>): React.ReactElement {
    // 构建字段上下文
    const fieldContext: FieldRenderContext = {
      ...this.engineContext,
      mode: context?.mode || 'view',
      required: context?.required || field.required,
      disabled: context?.disabled || false,
      errors: context?.errors || []
    }

    // 直接调用 Engine 的渲染方法
    const renderEngine = RenderEngine.getInstance()
    const descriptor = renderEngine.renderField(
      field,
      data.value,
      data.record,
      fieldContext
    )
    return this.converter.convert(descriptor)
  }

  renderData(definition: DataDefinition, value: any): React.ReactElement {
    // 直接调用 Engine 的渲染方法
    const renderEngine = RenderEngine.getInstance()
    const descriptor = renderEngine.renderData(
      definition,
      value,
      this.engineContext
    )
    return this.converter.convert(descriptor)
  }

  renderAction(action: ActionDefinition): React.ReactElement {
    // 直接调用 Engine 的渲染方法
    const renderEngine = RenderEngine.getInstance()
    const descriptor = renderEngine.renderAction(action, this.engineContext)
    return this.converter.convert(descriptor)
  }
}
```

**核心设计**:
- 统一的模式：Engine 调用 → 获取 Descriptor → 转换 → 返回
- renderField 额外处理上下文合并
- 所有方法都获取 RenderEngine 单例

---

## 5. Provider 实现

### RenderContextProvider 组件
**文件**: `src/context/RenderContext.tsx:207-218`

```typescript
export const RenderContextProvider: React.FC<RenderContextProviderProps> = ({
  engineContext,
  children
}) => {
  const [context] = React.useState(() => new ReactRenderContext(engineContext))

  return (
    <RenderContext.Provider value={context}>
      {children}
    </RenderContext.Provider>
  )
}
```

**关键设计**:
- 使用 `useState` 的初始化函数，确保只创建一次实例
- 不依赖 useCallback，因为 context 本身是稳定的
- 简洁而高效

---

## 6. Hooks 实现

### useRenderContext Hook
**文件**: `src/context/RenderContext.tsx:223-229`

```typescript
export const useRenderContext = (): IReactRenderContext => {
  const context = useContext(RenderContext)
  if (!context) {
    throw new Error('useRenderContext must be used within a RenderContextProvider')
  }
  return context
}
```

### useApi Hook
**文件**: `src/context/RenderContext.tsx:234-237`

```typescript
export const useApi = (): IApiLayer => {
  const context = useRenderContext()
  return context.api
}
```

### useConverter Hook
**文件**: `src/context/RenderContext.tsx:242-245`

```typescript
export const useConverter = (): IRenderDescriptorConverter => {
  const context = useRenderContext()
  return context.converter
}
```

**特点**:
- 都依赖于 useRenderContext
- 提供便捷的访问方式
- 包含错误检查

---

## 7. React Context 创建

### RenderContext Context 对象
**文件**: `src/context/RenderContext.tsx:194`

```typescript
const RenderContext = createContext<IReactRenderContext | undefined>(undefined)
```

**说明**:
- 初始值为 undefined
- useRenderContext 会检查并报错如果未初始化

---

## 8. Props 接口

### RenderContextProviderProps 接口
**文件**: `src/context/RenderContext.tsx:199-202`

```typescript
export interface RenderContextProviderProps {
  engineContext: EngineRenderContext
  children: ReactNode
}
```

---

## 9. 导出列表

### src/context/index.ts
**文件**: `src/context/index.ts:1`

```typescript
export * from './RenderContext'
```

### src/index.ts
**文件**: `src/index.ts:1-62`

```typescript
// Context and Core Interfaces
export {
  RenderContextProvider,
  useRenderContext,
  useApi,
  useConverter,
  type IReactRenderContext,
  type IApiLayer,
  type IRenderDescriptorConverter
} from './context/RenderContext'

// Re-export Engine types for convenience
export type {
  RenderViewDefinition as ViewDefinition,
  GroupDefinition,
  FieldDefinition,
  DataDefinition,
  ActionDefinition,
  FieldRenderData,
  FieldRenderContext,
  RenderContext as EngineRenderContext
} from '@schema-component/engine'
```

---

## 10. 完整数据流示例

### 从 React 到 Engine 再到 DOM

```typescript
// 1. 在组件中
function MyComponent() {
  const context = useRenderContext()  // 获取 ReactRenderContext
  const api = useApi()               // 获取 ApiLayer

  // 2. 获取数据
  const data = await api.getList()   // → ApiLayer.getList()
                                      // → engineContext.model.apis.getList()
                                      // → Promise<any[]>

  // 3. 渲染视图
  const element = context.renderView(viewDef)
  // → RenderEngine.getInstance().renderView()
  // → RendererRegistry.get('view', viewType)
  // → IViewRenderer.render()
  // → RenderDescriptor { component, props, children }
  // → converter.convert(descriptor)
  // → React.createElement()
  // → React.ReactElement

  return element
}
```

---

## 11. 关键设计模式

### Bridge Pattern（桥接模式）

```
React API (Hooks)
    ↓
RenderContextProvider (Bridge)
    ↓
Engine 层 (RenderEngine, RendererRegistry)
```

**效果**: Engine 不知道 React，React 可以无缝使用 Engine

### Adapter Pattern（适配器模式）

```
Engine.model.apis (异步但结构不同)
    ↓
ApiLayer (Adapter)
    ↓
IApiLayer (标准 Promise API)
```

**效果**: 统一的 CRUD 接口

### Converter Pattern（转换模式）

```
RenderDescriptor (通用数据结构)
    ↓
RenderDescriptorConverter (Converter)
    ↓
React.ReactElement (框架特定)
```

**效果**: Engine 输出可转换为任何框架的元素

---

## 12. 性能优化点

### 1. Context 初始化优化
```typescript
const [context] = React.useState(() => new ReactRenderContext(engineContext))
// 只在 Provider 首次挂载时执行，不会在每次 render 时重新创建
```

### 2. 转换器的递归优化
```typescript
const reactChildren = children?.map((child, index) => {
  if (typeof child === 'string') {
    return child  // 直接返回，不递归
  }
  return this.convert(...)  // 只递归转换 RenderDescriptor
})
```

### 3. Engine 单例模式
```typescript
const renderEngine = RenderEngine.getInstance()
// 每次调用都返回同一实例，避免重复初始化
```

---

## 13. 错误处理

### API 层的错误处理
```typescript
async getList(params?: any): Promise<any[]> {
  const model = this.engineContext.model
  if (!model || !model.apis || !model.apis.getList) {
    throw new Error(`No getList API found in model: ${this.engineContext.modelName}`)
  }
  // ...
}
```

**特点**:
- 清晰的错误信息，包含 modelName
- 早期报错，避免后续异常

### Hook 的错误处理
```typescript
export const useRenderContext = (): IReactRenderContext => {
  const context = useContext(RenderContext)
  if (!context) {
    throw new Error('useRenderContext must be used within a RenderContextProvider')
  }
  return context
}
```

**特点**:
- 防止在 Provider 外使用
- 清晰的错误提示

---

## 总结

| 部分 | 代码行 | 作用 |
|------|--------|------|
| 接口定义 | 18-52 | 定义契约 |
| ApiLayer | 57-100 | 转发 API 调用 |
| Converter | 105-123 | 转换描述符 |
| ReactRenderContext | 128-189 | 核心实现 |
| React Context | 194 | 全局状态 |
| Provider | 207-218 | 提供上下文 |
| useRenderContext | 223-229 | 获取上下文 |
| useApi | 234-237 | 快捷访问 API |
| useConverter | 242-245 | 快捷访问转换器 |


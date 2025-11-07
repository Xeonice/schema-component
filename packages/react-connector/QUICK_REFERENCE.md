# React Connector 快速参考指南

## 一句话概括

React Connector 是 Engine 与 React 的纯桥接层，通过 Context 和 Hooks 提供渲染和数据访问能力。

---

## 核心导出

### 组件
```typescript
import { RenderContextProvider } from '@schema-component/react-connector'
```

### Hooks
```typescript
import { useRenderContext, useApi, useConverter } from '@schema-component/react-connector'
```

### 接口
```typescript
import type {
  IReactRenderContext,
  IApiLayer,
  IRenderDescriptorConverter
} from '@schema-component/react-connector'
```

---

## 五分钟快速开始

### 步骤 1: 初始化 Provider

```typescript
import { RenderContextProvider } from '@schema-component/react-connector'

function App() {
  const engineContext = {
    modelName: 'User',
    model: userModel,
    viewStack: engine.viewStack,
    actionQueue: engine.actionQueue
  }

  return (
    <RenderContextProvider engineContext={engineContext}>
      <YourApp />
    </RenderContextProvider>
  )
}
```

### 步骤 2: 在组件中使用

```typescript
import { useRenderContext, useApi } from '@schema-component/react-connector'

function UserList() {
  const context = useRenderContext()
  const api = useApi()

  // 获取数据
  const data = await api.getList()

  // 渲染视图
  return context.renderView(viewDefinition)
}
```

---

## 核心接口

### IReactRenderContext

```typescript
interface IReactRenderContext {
  engineContext: EngineRenderContext    // Engine 上下文
  api: IApiLayer                         // API 层
  converter: IRenderDescriptorConverter  // 转换器

  // 五个核心渲染方法
  renderView(view: ViewDefinition, options?: any): React.ReactElement
  renderGroup(group: GroupDefinition, data: any): React.ReactElement
  renderField(field: FieldDefinition, data: FieldRenderData, context?: any): React.ReactElement
  renderData(definition: DataDefinition, value: any): React.ReactElement
  renderAction(action: ActionDefinition): React.ReactElement
}
```

### IApiLayer

```typescript
interface IApiLayer {
  getList(params?: any): Promise<any[]>
  getOne(id: string | number): Promise<any>
  create(data: any): Promise<any>
  update(id: string | number, data: any): Promise<any>
  delete(id: string | number): Promise<void>
}
```

---

## 常用模式

### 模式 1: 获取上下文并渲染

```typescript
function MyView() {
  const context = useRenderContext()
  
  // 直接渲染视图
  return context.renderView(myViewDefinition, { id: 123 })
}
```

### 模式 2: 使用 API 层

```typescript
function DataFetching() {
  const api = useApi()
  const [data, setData] = useState(null)

  useEffect(() => {
    api.getList({ page: 1, limit: 10 }).then(setData)
  }, [api])

  return <div>{JSON.stringify(data)}</div>
}
```

### 模式 3: 手动转换 RenderDescriptor

```typescript
function CustomRender() {
  const converter = useConverter()
  
  // 假设从某处获得了 RenderDescriptor
  const descriptor = getDescriptorFromEngine()
  
  // 手动转换
  const element = converter.convert(descriptor)
  
  return element
}
```

### 模式 4: 组合使用

```typescript
function CompleteExample() {
  const context = useRenderContext()
  const api = useApi()
  const [record, setRecord] = useState(null)

  // 获取数据
  useEffect(() => {
    api.getOne(123).then(setRecord)
  }, [api])

  // 如果有数据，渲染字段
  if (record) {
    return context.renderField(
      fieldDef,
      { value: record.name, record },
      { mode: 'edit' }
    )
  }

  return <div>Loading...</div>
}
```

---

## 渲染方法对照表

| 方法 | 输入 | 输出 | 场景 |
|------|------|------|------|
| `renderView()` | ViewDefinition | React.ReactElement | 渲染整个视图（列表、表单等） |
| `renderGroup()` | GroupDefinition, data | React.ReactElement | 渲染分组容器（卡片、折叠框等） |
| `renderField()` | FieldDefinition, FieldRenderData | React.ReactElement | 渲染单个字段 |
| `renderData()` | DataDefinition, value | React.ReactElement | 渲染数据值（字符串、日期等） |
| `renderAction()` | ActionDefinition | React.ReactElement | 渲染动作按钮 |

---

## Hook 对照表

| Hook | 返回类型 | 说明 |
|------|---------|------|
| `useRenderContext()` | `IReactRenderContext` | 获取完整上下文 |
| `useApi()` | `IApiLayer` | 获取 API 层 |
| `useConverter()` | `IRenderDescriptorConverter` | 获取转换器 |

---

## RenderDescriptor 结构

```typescript
interface RenderDescriptor {
  component: string                    // 组件名称，如 'div', 'button'
  props: Record<string, any>          // 组件属性
  children?: (RenderDescriptor | string)[]  // 子元素
  key?: string | number                // React key
}
```

### 转换示例

```typescript
// Input: RenderDescriptor
{
  component: 'button',
  props: { className: 'btn-primary', onClick: () => {} },
  children: ['点击我']
}

// Output: React.ReactElement
<button className="btn-primary" onClick={() => {}}>
  点击我
</button>
```

---

## 常见错误

### 错误 1: 在 Provider 外使用 Hook

```typescript
// ❌ 错误
function App() {
  const context = useRenderContext()  // 报错！
  return <div />
}

// ✅ 正确
function App() {
  return (
    <RenderContextProvider engineContext={ctx}>
      <MyComponent />
    </RenderContextProvider>
  )
}

function MyComponent() {
  const context = useRenderContext()  // 正确
  return <div />
}
```

### 错误 2: 忘记传递必要的 engineContext

```typescript
// ❌ 错误
<RenderContextProvider>
  <App />
</RenderContextProvider>

// ✅ 正确
<RenderContextProvider engineContext={engineContext}>
  <App />
</RenderContextProvider>
```

### 错误 3: 错误地调用异步 API

```typescript
// ❌ 错误（忘记 await）
const data = api.getList()  // 这是 Promise，不是数据

// ✅ 正确
const data = await api.getList()

// ✅ 或在 useEffect 中
useEffect(() => {
  api.getList().then(data => setData(data))
}, [api])
```

---

## 文件位置

| 文件 | 行数 | 说明 |
|------|------|------|
| `src/index.ts` | 62 | 导出入口 |
| `src/context/index.ts` | 1 | Context 导出 |
| `src/context/RenderContext.tsx` | 245 | **核心实现** |

---

## 版本信息

- **包名**: `@schema-component/react-connector`
- **版本**: 0.1.0
- **React 版本**: >=16.8.0（需要 Hooks）
- **Engine 依赖**: `@schema-component/engine`

---

## 关键术语

| 术语 | 解释 |
|------|------|
| **RenderDescriptor** | 框架无关的渲染描述对象，包含组件名、属性、子元素 |
| **RenderContext** | 包含 Model、ViewStack、ActionQueue 等的上下文对象 |
| **ApiLayer** | 提供 CRUD 操作的 API 层，桥接到 Model 的 APIs |
| **Converter** | 将 RenderDescriptor 转换为 React 元素的转换器 |
| **Provider** | React Context Provider，提供上下文给子组件 |

---

## 与 Engine 的关系

```
React 组件
    ↓ useRenderContext()
RenderContextProvider (React Connector)
    ↓ 包装
RenderEngine.getInstance() (Engine 层)
    ↓ 调用
RendererRegistry (Engine 层)
    ↓ 查找
具体渲染器实现 (来自组件库)
    ↓ 返回
RenderDescriptor (纯数据)
    ↓ converter.convert()
React.ReactElement
    ↓
React 渲染
DOM
```

---

## 性能建议

1. **Context 稳定性**: Provider 中的 engineContext 应该保持稳定，避免每次渲染都改变
   ```typescript
   // ❌ 不好：每次渲染都创建新对象
   <RenderContextProvider engineContext={{ modelName: 'User', model }}>
   
   // ✅ 好：使用 useMemo 或在组件外部创建
   const engineContext = useMemo(() => ({ ... }), [...])
   <RenderContextProvider engineContext={engineContext}>
   ```

2. **Hook 依赖**: 在 useEffect 中使用 api/context 时，正确设置依赖
   ```typescript
   useEffect(() => {
     api.getList()
   }, [api])  // api 是稳定的，但这样写是正确的做法
   ```

3. **RenderDescriptor 缓存**: 如果 RenderDescriptor 重复，考虑缓存转换结果
   ```typescript
   const element = useMemo(() => converter.convert(descriptor), [descriptor, converter])
   ```

---

## 调试技巧

### 1. 检查上下文

```typescript
function Debug() {
  const context = useRenderContext()
  console.log('engineContext:', context.engineContext)
  console.log('api:', context.api)
  console.log('converter:', context.converter)
  return <div>Check console</div>
}
```

### 2. 检查 RenderDescriptor

```typescript
function DebugRender() {
  const context = useRenderContext()
  const renderEngine = RenderEngine.getInstance()
  
  // 直接调用 Engine，查看输出
  const descriptor = renderEngine.renderView(viewDef, {}, context.engineContext)
  console.log('RenderDescriptor:', descriptor)
  
  return context.converter.convert(descriptor)
}
```

### 3. 检查 API

```typescript
async function DebugAPI() {
  const api = useApi()
  try {
    const list = await api.getList({ page: 1 })
    console.log('API Response:', list)
  } catch (error) {
    console.error('API Error:', error)
  }
}
```


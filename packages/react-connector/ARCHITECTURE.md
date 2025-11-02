# React Connector 架构

## 定位

React Connector 是一个**纯桥接层**，不包含任何具体的 UI 组件实现或渲染器实现。

## 核心职责

1. **React Context 管理** - 提供 React Context，继承上层 Engine Context
2. **API 层桥接** - 从 Engine Model 获取 API 实现（getList/getOne/create/update/delete）
3. **RenderDescriptor 转换** - 将 Engine 输出的 RenderDescriptor 转换为 React 元素
4. **渲染调用桥接** - 直接调用 Engine 的渲染方法并转换结果

## 架构设计

```
┌─────────────────────────────────────┐
│         Engine Layer                 │
│  (Models, APIs, Renderer Registry)   │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│      React Connector (Bridge)        │
│  - React Context                     │
│  - API Layer (getList/getOne/etc)    │
│  - RenderDescriptor Converter        │
│  - Direct Engine Call Bridging       │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│    Component Libraries (注册到Engine)  │
│  - @schema-component/antd-components │
│  - @schema-component/mui-components  │
│  - Custom implementations            │
│  (这些库向 Engine 注册具体渲染器实现)     │
└─────────────────────────────────────┘
```

## 接口定义

### API 层接口

```typescript
// API 层接口 - 桥接到 Engine Model APIs
interface IApiLayer {
  getList(params?: any): Promise<any[]>
  getOne(id: string | number): Promise<any>
  create(data: any): Promise<any>
  update(id: string | number, data: any): Promise<any>
  delete(id: string | number): Promise<void>
}
```

### RenderDescriptor 转换器接口

```typescript
// RenderDescriptor 转换器接口 - 转换 Engine 输出为 React 元素
interface IRenderDescriptorConverter {
  convert(descriptor: RenderDescriptor): React.ReactElement
}
```

### React 渲染上下文接口

```typescript
// React 渲染上下文接口 - 纯桥接功能
interface IReactRenderContext {
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

## 渲染流程

React Connector 作为纯桥接层，不处理具体的渲染逻辑，而是直接调用 Engine 层的渲染方法并转换结果：

1. **renderView()**
   - 直接调用 `engineContext.model.renderEngine.renderView()`
   - 获得 RenderDescriptor 结果
   - 通过 converter 转换为 React 元素

2. **renderGroup()**
   - 直接调用 `engineContext.model.renderEngine.renderGroup()`
   - 获得 RenderDescriptor 结果
   - 通过 converter 转换为 React 元素

3. **renderField()**
   - 直接调用 `engineContext.model.renderEngine.renderField()`
   - 获得 RenderDescriptor 结果
   - 通过 converter 转换为 React 元素

4. **renderData()**
   - 直接调用 `engineContext.model.renderEngine.renderData()`
   - 获得 RenderDescriptor 结果
   - 通过 converter 转换为 React 元素

5. **renderAction()**
   - 直接调用 `engineContext.model.renderEngine.renderAction()`
   - 获得 RenderDescriptor 结果
   - 通过 converter 转换为 React 元素

所有具体的渲染器实现都在 Engine 层的 renderer registry 中，由下层组件库负责注册。

## API 层集成

```typescript
class ApiLayer implements IApiLayer {
  async getList(params?: any): Promise<any[]> {
    const model = this.engineContext.model
    return await model.apis.getList(params)
  }

  async getOne(id: string | number): Promise<any> {
    const model = this.engineContext.model
    return await model.apis.getOne(id)
  }

  // create, update, delete...
}
```

## 使用示例

### 1. 应用层设置

```typescript
import { RenderContextProvider } from '@schema-component/react-connector'

function App() {
  return (
    <RenderContextProvider engineContext={engineContext}>
      <MyApp />
    </RenderContextProvider>
  )
}
```

### 2. 使用渲染（直接桥接到 Engine）

```typescript
function MyApp() {
  const context = useRenderContext()

  // 渲染列表视图 - Connector 桥接调用 Engine，Engine 查找注册的渲染器
  const listView = context.renderView(listViewDefinition)

  // 渲染详情视图 - 自动调用 getOne API，Engine 处理具体渲染
  const detailView = context.renderView(detailViewDefinition, { id: 123 })

  return (
    <div>
      {listView}
      {detailView}
    </div>
  )
}
```

注意：具体的渲染器实现需要在 Engine 层注册，通常由下层组件库完成：

```typescript
// 在 @schema-component/antd-components 中
import { engineInstance } from '@schema-component/engine'

// 向 Engine 注册具体实现
engineInstance.registry.registerViewRenderer('list', AntdListViewRenderer)
engineInstance.registry.registerDataRenderer('string', AntdStringDataRenderer)
// ...
```

## RenderDescriptor 转换

React Connector 的核心功能是将 Engine 输出的 RenderDescriptor 转换为 React 元素：

### RenderDescriptor 结构

```typescript
interface RenderDescriptor {
  component: string | React.ComponentType
  props?: Record<string, any>
  children?: (RenderDescriptor | string)[]
  key?: string | number
}
```

### 转换过程

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

## 关键点

1. **纯桥接设计** - 不包含任何具体实现，只做 Engine 和 React 之间的桥接
2. **直接调用 Engine** - 所有渲染方法直接调用 Engine 的对应方法
3. **RenderDescriptor 转换** - 将 Engine 的输出转换为 React 元素
4. **API 层桥接** - 从 Engine Model 获取 API 并暴露给上层应用
5. **Context 传递** - 继承并传递 Engine Context
6. **无状态转换** - 转换过程无副作用，保持函数式设计

## 下层实现要求

下层组件库（如 antd-components）需要：

1. 向 Engine 的 renderer registry 注册具体的渲染器实现
2. 渲染器实现需要返回 RenderDescriptor 结构
3. 不需要了解 React 相关逻辑，只需专注于组件描述
4. 可以利用 Engine 提供的 context 和 API 访问能力
5. 通过 Engine 的标准接口进行注册和查找
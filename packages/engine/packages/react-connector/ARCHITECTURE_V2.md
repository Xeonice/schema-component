# React Connector 架构 V2

## 概述

React Connector 作为桥接层，连接 Schema Component Engine 和 React UI 组件，提供了完整的渲染体系和 API 集成。

## 架构设计

### 1. 核心职责

- **React Context 管理**：继承上层 IoC Context，提供 React 特定的渲染服务
- **API 层集成**：从 Engine Model 获取 API 实现（getList/getOne/create/update/delete）
- **渲染器注册管理**：管理不同类型的 React 渲染器
- **桥接层**：连接抽象定义和具体 React 组件

### 2. 文件结构

```
src/
  context/
    - RenderContext.tsx     # React Context + API 层集成
  renderers/
    view/
      - ListViewRenderer.tsx      # 列表视图（调用 getList）
      - ObjectViewRenderer.tsx    # 对象视图（调用 getOne）
    group/
      - CardGroupRenderer.tsx     # 卡片分组
    field/
      - VerticalFieldRenderer.tsx # 垂直字段布局
    data/
      - StringDataRenderer.tsx    # 字符串数据
    - index.ts             # 渲染器注册
  - index.ts              # 主入口
```

### 3. 渲染层次结构

```
ViewRenderer (API调用)
  ↓ (迭代 groups)
GroupRenderer 
  ↓ (迭代 fields)
FieldRenderer
  ↓ (渲染数据)
DataRenderer
```

### 4. 核心接口

#### IReactRenderContext
```typescript
interface IReactRenderContext {
  engineContext: EngineRenderContext  // 继承 Engine Context
  registry: IRendererRegistry         // 渲染器注册表
  api: IApiLayer                      // API 层
  
  renderView(view: ViewDefinition, options?: { id?: string | number; params?: any }): React.ReactElement
  renderGroup(group: GroupDefinition, data: any): React.ReactElement
  renderField(field: FieldDefinition, data: FieldRenderData, context?: Partial<FieldRenderContext>): React.ReactElement
  renderData(definition: DataDefinition, value: any): React.ReactElement
  renderAction(action: ActionDefinition): React.ReactElement
}
```

#### IApiLayer
```typescript
interface IApiLayer {
  getList(params?: any): Promise<any[]>
  getOne(id: string | number): Promise<any>
  create(data: any): Promise<any>
  update(id: string | number, data: any): Promise<any>
  delete(id: string | number): Promise<void>
}
```

### 5. ViewRenderer 实现

#### ListView
- 调用 `context.api.getList()` 获取数据列表
- 处理 loading/error/empty 状态
- 迭代数据项，对每项按 `view.groups` 渲染
- 调用 `context.renderGroup()` 渲染每个分组

#### ObjectView  
- 调用 `context.api.getOne(id)` 获取单个对象
- 处理 loading/error/notFound 状态
- 按 `view.groups` 渲染对象分组
- 调用 `context.renderGroup()` 渲染每个分组

### 6. 使用方式

```typescript
import { ReactConnectorSetup, useViewRenderer } from '@schema-component/react-connector'

// 1. Setup Provider
function App() {
  return (
    <ReactConnectorSetup engineContext={engineContext}>
      <MyComponent />
    </ReactConnectorSetup>
  )
}

// 2. Use in component
function MyComponent() {
  const { renderView } = useViewRenderer()
  
  // 渲染列表视图（自动调用 getList）
  const listView = renderView(listViewDefinition)
  
  // 渲染对象视图（自动调用 getOne）
  const objectView = renderView(objectViewDefinition, { id: 123 })
  
  return (
    <div>
      {listView}
      {objectView}
    </div>
  )
}
```

## 关键优势

1. **职责清晰**：View 层负责 API 调用，Group/Field/Data 层负责 UI 渲染
2. **类型安全**：完整的 TypeScript 类型支持
3. **可扩展**：易于添加新的渲染器类型
4. **API 集成**：无缝集成 Engine 的 API 层
5. **状态管理**：内置 loading/error 状态处理
6. **向下兼容**：保持与现有架构的兼容性

## 架构修复

本次重构解决了以下问题：
- ✅ 从 "Layer" 概念转为 "Renderer" 概念
- ✅ 集成 API 层到 RenderContext
- ✅ ViewRenderer 区分具体类型（ListView/ObjectView）
- ✅ 实现 ViewRenderer 迭代 Groups 的逻辑
- ✅ 实现 GroupRenderer 渲染 Fields 的逻辑
- ✅ 完整的渲染链路：API → View → Group → Field → Data

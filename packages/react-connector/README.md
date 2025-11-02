# @schema-component/react-connector

React 连接器包，用于将 Schema Component 的渲染层实现与 React 框架完全解耦。

## 特性

- 🎯 **框架无关渲染**: 基于 RenderDescriptor 实现跨框架的渲染抽象
- 🏗️ **分层架构**: ViewLayer → GroupLayer → FieldLayer → DataLayer/ActionLayer 的清晰层次
- ⚡ **高性能**: 支持批量渲染和缓存机制
- 🔧 **高扩展性**: 完整的渲染器注册和管理机制
- 🎨 **主题支持**: 灵活的组件映射和样式定制
- 📱 **响应式**: 内置 MobX-React 状态管理支持

## 安装

```bash
pnpm add @schema-component/react-connector
```

## 快速开始

### 1. 基础设置

```tsx
import React from 'react'
import {
  ReactRenderProvider,
  RenderDescriptorConverter,
  createDefaultComponentMap,
  ViewRegistry,
  ViewLoader,
  DataRegistry,
  DataLoader,
  ActionRegistry,
  ActionLoader,
  StringDataRenderer,
  ButtonActionRenderer
} from '@schema-component/react-connector'
import { RenderEngine } from '@schema-component/engine'

// 创建渲染环境
const setupRenderEnvironment = () => {
  const engine = new RenderEngine()
  const componentMap = createDefaultComponentMap()
  const converter = new RenderDescriptorConverter({ componentMap })

  // 创建注册表和加载器
  const dataRegistry = new DataRegistry()
  const dataLoader = new DataLoader(dataRegistry)
  const actionRegistry = new ActionRegistry()
  const actionLoader = new ActionLoader(actionRegistry)

  // 注册渲染器
  const stringRenderer = new StringDataRenderer()
  const buttonRenderer = new ButtonActionRenderer()

  dataRegistry.register('string', stringRenderer)
  actionRegistry.register('button', buttonRenderer)

  return {
    engine,
    converter,
    viewLoader: new ViewLoader(new ViewRegistry()),
    groupLoader: new GroupLoader(new GroupRegistry()),
    fieldLoader: new FieldLoader(new FieldRegistry()),
    dataLoader,
    actionLoader,
    componentMap,
    options: { enableCache: true, debugMode: false }
  }
}

// 应用组件
function App() {
  const renderContext = setupRenderEnvironment()

  return (
    <ReactRenderProvider value={renderContext}>
      <YourComponent />
    </ReactRenderProvider>
  )
}
```

### 2. 使用渲染 Hooks

```tsx
import { useDataRender, useActionRender } from '@schema-component/react-connector'

function YourComponent() {
  const dataRender = useDataRender()
  const actionRender = useActionRender()

  const [elements, setElements] = React.useState([])

  React.useEffect(() => {
    const renderContent = async () => {
      const context = { theme: 'default' }

      // 渲染数据
      const dataElement = await dataRender(
        { type: 'string', name: 'username' },
        'John Doe',
        context
      )

      // 渲染动作
      const actionElement = await actionRender(
        {
          type: 'button',
          name: 'save',
          title: '保存',
          handler: () => alert('保存成功!')
        },
        context
      )

      setElements([dataElement, actionElement])
    }

    renderContent()
  }, [dataRender, actionRender])

  return (
    <div>
      {elements.map((element, index) => (
        <div key={index}>{element}</div>
      ))}
    </div>
  )
}
```

## 核心概念

### 分层渲染架构

React Connector 采用分层架构，每一层负责特定的渲染职责：

```
ViewLayer (视图层)
    ↓
GroupLayer (分组层)
    ↓
FieldLayer (字段层)
    ↓
DataLayer (数据层) / ActionLayer (动作层)
```

### RenderDescriptor 转换

所有渲染器都可以输出框架无关的 RenderDescriptor，然后由转换器转换为 React 元素：

```tsx
// RenderDescriptor 格式
interface RenderDescriptor {
  component: string
  props: Record<string, any>
  children?: (RenderDescriptor | string)[]
  key?: string | number
}

// 转换为 React 元素
const converter = new RenderDescriptorConverter({ componentMap })
const reactElement = converter.convert(renderDescriptor)
```

### 组件映射

通过组件映射，可以将 RenderDescriptor 中的组件名称映射到实际的 React 组件：

```tsx
const componentMap = {
  'Button': MyCustomButton,
  'Input': MyCustomInput,
  'div': 'div',  // 使用原生 HTML 元素
  // ...
}

const converter = new RenderDescriptorConverter({ componentMap })
```

## 预置渲染器

### 数据渲染器

- `StringDataRenderer`: 字符串数据渲染
- `NumberDataRenderer`: 数字数据渲染（支持本地化格式）
- `DateDataRenderer`: 日期数据渲染
- `BooleanDataRenderer`: 布尔值数据渲染
- `ArrayDataRenderer`: 数组数据渲染
- `ObjectDataRenderer`: 对象数据渲染

### 动作渲染器

- `ButtonActionRenderer`: 按钮动作渲染
- `LinkActionRenderer`: 链接动作渲染
- `IconActionRenderer`: 图标动作渲染
- `DropdownActionRenderer`: 下拉菜单动作渲染
- `SubmitActionRenderer`: 表单提交动作渲染
- `ModalActionRenderer`: 模态框动作渲染

## 自定义渲染器

### 创建数据渲染器

```tsx
import { IReactDataRenderer } from '@schema-component/react-connector'

class EmailDataRenderer implements IReactDataRenderer {
  category = 'data' as const
  type = 'email'

  render(data: DataDefinition, value: any, context: RenderContext): RenderDescriptor {
    return {
      component: 'a',
      props: {
        href: `mailto:${value}`,
        className: 'email-link'
      },
      children: [value]
    }
  }

  renderReact(data: DataDefinition, value: any, context: RenderContext): React.ReactElement {
    return React.createElement('a', {
      href: `mailto:${value}`,
      className: 'email-link'
    }, value)
  }
}

// 注册自定义渲染器
dataRegistry.register('email', new EmailDataRenderer())
```

### 创建动作渲染器

```tsx
import { IReactActionRenderer } from '@schema-component/react-connector'

class DownloadActionRenderer implements IReactActionRenderer {
  category = 'action' as const
  type = 'download'

  render(action: ClientActionDefinition, context: RenderContext): RenderDescriptor {
    return {
      component: 'a',
      props: {
        href: action.url,
        download: action.filename,
        className: 'download-button'
      },
      children: [action.title || '下载']
    }
  }

  renderReact(action: ClientActionDefinition, context: RenderContext): React.ReactElement {
    return React.createElement('a', {
      href: action.url,
      download: action.filename,
      className: 'download-button'
    }, action.title || '下载')
  }
}
```

## 性能优化

### 批量渲染

```tsx
import { useBatchRender } from '@schema-component/react-connector'

function BatchRenderExample() {
  const batchRender = useBatchRender()

  const renderMultipleItems = async () => {
    const items = [
      { type: 'data', definition: { type: 'string', name: 'name' }, props: { value: 'John' } },
      { type: 'action', definition: { type: 'button', name: 'save', title: '保存' } }
    ]

    const elements = await batchRender(items)
    // 处理渲染结果
  }
}
```

### 缓存配置

```tsx
const renderContext = {
  // ...
  options: {
    enableCache: true,      // 启用渲染缓存
    debugMode: false,       // 调试模式
    errorBoundary: true     // 错误边界
  }
}
```

## API 参考

### Hooks

- `useReactRenderContext()`: 获取渲染上下文
- `useRenderEngine()`: 获取渲染引擎
- `useConverter()`: 获取转换器
- `useViewRender()`: 视图渲染 Hook
- `useGroupRender()`: 分组渲染 Hook
- `useFieldRender()`: 字段渲染 Hook
- `useDataRender()`: 数据渲染 Hook
- `useActionRender()`: 动作渲染 Hook
- `useBatchRender()`: 批量渲染 Hook
- `useRendererRegistry()`: 渲染器注册 Hook

### 工具函数

- `createDefaultComponentMap()`: 创建默认组件映射
- `deepMerge()`: 深度合并对象
- `generateId()`: 生成唯一 ID
- `isValidRenderer()`: 验证渲染器

## 与 Storybook 集成

项目包含完整的 Storybook 示例，展示各种渲染器的使用方式：

```bash
# 启动 Storybook
pnpm storybook

# 查看以下故事：
# - React Connector/架构示例
# - React Connector/数据层渲染器
# - React Connector/动作层渲染器
# - React Connector/层级集成
```

## 类型定义

详细的 TypeScript 类型定义请参考：

- [核心类型](./src/core/converter.ts)
- [层级类型](./src/layers/index.ts)
- [Hook 类型](./src/hooks/index.ts)
- [上下文类型](./src/context/index.ts)

## 许可证

MIT
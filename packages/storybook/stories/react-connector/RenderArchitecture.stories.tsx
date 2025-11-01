import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import {
  RenderEngine,
  ViewDefinition,
  GroupDefinition,
  FieldDefinition,
  DataDefinition,
  ActionDefinition
} from '@schema-component/engine'
import {
  ReactRenderProvider,
  RenderDescriptorConverter,
  createDefaultComponentMap,
  ViewRegistry,
  ViewLoader,
  GroupRegistry,
  GroupLoader,
  FieldRegistry,
  FieldLoader,
  DataRegistry,
  DataLoader,
  ActionRegistry,
  ActionLoader,
  StringDataRenderer,
  NumberDataRenderer,
  ButtonActionRenderer,
  LinkActionRenderer,
  useViewRender,
  useDataRender,
  useActionRender
} from '@schema-component/react-connector'

// 示例组件
const ExampleComponent: React.FC = () => {
  const viewRender = useViewRender()
  const dataRender = useDataRender()
  const actionRender = useActionRender()

  const [viewElement, setViewElement] = React.useState<React.ReactElement | null>(null)
  const [dataElement, setDataElement] = React.useState<React.ReactElement | null>(null)
  const [actionElement, setActionElement] = React.useState<React.ReactElement | null>(null)

  React.useEffect(() => {
    // 示例视图定义
    const viewDef: ViewDefinition = {
      type: 'form',
      name: 'userForm',
      title: '用户表单',
      fields: []
    }

    // 示例数据定义
    const dataDef: DataDefinition = {
      type: 'string',
      name: 'username'
    }

    // 示例动作定义
    const actionDef: ActionDefinition = {
      type: 'button',
      name: 'submit',
      title: '提交',
      handler: () => alert('表单提交')
    }

    const context = { theme: 'default' }

    // 渲染视图
    viewRender(viewDef, {}, context).then(setViewElement).catch(console.error)

    // 渲染数据
    dataRender(dataDef, 'John Doe', context).then(setDataElement).catch(console.error)

    // 渲染动作
    actionRender(actionDef, context).then(setActionElement).catch(console.error)
  }, [viewRender, dataRender, actionRender])

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>React Connector 渲染架构示例</h2>

      <div style={{ marginBottom: '20px' }}>
        <h3>数据渲染 (DataLayer)</h3>
        <div style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '4px' }}>
          {dataElement}
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>动作渲染 (ActionLayer)</h3>
        <div style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '4px' }}>
          {actionElement}
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>视图渲染 (ViewLayer)</h3>
        <div style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '4px' }}>
          {viewElement || '视图渲染器未注册'}
        </div>
      </div>
    </div>
  )
}

// 设置渲染环境
const setupRenderEnvironment = () => {
  // 创建引擎
  const engine = new RenderEngine()

  // 创建组件映射
  const componentMap = createDefaultComponentMap()

  // 创建转换器
  const converter = new RenderDescriptorConverter({ componentMap })

  // 创建注册表和加载器
  const viewRegistry = new ViewRegistry()
  const viewLoader = new ViewLoader(viewRegistry)

  const groupRegistry = new GroupRegistry()
  const groupLoader = new GroupLoader(groupRegistry)

  const fieldRegistry = new FieldRegistry()
  const fieldLoader = new FieldLoader(fieldRegistry)

  const dataRegistry = new DataRegistry()
  const dataLoader = new DataLoader(dataRegistry)

  const actionRegistry = new ActionRegistry()
  const actionLoader = new ActionLoader(actionRegistry)

  // 注册预置渲染器到引擎
  const stringRenderer = new StringDataRenderer()
  const numberRenderer = new NumberDataRenderer()
  const buttonRenderer = new ButtonActionRenderer()
  const linkRenderer = new LinkActionRenderer()

  engine.registerRenderer(stringRenderer)
  engine.registerRenderer(numberRenderer)
  engine.registerRenderer(buttonRenderer)
  engine.registerRenderer(linkRenderer)

  // 注册到各层注册表
  dataRegistry.register('string', stringRenderer)
  dataRegistry.register('number', numberRenderer)
  actionRegistry.register('button', buttonRenderer)
  actionRegistry.register('link', linkRenderer)

  return {
    engine,
    converter,
    viewLoader,
    groupLoader,
    fieldLoader,
    dataLoader,
    actionLoader,
    componentMap,
    options: {
      enableCache: true,
      debugMode: true,
      errorBoundary: true
    }
  }
}

// Story 配置
const meta: Meta<typeof ExampleComponent> = {
  title: 'React Connector/架构示例',
  component: ExampleComponent,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# React Connector 渲染架构

这个示例展示了 React Connector 的完整渲染架构，包括：

## 核心概念

- **RenderDescriptorConverter**: 将框架无关的 RenderDescriptor 转换为 React 元素
- **分层渲染**: 视图层 → 分组层 → 字段层 → 数据层/动作层
- **渲染器注册**: 统一的渲染器注册机制
- **React Hooks**: 便捷的渲染和状态管理

## 架构层次

1. **ViewLayer**: 处理视图级别的渲染
2. **GroupLayer**: 处理字段分组的渲染
3. **FieldLayer**: 处理单个字段的渲染
4. **DataLayer**: 处理数据类型的渲染（字符串、数字、日期等）
5. **ActionLayer**: 处理用户交互动作的渲染（按钮、链接等）

## 使用方式

通过 ReactRenderProvider 提供渲染上下文，然后使用各种 Hook 进行渲染。
        `
      }
    }
  },
  decorators: [
    (Story) => {
      const contextValue = setupRenderEnvironment()
      return (
        <ReactRenderProvider value={contextValue}>
          <Story />
        </ReactRenderProvider>
      )
    }
  ]
}

export default meta

type Story = StoryObj<typeof ExampleComponent>

// 基础示例
export const 基础架构: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: '展示 React Connector 的基本渲染架构，包括数据渲染和动作渲染。'
      }
    }
  }
}

// 性能监控示例
export const 性能监控: Story = {
  render: () => {
    const dataRender = useDataRender()
    const [renderTime, setRenderTime] = React.useState<number>(0)
    const [element, setElement] = React.useState<React.ReactElement | null>(null)

    React.useEffect(() => {
      const start = performance.now()

      const dataDef: DataDefinition = {
        type: 'string',
        name: 'performance-test'
      }

      dataRender(dataDef, 'Performance Test Data', { theme: 'default' })
        .then(el => {
          const end = performance.now()
          setRenderTime(end - start)
          setElement(el)
        })
        .catch(console.error)
    }, [dataRender])

    return (
      <div style={{ padding: '20px' }}>
        <h3>性能监控示例</h3>
        <p>渲染时间: {renderTime.toFixed(2)}ms</p>
        <div style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '4px' }}>
          {element}
        </div>
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: '展示渲染性能监控功能，测量渲染器的执行时间。'
      }
    }
  }
}

// 错误处理示例
export const 错误处理: Story = {
  render: () => {
    const dataRender = useDataRender()
    const [error, setError] = React.useState<Error | null>(null)
    const [element, setElement] = React.useState<React.ReactElement | null>(null)

    React.useEffect(() => {
      // 使用不存在的数据类型来触发错误
      const dataDef: DataDefinition = {
        type: 'unknown-type' as any,
        name: 'error-test'
      }

      dataRender(dataDef, 'Test Data', { theme: 'default' })
        .then(setElement)
        .catch(setError)
    }, [dataRender])

    return (
      <div style={{ padding: '20px' }}>
        <h3>错误处理示例</h3>
        {error ? (
          <div style={{
            background: '#fee',
            border: '1px solid #fcc',
            padding: '10px',
            borderRadius: '4px',
            color: '#c00'
          }}>
            <strong>错误:</strong> {error.message}
          </div>
        ) : (
          <div style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '4px' }}>
            {element}
          </div>
        )}
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: '展示当使用未注册的渲染器类型时的错误处理机制。'
      }
    }
  }
}
import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import {
  ViewDefinition,
  FieldDefinition,
  DataDefinition,
  ActionDefinition,
  RenderEngine
} from '@schema-component/engine'
import {
  ReactRenderProvider,
  RenderDescriptorConverter,
  createDefaultComponentMap,
  ViewRegistry,
  ViewLoader,
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
  useFieldRender,
  useDataRender,
  useActionRender,
  useBatchRender
} from '@schema-component/react-connector'

// 完整集成示例组件
const LayerIntegrationExample: React.FC = () => {
  const batchRender = useBatchRender()
  const [formElements, setFormElements] = React.useState<React.ReactElement[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    const renderCompleteForm = async () => {
      setIsLoading(true)

      try {
        const context = { theme: 'default', mode: 'edit' as const }

        // 构建一个完整的表单，展示各层渲染器的协作
        const renderItems = [
          // 字段：用户名 (字符串数据)
          {
            type: 'field' as const,
            definition: {
              name: 'username',
              label: '用户名',
              layout: 'horizontal',
              dataType: 'string',
              required: true
            } as FieldDefinition,
            context,
            props: {
              value: 'john_doe',
              record: { username: 'john_doe', email: 'john@example.com', age: 25 }
            }
          },

          // 字段：年龄 (数字数据)
          {
            type: 'field' as const,
            definition: {
              name: 'age',
              label: '年龄',
              layout: 'vertical',
              dataType: 'number',
              required: false
            } as FieldDefinition,
            context,
            props: {
              value: 25,
              record: { username: 'john_doe', email: 'john@example.com', age: 25 }
            }
          },

          // 纯数据渲染：邮箱
          {
            type: 'data' as const,
            definition: {
              type: 'string',
              name: 'email'
            } as DataDefinition,
            context,
            props: {
              value: 'john@example.com'
            }
          },

          // 动作：保存按钮
          {
            type: 'action' as const,
            definition: {
              type: 'button',
              name: 'save',
              title: '保存',
              style: 'primary',
              handler: () => alert('表单已保存！')
            } as ActionDefinition,
            context
          },

          // 动作：取消链接
          {
            type: 'action' as const,
            definition: {
              type: 'link',
              name: 'cancel',
              title: '取消',
              url: '#cancel',
              handler: (e: Event) => {
                e.preventDefault()
                alert('操作已取消')
              }
            } as ActionDefinition,
            context
          }
        ]

        const elements = await batchRender(renderItems)
        setFormElements(elements)
      } catch (error) {
        console.error('渲染失败:', error)
      } finally {
        setIsLoading(false)
      }
    }

    renderCompleteForm()
  }, [batchRender])

  if (isLoading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div>正在渲染表单...</div>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>分层渲染器集成示例</h2>

      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '24px',
        backgroundColor: '#fafafa'
      }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>用户信息表单</h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {formElements.map((element, index) => (
            <div key={index} style={{
              padding: '12px',
              border: '1px solid #e5e5e5',
              borderRadius: '6px',
              backgroundColor: 'white'
            }}>
              {element}
            </div>
          ))}
        </div>

        <div style={{
          marginTop: '20px',
          padding: '12px',
          backgroundColor: '#e3f2fd',
          borderRadius: '4px',
          fontSize: '14px',
          color: '#1565c0'
        }}>
          <strong>渲染层次说明:</strong>
          <ul style={{ margin: '8px 0 0 20px', padding: 0 }}>
            <li>字段渲染器处理表单字段布局和标签</li>
            <li>数据渲染器负责具体数据值的展示</li>
            <li>动作渲染器创建交互元素</li>
            <li>所有层次协作完成完整的表单渲染</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

// 性能对比示例
const PerformanceComparisonExample: React.FC = () => {
  const dataRender = useDataRender()
  const [renderTimes, setRenderTimes] = React.useState<{
    single: number[]
    batch: number[]
  }>({ single: [], batch: [] })

  const runPerformanceTest = async () => {
    const context = { theme: 'default' }
    const dataItems = Array.from({ length: 100 }, (_, i) => ({
      type: 'string' as const,
      name: `item-${i}`,
      value: `Item ${i}`
    }))

    // 单个渲染测试
    const singleTimes: number[] = []
    for (const item of dataItems.slice(0, 10)) {
      const start = performance.now()
      await dataRender({ type: item.type, name: item.name }, item.value, context)
      singleTimes.push(performance.now() - start)
    }

    // 批量渲染测试（模拟）
    const batchTimes: number[] = []
    const batchSize = 10
    for (let i = 0; i < 10; i++) {
      const start = performance.now()
      const batch = dataItems.slice(i * batchSize, (i + 1) * batchSize)
      await Promise.all(
        batch.map(item =>
          dataRender({ type: item.type, name: item.name }, item.value, context)
        )
      )
      batchTimes.push((performance.now() - start) / batchSize)
    }

    setRenderTimes({ single: singleTimes, batch: batchTimes })
  }

  const averageTime = (times: number[]) =>
    times.length > 0 ? (times.reduce((a, b) => a + b, 0) / times.length).toFixed(2) : '0'

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h3>渲染性能对比</h3>

      <button
        onClick={runPerformanceTest}
        style={{
          padding: '8px 16px',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginBottom: '20px'
        }}
      >
        运行性能测试
      </button>

      {renderTimes.single.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '16px',
            backgroundColor: '#f9f9f9'
          }}>
            <h4>单个渲染</h4>
            <p>平均时间: {averageTime(renderTimes.single)}ms</p>
            <p>最小时间: {Math.min(...renderTimes.single).toFixed(2)}ms</p>
            <p>最大时间: {Math.max(...renderTimes.single).toFixed(2)}ms</p>
          </div>

          <div style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '16px',
            backgroundColor: '#f9f9f9'
          }}>
            <h4>批量渲染</h4>
            <p>平均时间: {averageTime(renderTimes.batch)}ms (每项)</p>
            <p>最小时间: {Math.min(...renderTimes.batch).toFixed(2)}ms</p>
            <p>最大时间: {Math.max(...renderTimes.batch).toFixed(2)}ms</p>
          </div>
        </div>
      )}
    </div>
  )
}

// 创建完整的渲染环境
const setupCompleteRenderEnvironment = () => {
  const engine = new RenderEngine()
  const componentMap = createDefaultComponentMap()
  const converter = new RenderDescriptorConverter({ componentMap })

  // 创建所有层的注册表和加载器
  const viewRegistry = new ViewRegistry()
  const viewLoader = new ViewLoader(viewRegistry)

  const fieldRegistry = new FieldRegistry()
  const fieldLoader = new FieldLoader(fieldRegistry)

  const dataRegistry = new DataRegistry()
  const dataLoader = new DataLoader(dataRegistry)

  const actionRegistry = new ActionRegistry()
  const actionLoader = new ActionLoader(actionRegistry)

  // 注册渲染器
  const renderers = [
    new StringDataRenderer(),
    new NumberDataRenderer(),
    new ButtonActionRenderer(),
    new LinkActionRenderer()
  ]

  renderers.forEach(renderer => {
    engine.registerRenderer(renderer)

    if (renderer.category === 'data') {
      dataRegistry.register(renderer.type, renderer)
    } else if (renderer.category === 'action') {
      actionRegistry.register(renderer.type, renderer)
    }
  })

  return {
    engine,
    converter,
    viewLoader,
    groupLoader: null as any,
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

const meta: Meta<typeof LayerIntegrationExample> = {
  title: 'React Connector/层级集成',
  component: LayerIntegrationExample,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# 分层渲染器集成示例

展示 React Connector 中各层渲染器的协作方式和集成效果。

## 渲染层次结构

在完整的渲染过程中，各层渲染器按以下顺序协作：

1. **ViewLayer**: 处理整体视图结构
2. **GroupLayer**: 处理字段分组布局
3. **FieldLayer**: 处理单个字段的标签、布局和验证
4. **DataLayer**: 处理具体数据值的可视化
5. **ActionLayer**: 处理用户交互动作

## 性能优化

- **批量渲染**: 使用 \`useBatchRender\` Hook 进行批量处理
- **异步渲染**: 支持异步加载器和渲染器
- **缓存机制**: 内置渲染结果缓存
- **懒加载**: 按需加载渲染器

## 错误处理

- **渲染失败回退**: 渲染失败时显示错误信息
- **类型检查**: 编译时和运行时类型安全
- **调试模式**: 详细的错误日志和性能监控
        `
      }
    }
  },
  decorators: [
    (Story) => {
      const contextValue = setupCompleteRenderEnvironment()
      return (
        <ReactRenderProvider value={contextValue}>
          <Story />
        </ReactRenderProvider>
      )
    }
  ]
}

export default meta

type Story = StoryObj<typeof LayerIntegrationExample>

export const 完整表单示例: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: '展示各层渲染器协作构建完整表单的过程，包括字段渲染、数据展示和交互动作。'
      }
    }
  }
}

export const 性能测试: Story = {
  render: () => <PerformanceComparisonExample />,
  parameters: {
    docs: {
      description: {
        story: '比较单个渲染和批量渲染的性能差异，展示 React Connector 的优化效果。'
      }
    }
  }
}
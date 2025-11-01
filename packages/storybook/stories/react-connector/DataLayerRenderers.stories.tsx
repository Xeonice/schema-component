import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import { DataDefinition } from '@schema-component/engine'
import {
  ReactRenderProvider,
  RenderDescriptorConverter,
  createDefaultComponentMap,
  DataRegistry,
  DataLoader,
  StringDataRenderer,
  NumberDataRenderer,
  DateDataRenderer,
  BooleanDataRenderer,
  ArrayDataRenderer,
  ObjectDataRenderer,
  useDataRender
} from '@schema-component/react-connector'

// 数据渲染示例组件
const DataRenderExamples: React.FC = () => {
  const dataRender = useDataRender()
  const [elements, setElements] = React.useState<{
    [key: string]: React.ReactElement | null
  }>({})

  React.useEffect(() => {
    const renderData = async () => {
      const context = { theme: 'default' }
      const newElements: { [key: string]: React.ReactElement | null } = {}

      // 字符串数据
      const stringDef: DataDefinition = { type: 'string', name: 'username' }
      newElements.string = await dataRender(stringDef, 'John Doe', context)

      // 数字数据
      const numberDef: DataDefinition = { type: 'number', name: 'age' }
      newElements.number = await dataRender(numberDef, 25, context)

      // 日期数据
      const dateDef: DataDefinition = { type: 'date', name: 'birthDate' }
      newElements.date = await dataRender(dateDef, new Date('1998-06-15'), context)

      // 布尔数据
      const booleanDef: DataDefinition = { type: 'boolean', name: 'isActive' }
      newElements.boolean = await dataRender(booleanDef, true, context)

      // 数组数据
      const arrayDef: DataDefinition = { type: 'array', name: 'tags' }
      newElements.array = await dataRender(arrayDef, ['React', 'TypeScript', 'Storybook'], context)

      // 对象数据
      const objectDef: DataDefinition = { type: 'object', name: 'profile' }
      newElements.object = await dataRender(objectDef, {
        name: 'John Doe',
        age: 25,
        city: 'New York'
      }, context)

      setElements(newElements)
    }

    renderData().catch(console.error)
  }, [dataRender])

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>数据层渲染器示例</h2>

      <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        {Object.entries(elements).map(([type, element]) => (
          <div key={type} style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '16px',
            backgroundColor: '#f9f9f9'
          }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#333' }}>
              {type.charAt(0).toUpperCase() + type.slice(1)} 数据渲染器
            </h3>
            <div style={{
              border: '1px solid #ccc',
              borderRadius: '4px',
              padding: '8px',
              backgroundColor: 'white',
              minHeight: '40px',
              display: 'flex',
              alignItems: 'center'
            }}>
              {element}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// 创建渲染环境
const setupDataRenderEnvironment = () => {
  const componentMap = createDefaultComponentMap()
  const converter = new RenderDescriptorConverter({ componentMap })
  const dataRegistry = new DataRegistry()
  const dataLoader = new DataLoader(dataRegistry)

  // 注册所有数据渲染器
  const renderers = [
    new StringDataRenderer(),
    new NumberDataRenderer(),
    new DateDataRenderer(),
    new BooleanDataRenderer(),
    new ArrayDataRenderer(),
    new ObjectDataRenderer()
  ]

  renderers.forEach(renderer => {
    dataRegistry.register(renderer.type, renderer)
  })

  return {
    engine: null as any, // 简化示例，不需要完整引擎
    converter,
    viewLoader: null as any,
    groupLoader: null as any,
    fieldLoader: null as any,
    dataLoader,
    actionLoader: null as any,
    componentMap,
    options: {
      enableCache: true,
      debugMode: true,
      errorBoundary: true
    }
  }
}

const meta: Meta<typeof DataRenderExamples> = {
  title: 'React Connector/数据层渲染器',
  component: DataRenderExamples,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# 数据层渲染器 (DataLayer)

数据层渲染器负责将不同类型的数据值渲染为可视化的 React 元素。

## 支持的数据类型

- **String**: 字符串数据，支持长文本截断和提示
- **Number**: 数字数据，支持本地化格式化
- **Date**: 日期数据，支持多种日期格式
- **Boolean**: 布尔数据，提供真假值的可视化表示
- **Array**: 数组数据，展示列表形式的数据
- **Object**: 对象数据，展示键值对结构

## 扩展方式

每个数据渲染器都实现了 \`IReactDataRenderer\` 接口，支持：
- 框架无关的 \`render\` 方法（返回 RenderDescriptor）
- React 原生的 \`renderReact\` 方法（直接返回 React 元素）

你可以通过实现同样的接口来创建自定义数据渲染器。
        `
      }
    }
  },
  decorators: [
    (Story) => {
      const contextValue = setupDataRenderEnvironment()
      return (
        <ReactRenderProvider value={contextValue}>
          <Story />
        </ReactRenderProvider>
      )
    }
  ]
}

export default meta

type Story = StoryObj<typeof DataRenderExamples>

export const 所有数据类型: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: '展示所有内置数据类型渲染器的效果，包括字符串、数字、日期、布尔值、数组和对象。'
      }
    }
  }
}

// 自定义样式示例
export const 自定义样式: Story = {
  render: () => {
    const dataRender = useDataRender()
    const [elements, setElements] = React.useState<React.ReactElement[]>([])

    React.useEffect(() => {
      const renderWithStyles = async () => {
        const context = { theme: 'custom' }
        const results = []

        // 带自定义 CSS 类的字符串
        const stringDef: DataDefinition = { type: 'string', name: 'styledText' }
        results.push(await dataRender(stringDef, 'Custom Styled Text', context))

        // 大数字格式
        const numberDef: DataDefinition = { type: 'number', name: 'bigNumber' }
        results.push(await dataRender(numberDef, 1234567.89, context))

        setElements(results)
      }

      renderWithStyles().catch(console.error)
    }, [dataRender])

    return (
      <div style={{ padding: '20px' }}>
        <h3>自定义样式示例</h3>
        <style>{`
          .string-data {
            color: #2563eb;
            font-weight: bold;
            text-decoration: underline;
          }
          .number-data {
            color: #16a34a;
            font-family: 'Monaco', monospace;
            background: #f0f9ff;
            padding: 4px 8px;
            border-radius: 4px;
          }
        `}</style>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          {elements.map((element, index) => (
            <div key={index} style={{
              border: '1px solid #ddd',
              padding: '12px',
              borderRadius: '6px',
              backgroundColor: '#fafafa'
            }}>
              {element}
            </div>
          ))}
        </div>
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: '展示如何通过 CSS 类名来自定义数据渲染器的样式。'
      }
    }
  }
}

// 边界值测试
export const 边界值测试: Story = {
  render: () => {
    const dataRender = useDataRender()
    const [elements, setElements] = React.useState<{
      [key: string]: React.ReactElement | null
    }>({})

    React.useEffect(() => {
      const testEdgeCases = async () => {
        const context = { theme: 'default' }
        const newElements: { [key: string]: React.ReactElement | null } = {}

        // 空字符串
        const emptyStringDef: DataDefinition = { type: 'string', name: 'empty' }
        newElements.emptyString = await dataRender(emptyStringDef, '', context)

        // 零值
        const zeroDef: DataDefinition = { type: 'number', name: 'zero' }
        newElements.zero = await dataRender(zeroDef, 0, context)

        // 无效日期
        const invalidDateDef: DataDefinition = { type: 'date', name: 'invalid' }
        newElements.invalidDate = await dataRender(invalidDateDef, 'invalid-date', context)

        // 空数组
        const emptyArrayDef: DataDefinition = { type: 'array', name: 'emptyArray' }
        newElements.emptyArray = await dataRender(emptyArrayDef, [], context)

        // 空对象
        const emptyObjectDef: DataDefinition = { type: 'object', name: 'emptyObject' }
        newElements.emptyObject = await dataRender(emptyObjectDef, {}, context)

        // null 值
        const nullStringDef: DataDefinition = { type: 'string', name: 'nullString' }
        newElements.nullValue = await dataRender(nullStringDef, null, context)

        setElements(newElements)
      }

      testEdgeCases().catch(console.error)
    }, [dataRender])

    return (
      <div style={{ padding: '20px' }}>
        <h3>边界值测试</h3>
        <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          {Object.entries(elements).map(([key, element]) => (
            <div key={key} style={{
              border: '1px solid #ddd',
              borderRadius: '4px',
              padding: '12px',
              backgroundColor: '#f8f9fa'
            }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                {key}
              </div>
              <div style={{
                border: '1px solid #ccc',
                borderRadius: '4px',
                padding: '8px',
                backgroundColor: 'white',
                minHeight: '30px'
              }}>
                {element}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: '测试数据渲染器对边界值和异常情况的处理，包括空值、无效值等。'
      }
    }
  }
}
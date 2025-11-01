import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import { ActionDefinition } from '@schema-component/engine'
import {
  ReactRenderProvider,
  RenderDescriptorConverter,
  createDefaultComponentMap,
  ActionRegistry,
  ActionLoader,
  ButtonActionRenderer,
  LinkActionRenderer,
  IconActionRenderer,
  DropdownActionRenderer,
  SubmitActionRenderer,
  ModalActionRenderer,
  useActionRender
} from '@schema-component/react-connector'

// 动作渲染示例组件
const ActionRenderExamples: React.FC = () => {
  const actionRender = useActionRender()
  const [elements, setElements] = React.useState<{
    [key: string]: React.ReactElement | null
  }>({})
  const [actionLog, setActionLog] = React.useState<string[]>([])

  const logAction = (action: string) => {
    setActionLog(prev => [...prev.slice(-4), `${new Date().toLocaleTimeString()}: ${action}`])
  }

  React.useEffect(() => {
    const renderActions = async () => {
      const context = { theme: 'default' }
      const newElements: { [key: string]: React.ReactElement | null } = {}

      // 按钮动作
      const buttonDef: ActionDefinition = {
        type: 'button',
        name: 'save',
        title: '保存',
        handler: () => logAction('保存按钮被点击'),
        style: 'primary'
      }
      newElements.button = await actionRender(buttonDef, context)

      // 链接动作
      const linkDef: ActionDefinition = {
        type: 'link',
        name: 'viewDetails',
        title: '查看详情',
        url: '#details',
        handler: (e: Event) => {
          e.preventDefault()
          logAction('链接被点击')
        }
      }
      newElements.link = await actionRender(linkDef, context)

      // 图标动作
      const iconDef: ActionDefinition = {
        type: 'icon',
        name: 'edit',
        title: '编辑',
        icon: 'edit-icon',
        handler: () => logAction('编辑图标被点击')
      }
      newElements.icon = await actionRender(iconDef, context)

      // 下拉菜单动作
      const dropdownDef: ActionDefinition = {
        type: 'dropdown',
        name: 'moreActions',
        title: '更多操作',
        handler: () => logAction('下拉菜单被点击'),
        items: [
          { name: 'duplicate', title: '复制', handler: () => logAction('复制操作') },
          { name: 'delete', title: '删除', handler: () => logAction('删除操作') }
        ]
      }
      newElements.dropdown = await actionRender(dropdownDef, context)

      // 提交动作
      const submitDef: ActionDefinition = {
        type: 'submit',
        name: 'submitForm',
        title: '提交表单',
        handler: () => logAction('表单提交'),
        form: 'userForm'
      }
      newElements.submit = await actionRender(submitDef, context)

      // 模态框动作
      const modalDef: ActionDefinition = {
        type: 'modal',
        name: 'openModal',
        title: '打开对话框',
        handler: () => logAction('模态框被打开'),
        modalTarget: 'confirmDialog'
      }
      newElements.modal = await actionRender(modalDef, context)

      setElements(newElements)
    }

    renderActions().catch(console.error)
  }, [actionRender])

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>动作层渲染器示例</h2>

      <div style={{ marginBottom: '20px' }}>
        <h3>动作日志</h3>
        <div style={{
          background: '#f5f5f5',
          border: '1px solid #ddd',
          borderRadius: '4px',
          padding: '12px',
          maxHeight: '120px',
          overflowY: 'auto',
          fontFamily: 'monospace',
          fontSize: '12px'
        }}>
          {actionLog.length === 0 ? (
            <div style={{ color: '#666' }}>点击下面的动作按钮来查看日志...</div>
          ) : (
            actionLog.map((log, index) => (
              <div key={index}>{log}</div>
            ))
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
        {Object.entries(elements).map(([type, element]) => (
          <div key={type} style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '16px',
            backgroundColor: '#f9f9f9'
          }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#333' }}>
              {type.charAt(0).toUpperCase() + type.slice(1)} 动作渲染器
            </h3>
            <div style={{
              border: '1px solid #ccc',
              borderRadius: '4px',
              padding: '12px',
              backgroundColor: 'white',
              minHeight: '50px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
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
const setupActionRenderEnvironment = () => {
  const componentMap = createDefaultComponentMap()
  const converter = new RenderDescriptorConverter({ componentMap })
  const actionRegistry = new ActionRegistry()
  const actionLoader = new ActionLoader(actionRegistry)

  // 注册所有动作渲染器
  const renderers = [
    new ButtonActionRenderer(),
    new LinkActionRenderer(),
    new IconActionRenderer(),
    new DropdownActionRenderer(),
    new SubmitActionRenderer(),
    new ModalActionRenderer()
  ]

  renderers.forEach(renderer => {
    actionRegistry.register(renderer.type, renderer)
  })

  return {
    engine: null as any,
    converter,
    viewLoader: null as any,
    groupLoader: null as any,
    fieldLoader: null as any,
    dataLoader: null as any,
    actionLoader,
    componentMap,
    options: {
      enableCache: true,
      debugMode: true,
      errorBoundary: true
    }
  }
}

const meta: Meta<typeof ActionRenderExamples> = {
  title: 'React Connector/动作层渲染器',
  component: ActionRenderExamples,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# 动作层渲染器 (ActionLayer)

动作层渲染器负责将用户交互动作定义渲染为可交互的 React 元素。

## 支持的动作类型

- **Button**: 标准按钮，支持不同样式（primary, secondary, danger等）
- **Link**: 链接动作，支持内部和外部链接
- **Icon**: 图标按钮，适用于工具栏和紧凑布局
- **Dropdown**: 下拉菜单，支持多个子动作
- **Submit**: 表单提交按钮，与表单元素关联
- **Modal**: 模态框触发器，打开对话框或弹窗

## 交互特性

- **事件处理**: 所有动作都支持自定义事件处理器
- **状态管理**: 支持禁用状态和加载状态
- **样式定制**: 可通过 style 属性定制外观
- **可访问性**: 内置 ARIA 属性和键盘导航支持

## 扩展方式

通过实现 \`IReactActionRenderer\` 接口创建自定义动作渲染器。
        `
      }
    }
  },
  decorators: [
    (Story) => {
      const contextValue = setupActionRenderEnvironment()
      return (
        <ReactRenderProvider value={contextValue}>
          <Story />
        </ReactRenderProvider>
      )
    }
  ]
}

export default meta

type Story = StoryObj<typeof ActionRenderExamples>

export const 所有动作类型: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: '展示所有内置动作类型渲染器的效果，包括按钮、链接、图标、下拉菜单、提交和模态框动作。'
      }
    }
  }
}

// 样式变体示例
export const 样式变体: Story = {
  render: () => {
    const actionRender = useActionRender()
    const [elements, setElements] = React.useState<React.ReactElement[]>([])

    React.useEffect(() => {
      const renderStyleVariants = async () => {
        const context = { theme: 'default' }
        const results = []

        // 不同样式的按钮
        const styles = ['primary', 'secondary', 'danger', 'success', 'warning']
        for (const style of styles) {
          const buttonDef: ActionDefinition = {
            type: 'button',
            name: `button-${style}`,
            title: `${style.charAt(0).toUpperCase() + style.slice(1)} Button`,
            style,
            handler: () => console.log(`${style} button clicked`)
          }
          results.push(await actionRender(buttonDef, context))
        }

        setElements(results)
      }

      renderStyleVariants().catch(console.error)
    }, [actionRender])

    return (
      <div style={{ padding: '20px' }}>
        <h3>按钮样式变体</h3>
        <style>{`
          .action-button.primary { background: #3b82f6; color: white; border: none; padding: 8px 16px; border-radius: 4px; }
          .action-button.secondary { background: #6b7280; color: white; border: none; padding: 8px 16px; border-radius: 4px; }
          .action-button.danger { background: #ef4444; color: white; border: none; padding: 8px 16px; border-radius: 4px; }
          .action-button.success { background: #10b981; color: white; border: none; padding: 8px 16px; border-radius: 4px; }
          .action-button.warning { background: #f59e0b; color: white; border: none; padding: 8px 16px; border-radius: 4px; }
          .action-button:hover { opacity: 0.8; cursor: pointer; }
        `}</style>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {elements.map((element, index) => (
            <div key={index}>{element}</div>
          ))}
        </div>
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: '展示按钮动作渲染器的不同样式变体，包括主要、次要、危险、成功和警告样式。'
      }
    }
  }
}

// 状态管理示例
export const 状态管理: Story = {
  render: () => {
    const actionRender = useActionRender()
    const [isLoading, setIsLoading] = React.useState(false)
    const [elements, setElements] = React.useState<{
      [key: string]: React.ReactElement | null
    }>({})

    React.useEffect(() => {
      const renderStatefulActions = async () => {
        const context = { theme: 'default' }
        const newElements: { [key: string]: React.ReactElement | null } = {}

        // 正常按钮
        const normalDef: ActionDefinition = {
          type: 'button',
          name: 'normal',
          title: '正常按钮',
          handler: () => console.log('Normal button clicked')
        }
        newElements.normal = await actionRender(normalDef, context)

        // 禁用按钮
        const disabledDef: ActionDefinition = {
          type: 'button',
          name: 'disabled',
          title: '禁用按钮',
          disabled: true,
          handler: () => console.log('This should not be called')
        }
        newElements.disabled = await actionRender(disabledDef, context)

        // 加载中按钮
        const loadingDef: ActionDefinition = {
          type: 'button',
          name: 'loading',
          title: isLoading ? '加载中...' : '开始加载',
          disabled: isLoading,
          handler: () => {
            setIsLoading(true)
            setTimeout(() => setIsLoading(false), 2000)
          }
        }
        newElements.loading = await actionRender(loadingDef, context)

        setElements(newElements)
      }

      renderStatefulActions().catch(console.error)
    }, [actionRender, isLoading])

    return (
      <div style={{ padding: '20px' }}>
        <h3>动作状态管理</h3>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          {Object.entries(elements).map(([key, element]) => (
            <div key={key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div style={{ fontSize: '12px', color: '#666' }}>{key}</div>
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
        story: '展示动作渲染器的不同状态，包括正常、禁用和加载状态的处理。'
      }
    }
  }
}
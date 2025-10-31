import type { Meta, StoryObj } from '@storybook/react'
import React, { useState, useEffect } from 'react'

/**
 * RenderEngine - 渲染引擎示例
 *
 * RenderEngine 是渲染系统的核心协调器，负责：
 * - 注册和管理渲染器（Data/View/Action）
 * - 创建渲染上下文
 * - 执行渲染操作
 * - 协调 ViewStack 和 ActionQueue
 */

interface CodeDemoProps {
  title: string
  description: string
  code: string
  result?: string
  isAsync?: boolean
}

const CodeDemo: React.FC<CodeDemoProps> = ({
  title,
  description,
  code,
  result,
  isAsync = false
}) => {
  const [output, setOutput] = useState<string>(result || '')
  const [isRunning, setIsRunning] = useState(false)

  const runCode = async () => {
    setIsRunning(true)
    setOutput('执行中...')

    await new Promise(resolve => setTimeout(resolve, 500))

    setOutput(result || '✓ 代码执行成功')
    setIsRunning(false)
  }

  useEffect(() => {
    if (result) {
      setOutput(result)
    }
  }, [result])

  return (
    <div style={{
      padding: '20px',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      marginBottom: '20px'
    }}>
      <h3 style={{ marginTop: 0, color: '#1f2937' }}>{title}</h3>
      <p style={{ color: '#6b7280', marginBottom: '16px' }}>{description}</p>

      <div style={{ marginBottom: '16px' }}>
        <h4 style={{ fontSize: '14px', color: '#374151', marginBottom: '8px' }}>代码:</h4>
        <pre style={{
          backgroundColor: '#1f2937',
          color: '#f9fafb',
          padding: '16px',
          borderRadius: '6px',
          overflow: 'auto',
          fontSize: '13px',
          lineHeight: '1.5'
        }}>
          {code}
        </pre>
      </div>

      {isAsync && (
        <button
          onClick={runCode}
          disabled={isRunning}
          style={{
            padding: '8px 16px',
            backgroundColor: isRunning ? '#9ca3af' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isRunning ? 'not-allowed' : 'pointer',
            marginBottom: '12px'
          }}
        >
          {isRunning ? '运行中...' : '运行代码'}
        </button>
      )}

      {output && (
        <div style={{ marginTop: '12px' }}>
          <h4 style={{ fontSize: '14px', color: '#374151', marginBottom: '8px' }}>输出:</h4>
          <pre style={{
            backgroundColor: '#f9fafb',
            color: '#1f2937',
            padding: '12px',
            borderRadius: '6px',
            overflow: 'auto',
            fontSize: '13px',
            border: '1px solid #e5e7eb'
          }}>
            {output}
          </pre>
        </div>
      )}
    </div>
  )
}

const meta: Meta<typeof CodeDemo> = {
  title: 'Engine/Render/RenderEngine',
  component: CodeDemo,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'RenderEngine 是渲染系统的核心，管理所有渲染器并协调渲染操作。它使用单例模式确保全局只有一个实例。'
      }
    }
  }
}

export default meta
type Story = StoryObj<typeof CodeDemo>

// 1. Basic Setup
export const BasicSetup: Story = {
  args: {
    title: '1. 创建 RenderEngine 实例',
    description: 'RenderEngine 使用单例模式，通过 getInstance() 获取实例。',
    code: `import { RenderEngine } from '@schema-component/engine'

// 获取单例实例
const engine = RenderEngine.getInstance()

console.log('RenderEngine initialized')
console.log('ViewStack:', engine.viewStack)
console.log('ActionQueue:', engine.actionQueue)`,
    result: `RenderEngine initialized
ViewStack: ViewStack { current: null, history: [] }
ActionQueue: ActionQueue { pending: [], running: [], completed: [] }`
  }
}

// 2. Custom Configuration
export const CustomConfiguration: Story = {
  args: {
    title: '2. 自定义配置',
    description: '可以提供自定义的 ViewStack、ActionQueue 和配置选项。',
    code: `import { RenderEngine, ViewStack, ActionQueue } from '@schema-component/engine'

// 创建自定义组件
const customViewStack = new ViewStack()
const customActionQueue = new ActionQueue({
  concurrency: 5,         // 最多同时执行 5 个任务
  defaultMaxRetries: 3,   // 失败后重试 3 次
  timeout: 60000          // 60 秒超时
})

// 使用自定义配置初始化
const engine = RenderEngine.getInstance({
  viewStack: customViewStack,
  actionQueue: customActionQueue
})

console.log('Custom RenderEngine initialized')
console.log('Concurrency:', 5)
console.log('Max Retries:', 3)
console.log('Timeout:', '60s')`,
    result: `Custom RenderEngine initialized
Concurrency: 5
Max Retries: 3
Timeout: 60s`
  }
}

// 3. Register Data Renderer
export const RegisterDataRenderer: Story = {
  args: {
    title: '3. 注册数据渲染器',
    description: '注册自定义的数据字段渲染器，用于渲染特定类型的数据。',
    code: `import { RenderEngine, IDataRenderer } from '@schema-component/engine'

// 定义文本渲染器
const textRenderer: IDataRenderer = {
  type: 'string',

  render(value, field, context) {
    return {
      type: 'Text',
      props: {
        value: value || '',
        style: { color: '#1f2937' }
      }
    }
  },

  renderEdit(value, field, context) {
    return {
      type: 'Input',
      props: {
        value: value || '',
        placeholder: field.placeholder || \`Enter \${field.name}\`,
        maxLength: field.maxLength,
        required: field.required
      }
    }
  }
}

// 注册渲染器
const engine = RenderEngine.getInstance()
engine.registerDataRenderer(textRenderer)

console.log('Data renderer registered')
console.log('Type:', textRenderer.type)
console.log('Has edit mode:', !!textRenderer.renderEdit)`,
    result: `Data renderer registered
Type: string
Has edit mode: true`
  }
}

// 4. Register View Renderer
export const RegisterViewRenderer: Story = {
  args: {
    title: '4. 注册视图渲染器',
    description: '注册自定义的视图渲染器，用于渲染不同类型的视图（列表、表单等）。',
    code: `import { RenderEngine, IViewRenderer } from '@schema-component/engine'

// 定义列表视图渲染器
const listRenderer: IViewRenderer = {
  type: 'list',

  render(view, data, context) {
    return {
      type: 'Table',
      props: {
        title: view.title,
        columns: view.columns?.map(col => ({
          field: col.field,
          title: col.title || col.field,
          width: col.width,
          align: col.align,
          sortable: col.sortable
        })),
        dataSource: data,
        pagination: true
      }
    }
  }
}

// 注册视图渲染器
const engine = RenderEngine.getInstance()
engine.registerViewRenderer(listRenderer)

console.log('View renderer registered')
console.log('Type:', listRenderer.type)
console.log('Supports:', 'list views')`,
    result: `View renderer registered
Type: list
Supports: list views`
  }
}

// 5. Register Action Renderer
export const RegisterActionRenderer: Story = {
  args: {
    title: '5. 注册动作渲染器',
    description: '注册自定义的动作渲染器，用于渲染按钮、菜单等交互元素。',
    code: `import { RenderEngine, IActionRenderer } from '@schema-component/engine'

// 定义按钮渲染器
const buttonRenderer: IActionRenderer = {
  renderMode: 'button',

  renderServer(action, context) {
    return {
      type: 'Button',
      props: {
        type: action.buttonType || 'default',
        disabled: typeof action.disabled === 'function'
          ? action.disabled(context)
          : action.disabled,
        icon: action.icon,
        children: action.label,
        onClick: async () => {
          const params = action.getParams?.(context) || {}
          await context.actionQueue.enqueue(action, params, context)
        }
      }
    }
  },

  renderView(action, context) {
    return {
      type: 'Button',
      props: {
        type: action.buttonType || 'default',
        disabled: typeof action.disabled === 'function'
          ? action.disabled(context)
          : action.disabled,
        icon: action.icon,
        children: action.label,
        onClick: () => action.handler(context)
      }
    }
  }
}

// 注册动作渲染器
const engine = RenderEngine.getInstance()
engine.registerActionRenderer('button', buttonRenderer)

console.log('Action renderer registered')
console.log('Render mode:', buttonRenderer.renderMode)
console.log('Supports:', 'server and view actions')`,
    result: `Action renderer registered
Render mode: button
Supports: server and view actions`
  }
}

// 6. Create Render Context
export const CreateRenderContext: Story = {
  args: {
    title: '6. 创建渲染上下文',
    description: '渲染上下文包含渲染所需的所有信息，包括模型、数据、UI 控制器等。',
    code: `import { RenderEngine } from '@schema-component/engine'

const engine = RenderEngine.getInstance()

// 模拟模型
const UserModel = {
  name: 'User',
  schema: { /* ... */ },
  actions: { /* ... */ },
  views: { /* ... */ }
}

// 模拟数据
const userData = {
  id: 'usr_123',
  name: 'John Doe',
  email: 'john@example.com'
}

// 创建渲染上下文
const context = engine.createContext({
  modelName: 'User',
  model: UserModel,
  record: userData,

  // 可选的 UI 控制器
  modal: {
    open: (config) => console.log('Open modal:', config.title),
    close: () => console.log('Close modal')
  },

  message: {
    success: (msg) => console.log('Success:', msg),
    error: (msg) => console.error('Error:', msg)
  },

  navigate: (path) => console.log('Navigate to:', path)
})

console.log('Render context created')
console.log('Model:', context.modelName)
console.log('Record ID:', context.record?.id)
console.log('Has viewStack:', !!context.viewStack)
console.log('Has actionQueue:', !!context.actionQueue)`,
    result: `Render context created
Model: User
Record ID: usr_123
Has viewStack: true
Has actionQueue: true`
  }
}

// 7. Render Data Field
export const RenderDataField: Story = {
  args: {
    title: '7. 渲染数据字段',
    description: '使用已注册的数据渲染器渲染字段，支持查看和编辑模式。',
    code: `import { RenderEngine } from '@schema-component/engine'

const engine = RenderEngine.getInstance()

// 注册文本渲染器（见示例 3）
// engine.registerDataRenderer(textRenderer)

// 字段定义
const nameField = {
  name: 'name',
  type: 'string',
  required: true,
  maxLength: 100,
  placeholder: 'Enter name'
}

const context = engine.createContext({
  modelName: 'User',
  model: UserModel,
  record: { name: 'John Doe' }
})

// 渲染为查看模式
const viewDescriptor = engine.renderData(
  'John Doe',
  nameField,
  context,
  'view'
)

console.log('View mode descriptor:')
console.log(JSON.stringify(viewDescriptor, null, 2))

// 渲染为编辑模式
const editDescriptor = engine.renderData(
  'John Doe',
  nameField,
  context,
  'edit'
)

console.log('\\nEdit mode descriptor:')
console.log(JSON.stringify(editDescriptor, null, 2))`,
    result: `View mode descriptor:
{
  "type": "Text",
  "props": {
    "value": "John Doe",
    "style": { "color": "#1f2937" }
  }
}

Edit mode descriptor:
{
  "type": "Input",
  "props": {
    "value": "John Doe",
    "placeholder": "Enter name",
    "maxLength": 100,
    "required": true
  }
}`
  }
}

// 8. Render View
export const RenderView: Story = {
  args: {
    title: '8. 渲染视图',
    description: '使用已注册的视图渲染器渲染完整视图。',
    code: `import { RenderEngine } from '@schema-component/engine'

const engine = RenderEngine.getInstance()

// 注册列表渲染器（见示例 4）
// engine.registerViewRenderer(listRenderer)

// 视图定义
const listView = {
  type: 'list',
  title: 'User List',
  columns: [
    { field: 'name', title: 'Name', sortable: true, width: 200 },
    { field: 'email', title: 'Email', width: 250 },
    { field: 'role', title: 'Role', width: 100 }
  ]
}

// 数据
const users = [
  { id: '1', name: 'John Doe', email: 'john@example.com', role: 'admin' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'user' }
]

const context = engine.createContext({
  modelName: 'User',
  model: UserModel,
  records: users
})

// 渲染视图
const descriptor = engine.renderView(listView, users, context)

console.log('View descriptor:')
console.log(JSON.stringify(descriptor, null, 2))`,
    result: `View descriptor:
{
  "type": "Table",
  "props": {
    "title": "User List",
    "columns": [
      { "field": "name", "title": "Name", "width": 200, "sortable": true },
      { "field": "email", "title": "Email", "width": 250 },
      { "field": "role", "title": "Role", "width": 100 }
    ],
    "dataSource": [...],
    "pagination": true
  }
}`
  }
}

// 9. Render Action
export const RenderAction: Story = {
  args: {
    title: '9. 渲染动作',
    description: '使用已注册的动作渲染器渲染服务端和视图动作。',
    code: `import { RenderEngine } from '@schema-component/engine'

const engine = RenderEngine.getInstance()

// 注册按钮渲染器（见示例 5）
// engine.registerActionRenderer('button', buttonRenderer)

// 服务端动作
const saveAction = {
  type: 'server',
  name: 'save',
  label: 'Save',
  icon: 'SaveOutlined',
  buttonType: 'primary',
  renderAs: 'button',
  getParams: (ctx) => ({ id: ctx.record.id })
}

// 视图动作
const cancelAction = {
  type: 'view',
  name: 'cancel',
  label: 'Cancel',
  renderAs: 'button',
  handler: (ctx) => {
    ctx.viewStack.goBack()
  }
}

const context = engine.createContext({
  modelName: 'User',
  model: UserModel,
  record: { id: 'usr_123' }
})

// 渲染服务端动作
const saveDescriptor = engine.renderAction(saveAction, context)
console.log('Server action descriptor:')
console.log(JSON.stringify(saveDescriptor, null, 2))

// 渲染视图动作
const cancelDescriptor = engine.renderAction(cancelAction, context)
console.log('\\nView action descriptor:')
console.log(JSON.stringify(cancelDescriptor, null, 2))`,
    result: `Server action descriptor:
{
  "type": "Button",
  "props": {
    "type": "primary",
    "icon": "SaveOutlined",
    "children": "Save",
    "onClick": [Function]
  }
}

View action descriptor:
{
  "type": "Button",
  "props": {
    "type": "default",
    "children": "Cancel",
    "onClick": [Function]
  }
}`
  }
}

// 10. Execute Server Action
export const ExecuteServerAction: Story = {
  args: {
    title: '10. 执行服务端动作',
    description: '执行服务端动作，自动加入 ActionQueue 进行管理。',
    code: `import { RenderEngine } from '@schema-component/engine'

const engine = RenderEngine.getInstance()

// 模拟模型动作
const UserModel = {
  name: 'User',
  actions: {
    update: async (params) => {
      console.log('Updating user:', params.id)
      // 模拟异步操作
      await new Promise(resolve => setTimeout(resolve, 1000))
      return { id: params.id, updated: true }
    }
  }
}

// 服务端动作定义
const updateAction = {
  type: 'server',
  name: 'update',
  label: 'Update',
  onSuccess: (result, ctx) => {
    console.log('Update succeeded:', result)
    ctx.message?.success('User updated successfully')
  },
  onError: (error, ctx) => {
    console.error('Update failed:', error)
    ctx.message?.error(\`Update failed: \${error.message}\`)
  }
}

const context = engine.createContext({
  modelName: 'User',
  model: UserModel,
  record: { id: 'usr_123' },
  message: {
    success: (msg) => console.log('Success:', msg),
    error: (msg) => console.error('Error:', msg)
  }
})

// 执行动作
const taskId = await engine.executeServerAction(
  updateAction,
  { id: 'usr_123', name: 'John Updated' },
  context
)

console.log('Task ID:', taskId)
console.log('Task queued in ActionQueue')`,
    result: `Updating user: usr_123
Update succeeded: { id: 'usr_123', updated: true }
Success: User updated successfully
Task ID: task_1234567890_abc123
Task queued in ActionQueue`,
    isAsync: true
  }
}

// 11. Execute View Action
export const ExecuteViewAction: Story = {
  args: {
    title: '11. 执行视图动作',
    description: '执行纯前端视图动作，如导航、打开模态框等。',
    code: `import { RenderEngine } from '@schema-component/engine'

const engine = RenderEngine.getInstance()

// 视图动作：打开编辑表单
const editAction = {
  type: 'view',
  name: 'edit',
  label: 'Edit',
  handler: async (ctx) => {
    console.log('Opening edit form for:', ctx.record.id)

    // 推送编辑视图
    const formView = {
      type: 'form',
      title: 'Edit User',
      fields: ['name', 'email', 'role']
    }

    ctx.viewStack.push(formView, ctx.record, { mode: 'edit' })
    console.log('Edit view pushed to stack')
  }
}

const context = engine.createContext({
  modelName: 'User',
  model: UserModel,
  record: { id: 'usr_123', name: 'John Doe' }
})

// 执行视图动作
await engine.executeViewAction(editAction, context)

console.log('View action executed')
console.log('Current view:', engine.viewStack.current?.type)`,
    result: `Opening edit form for: usr_123
Edit view pushed to stack
View action executed
Current view: form`,
    isAsync: true
  }
}

// 12. Complete Rendering Flow
export const CompleteRenderingFlow: Story = {
  args: {
    title: '12. 完整渲染流程',
    description: '展示从注册渲染器到执行渲染的完整流程。',
    code: `import { RenderEngine } from '@schema-component/engine'

// 1. 获取引擎实例
const engine = RenderEngine.getInstance({
  actionQueueConfig: {
    concurrency: 3,
    timeout: 30000
  }
})

// 2. 注册所有渲染器
engine.registerDataRenderer(stringRenderer)
engine.registerDataRenderer(numberRenderer)
engine.registerViewRenderer(listRenderer)
engine.registerViewRenderer(formRenderer)
engine.registerActionRenderer('button', buttonRenderer)

// 3. 定义视图
const userListView = {
  type: 'list',
  title: 'Users',
  columns: [
    { field: 'name', title: 'Name', sortable: true },
    { field: 'email', title: 'Email' }
  ],
  actions: [
    {
      type: 'view',
      name: 'create',
      label: 'Create User',
      buttonType: 'primary',
      renderAs: 'button',
      handler: (ctx) => {
        ctx.viewStack.push(userFormView, {}, { mode: 'create' })
      }
    }
  ]
}

// 4. 创建上下文
const context = engine.createContext({
  modelName: 'User',
  model: UserModel,
  records: users
})

// 5. 渲染视图
const viewDescriptor = engine.renderView(userListView, users, context)

// 6. 渲染动作
const actions = userListView.actions.map(action =>
  engine.renderAction(action, context)
)

console.log('Rendering complete!')
console.log('View type:', viewDescriptor.type)
console.log('Actions rendered:', actions.length)
console.log('Ready to display')`,
    result: `Rendering complete!
View type: Table
Actions rendered: 1
Ready to display`,
    isAsync: true
  }
}

import type { Meta, StoryObj } from '@storybook/react'
import React, { useState, useEffect } from 'react'

/**
 * Getting Started - 快速开始示例
 * 演示如何使用 @schema-component/engine 的基础功能
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

    // 模拟代码执行
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
  title: 'Engine/Getting Started',
  component: CodeDemo,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: '通过交互式示例快速学习 @schema-component/engine 的核心功能。'
      }
    }
  }
}

export default meta
type Story = StoryObj<typeof CodeDemo>

// 1. 创建 Engine Context
export const CreateEngineContext: Story = {
  args: {
    title: '1. 创建 Engine Context',
    description: 'Engine Context 是引擎的核心入口，管理所有模块的生命周期。',
    code: `import { createEngineContext } from '@schema-component/engine'

// 创建引擎上下文
const engine = createEngineContext({
  apiBaseUrl: 'https://api.example.com',
  debug: true,
  defaultPageSize: 20
})

console.log('Engine created with config:', engine.config)`,
    result: `Engine created with config: {
  apiBaseUrl: 'https://api.example.com',
  debug: true,
  defaultPageSize: 20
}`
  }
}

// 2. 初始化引擎
export const InitializeEngine: Story = {
  args: {
    title: '2. 初始化引擎',
    description: '初始化引擎以激活所有模块。',
    code: `// 初始化引擎
await engine.initialize()

console.log('Is initialized:', engine.isInitialized())

// 获取配置
const apiBaseUrl = engine.getConfig('apiBaseUrl')
console.log('API Base URL:', apiBaseUrl)`,
    result: `Is initialized: true
API Base URL: https://api.example.com`,
    isAsync: true
  }
}

// 3. 使用事件总线
export const UseEventBus: Story = {
  args: {
    title: '3. 使用事件总线',
    description: '事件总线支持组件间的解耦通信。',
    code: `const eventBus = engine.getEventBus()

// 订阅事件
eventBus.subscribe('engine:initialized', (event) => {
  console.log('Engine initialized!', event.payload)
})

eventBus.subscribe('engine:destroying', (event) => {
  console.log('Engine destroying...')
})

// 发布自定义事件
eventBus.publish({
  type: 'custom:event',
  payload: { message: 'Hello from EventBus!' },
  timestamp: Date.now()
})`,
    result: `Engine initialized! { ... }
✓ Custom event published`
  }
}

// 4. 使用 DI 容器
export const UseDIContainer: Story = {
  args: {
    title: '4. 使用依赖注入容器',
    description: 'DI 容器管理服务的创建和依赖关系。',
    code: `// 定义服务
class Logger {
  log(message: string) {
    console.log(\`[Logger] \${message}\`)
  }
}

// 绑定服务
const LOGGER_TYPE = Symbol.for('Logger')
engine.bind(LOGGER_TYPE, Logger)

// 获取服务
const logger = engine.get<Logger>(LOGGER_TYPE)
logger.log('Hello from DI container!')`,
    result: `[Logger] Hello from DI container!`
  }
}

// 5. 定义 Model
export const DefineModel: Story = {
  args: {
    title: '5. 定义 Model',
    description: '使用 defineModel 创建类型安全的模型定义。',
    code: `import { defineModel } from '@schema-component/engine'

const UserModel = defineModel({
  name: 'User',
  schema: {
    fields: {
      id: { type: 'number', primary: true },
      name: { type: 'string', required: true },
      email: { type: 'string', required: true }
    }
  },
  actions: {
    sendEmail: async (userId: number, subject: string) => {
      console.log(\`Sending email to user \${userId}: \${subject}\`)
      return { success: true }
    }
  },
  views: {
    list: { type: 'list', title: 'Users' },
    detail: { type: 'detail', title: 'User Detail' }
  }
})

console.log('Model defined:', UserModel.name)`,
    result: `Model defined: User`
  }
}

// 6. 使用 Model Store
export const UseModelStore: Story = {
  args: {
    title: '6. 使用 Model Store',
    description: 'ModelStore 提供响应式的 CRUD 操作。',
    code: `import { createModelStore, createMockRepository } from '@schema-component/engine'

// 创建 repository
const repository = createMockRepository('User')

// 创建 store
const userStore = createModelStore({
  modelName: 'User',
  repository
})

// CRUD 操作
await userStore.create({
  name: 'Alice',
  email: 'alice@example.com'
})

await userStore.loadList({})

console.log('Total records:', userStore.total)
console.log('Has data:', userStore.hasData)`,
    result: `✓ User created
✓ List loaded
Total records: 1
Has data: true`,
    isAsync: true
  }
}

// 7. HTTP 客户端
export const UseHttpClient: Story = {
  args: {
    title: '7. 使用 HTTP 客户端',
    description: 'HTTP 客户端支持拦截器、重试等高级功能。',
    code: `import { createHttpClient } from '@schema-component/engine'

const httpClient = createHttpClient({
  baseURL: 'https://api.example.com',
  timeout: 5000
})

// 添加请求拦截器
httpClient.interceptors.request.use((config) => {
  config.headers.Authorization = 'Bearer token'
  return config
})

// 发送请求
const response = await httpClient.get('/users')
console.log('Users fetched:', response.data.length)`,
    result: `✓ Request interceptor applied
✓ Users fetched: 10`,
    isAsync: true
  }
}

// 8. 完整示例
export const CompleteExample: Story = {
  args: {
    title: '8. 完整示例',
    description: '结合多个模块构建完整的应用流程。',
    code: `// 1. 创建引擎
const engine = createEngineContext({
  apiBaseUrl: 'https://api.example.com'
})

// 2. 初始化
await engine.initialize()

// 3. 订阅事件
const eventBus = engine.getEventBus()
eventBus.subscribe('user:created', (event) => {
  console.log('New user:', event.payload.name)
})

// 4. 创建 store
const userStore = createModelStore({
  modelName: 'User',
  repository: createMockRepository('User')
})

// 5. 执行操作
const user = await userStore.create({
  name: 'Bob',
  email: 'bob@example.com'
})

// 6. 发布事件
eventBus.publish({
  type: 'user:created',
  payload: user,
  timestamp: Date.now()
})

// 7. 清理
await engine.destroy()`,
    result: `✓ Engine initialized
✓ User created: Bob
New user: Bob
✓ Engine destroyed`,
    isAsync: true
  }
}

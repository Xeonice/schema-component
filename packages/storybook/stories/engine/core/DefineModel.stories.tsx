import type { Meta, StoryObj } from '@storybook/react'
import React, { useState, useEffect } from 'react'

/**
 * Define Model - 模型定义示例
 * 演示如何使用 defineModel 创建功能完整的模型
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
  title: 'Engine/Core/Define Model',
  component: CodeDemo,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: '通过交互式示例学习如何使用 defineModel 创建模型。模型是 Engine 的核心概念，封装了数据结构、业务逻辑、视图配置等。'
      }
    }
  }
}

export default meta
type Story = StoryObj<typeof CodeDemo>

// 1. 基础模型定义
export const BasicModel: Story = {
  args: {
    title: '1. 基础模型定义',
    description: '最简单的模型定义，只包含名称和 schema。',
    code: `import { defineModel } from '@schema-component/engine'

const UserModel = defineModel({
  name: 'User',
  schema: {
    fields: {
      id: { type: 'string', required: true },
      name: { type: 'string', required: true },
      email: { type: 'string', required: true }
    }
  }
})

console.log('Model name:', UserModel.name)
console.log('Schema fields:', Object.keys(UserModel.schema.fields))`,
    result: `Model name: User
Schema fields: ['id', 'name', 'email']`
  }
}

// 2. 带 Schema 的模型
export const ModelWithSchema: Story = {
  args: {
    title: '2. 带完整 Schema 的模型',
    description: 'Schema 定义了字段类型、验证规则和默认值。',
    code: `const ProductModel = defineModel({
  name: 'Product',
  schema: {
    fields: {
      id: {
        type: 'string',
        primary: true
      },
      name: {
        type: 'string',
        required: true,
        maxLength: 100
      },
      description: {
        type: 'string',
        nullable: true
      },
      price: {
        type: 'number',
        required: true,
        min: 0
      },
      stock: {
        type: 'number',
        default: 0
      },
      isActive: {
        type: 'boolean',
        default: true
      },
      category: {
        type: 'string',
        enum: ['electronics', 'clothing', 'food']
      },
      tags: {
        type: 'array',
        items: { type: 'string' }
      },
      createdAt: {
        type: 'date',
        default: () => new Date()
      }
    }
  }
})

console.log('Product fields:', Object.keys(ProductModel.schema.fields))`,
    result: `Product fields: ['id', 'name', 'description', 'price', 'stock', 'isActive', 'category', 'tags', 'createdAt']`
  }
}

// 3. 带 Actions 的模型
export const ModelWithActions: Story = {
  args: {
    title: '3. 带 Actions 的模型',
    description: 'Actions 是具有副作用的业务逻辑操作，可以访问 repository 和 eventBus。',
    code: `const OrderModel = defineModel({
  name: 'Order',
  schema: {
    fields: {
      id: { type: 'string', required: true },
      userId: { type: 'string', required: true },
      status: { type: 'string', default: 'pending' },
      total: { type: 'number', required: true }
    }
  },

  // Actions 使用函数形式，可访问 context
  actions: (context) => ({
    // 确认订单
    confirm: async ({ id }: { id: string }) => {
      console.log(\`Confirming order \${id}...\`)

      const order = await context.repository.updateOne(id, {
        status: 'confirmed'
      })

      // 发布事件
      context.eventBus.publish({
        type: 'order:confirmed',
        payload: { id, order },
        timestamp: Date.now()
      })

      return order
    },

    // 取消订单
    cancel: async ({ id, reason }: { id: string; reason?: string }) => {
      console.log(\`Canceling order \${id}...\`, reason)

      const order = await context.repository.updateOne(id, {
        status: 'cancelled',
        cancelReason: reason
      })

      context.eventBus.publish({
        type: 'order:cancelled',
        payload: { id, order, reason },
        timestamp: Date.now()
      })

      return order
    },

    // 发货
    ship: async ({ id, trackingNumber }: { id: string; trackingNumber: string }) => {
      const order = await context.repository.updateOne(id, {
        status: 'shipped',
        trackingNumber
      })

      context.eventBus.publish({
        type: 'order:shipped',
        payload: { id, order, trackingNumber },
        timestamp: Date.now()
      })

      return order
    }
  })
})

console.log('Order actions:', Object.keys(OrderModel.actions))`,
    result: `Order actions: ['confirm', 'cancel', 'ship']`
  }
}

// 4. 带 Views 的模型
export const ModelWithViews: Story = {
  args: {
    title: '4. 带 Views 的模型',
    description: 'Views 定义了模型数据在 UI 中的渲染方式。',
    code: `const TaskModel = defineModel({
  name: 'Task',
  schema: {
    fields: {
      id: { type: 'string', required: true },
      title: { type: 'string', required: true },
      description: { type: 'string' },
      status: { type: 'string', default: 'todo' },
      priority: { type: 'string', default: 'medium' },
      assignee: { type: 'string' },
      dueDate: { type: 'date' }
    }
  },

  // Views 使用函数形式，可访问 context
  views: (context) => ({
    // 列表视图
    list: {
      type: 'list',
      title: \`\${context.modelName} List\`,
      columns: [
        { field: 'title', label: 'Title', sortable: true, width: 300 },
        { field: 'status', label: 'Status', width: 120 },
        { field: 'priority', label: 'Priority', width: 100 },
        { field: 'assignee', label: 'Assignee', width: 150 },
        { field: 'dueDate', label: 'Due Date', sortable: true, width: 150 }
      ],
      filters: [
        { field: 'status', type: 'select', options: ['todo', 'in_progress', 'done'] },
        { field: 'priority', type: 'select', options: ['low', 'medium', 'high'] }
      ],
      defaultSort: [{ field: 'dueDate', order: 'ASC' }]
    },

    // 表单视图
    form: {
      type: 'form',
      title: \`Edit \${context.modelName}\`,
      fields: [
        { name: 'title', label: 'Title', required: true },
        { name: 'description', label: 'Description', widget: 'textarea' },
        { name: 'status', label: 'Status', widget: 'select' },
        { name: 'priority', label: 'Priority', widget: 'select' },
        { name: 'assignee', label: 'Assignee', widget: 'user-select' },
        { name: 'dueDate', label: 'Due Date', widget: 'date-picker' }
      ],
      layout: 'vertical'
    },

    // 详情视图
    detail: {
      type: 'detail',
      title: \`\${context.modelName} Details\`,
      sections: [
        {
          title: 'Basic Info',
          fields: ['title', 'description', 'status']
        },
        {
          title: 'Assignment',
          fields: ['assignee', 'priority', 'dueDate']
        }
      ]
    },

    // 看板视图
    kanban: {
      type: 'kanban',
      title: 'Task Board',
      groupBy: 'status',
      cardFields: ['title', 'assignee', 'priority', 'dueDate']
    }
  })
})

console.log('Task views:', Object.keys(TaskModel.views))`,
    result: `Task views: ['list', 'form', 'detail', 'kanban']`
  }
}

// 5. 带 Hooks 的模型
export const ModelWithHooks: Story = {
  args: {
    title: '5. 带 Hooks 的模型',
    description: 'Hooks 允许你在模型生命周期的关键点拦截和修改数据。',
    code: `const ArticleModel = defineModel({
  name: 'Article',
  schema: {
    fields: {
      id: { type: 'string', required: true },
      title: { type: 'string', required: true },
      content: { type: 'string', required: true },
      slug: { type: 'string', required: true },
      status: { type: 'string', default: 'draft' },
      publishedAt: { type: 'date' },
      authorId: { type: 'string', required: true }
    }
  },

  hooks: {
    // 创建前
    beforeCreate: async (data) => {
      console.log('[beforeCreate] Processing new article...')

      // 自动生成 slug
      if (!data.slug && data.title) {
        data.slug = data.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
      }

      // 添加时间戳
      data.createdAt = new Date()
      data.updatedAt = new Date()

      return data
    },

    // 创建后
    afterCreate: async (article) => {
      console.log('[afterCreate] Article created:', article.id)

      // 发送通知
      console.log('  → Sending notification to author...')
      console.log('  → Updating search index...')
      console.log('  → Generating preview image...')
    },

    // 更新前
    beforeUpdate: async (id, data) => {
      console.log(\`[beforeUpdate] Updating article \${id}...\`)

      // 更新修改时间
      data.updatedAt = new Date()

      // 如果发布，记录发布时间
      if (data.status === 'published' && !data.publishedAt) {
        data.publishedAt = new Date()
        console.log('  → Publishing article...')
      }

      return data
    },

    // 更新后
    afterUpdate: async (article) => {
      console.log('[afterUpdate] Article updated:', article.id)

      // 清除缓存
      console.log('  → Clearing cache...')

      // 如果已发布，通知订阅者
      if (article.status === 'published') {
        console.log('  → Notifying subscribers...')
      }
    },

    // 删除前
    beforeDelete: async (id) => {
      console.log(\`[beforeDelete] Checking if article \${id} can be deleted...\`)

      // 可以在这里添加删除前的检查
      // 如果返回 false，可以阻止删除
      return true
    },

    // 删除后
    afterDelete: async (id) => {
      console.log(\`[afterDelete] Article \${id} deleted\`)
      console.log('  → Cleaning up related resources...')
      console.log('  → Removing from search index...')
    }
  }
})

console.log('Article hooks:', Object.keys(ArticleModel.hooks))`,
    result: `Article hooks: ['beforeCreate', 'afterCreate', 'beforeUpdate', 'afterUpdate', 'beforeDelete', 'afterDelete']`
  }
}

// 6. 完整模型示例
export const CompleteModel: Story = {
  args: {
    title: '6. 完整模型示例',
    description: '结合所有特性的完整模型定义，展示 defineModel 的全部能力。',
    code: `const UserModel = defineModel({
  // 模型名称
  name: 'User',

  // Schema 定义
  schema: {
    fields: {
      id: { type: 'string', required: true },
      name: { type: 'string', required: true },
      email: { type: 'string', required: true },
      role: { type: 'string', default: 'user' },
      isActive: { type: 'boolean', default: true },
      avatar: { type: 'string' },
      createdAt: { type: 'date' },
      updatedAt: { type: 'date' }
    }
  },

  // Views 定义（函数形式）
  views: (context) => ({
    list: {
      type: 'list',
      title: \`\${context.modelName} List\`,
      columns: [
        { field: 'name', label: 'Name', sortable: true },
        { field: 'email', label: 'Email' },
        { field: 'role', label: 'Role' },
        { field: 'isActive', label: 'Active', width: 100 }
      ]
    },
    form: {
      type: 'form',
      title: \`Edit \${context.modelName}\`,
      fields: ['name', 'email', 'role', 'avatar']
    }
  }),

  // Actions 定义（函数形式）
  actions: (context) => ({
    activate: async ({ id }: { id: string }) => {
      const user = await context.repository.updateOne(id, { isActive: true })
      context.eventBus.publish({
        type: 'user:activated',
        payload: { id, user },
        timestamp: Date.now()
      })
      return user
    },

    deactivate: async ({ id }: { id: string }) => {
      const user = await context.repository.updateOne(id, { isActive: false })
      context.eventBus.publish({
        type: 'user:deactivated',
        payload: { id, user },
        timestamp: Date.now()
      })
      return user
    }
  }),

  // APIs 定义
  apis: {
    getList: async (params) => {
      const repository = UserModel.context.repository
      return repository.getList(params || {})
    },

    getOne: async (id: string) => {
      const repository = UserModel.context.repository
      return repository.getOne(id)
    },

    createOne: async (data: any) => {
      const repository = UserModel.context.repository
      return repository.createOne(data)
    }
  },

  // Hooks 定义
  hooks: {
    beforeCreate: async (data) => {
      return {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    },

    afterCreate: async (user) => {
      console.log(\`Welcome email sent to \${user.email}\`)
    }
  },

  // Methods 定义
  methods: {
    resetPassword: async (id: string) => {
      const token = 'reset-token-' + Date.now()
      console.log(\`Password reset token for \${id}: \${token}\`)
      return { token, sent: true }
    },

    sendEmail: async (id: string, subject: string) => {
      console.log(\`Email sent to user \${id}: \${subject}\`)
      return { sent: true }
    }
  },

  // Options
  options: {
    tableName: 'users',
    description: 'User management model',
    timestamps: true
  }
})

// 使用模型
console.log('Model:', UserModel.name)
console.log('Views:', Object.keys(UserModel.views))
console.log('Actions:', Object.keys(UserModel.actions))
console.log('APIs:', Object.keys(UserModel.apis))
console.log('Hooks:', Object.keys(UserModel.hooks))
console.log('Methods:', Object.keys(UserModel.methods))`,
    result: `Model: User
Views: ['list', 'form']
Actions: ['activate', 'deactivate']
APIs: ['getList', 'getOne', 'createOne']
Hooks: ['beforeCreate', 'afterCreate']
Methods: ['resetPassword', 'sendEmail']`,
    isAsync: true
  }
}

// 7. 使用模型
export const UsingModel: Story = {
  args: {
    title: '7. 使用模型',
    description: '注册模型并使用 executeAction 和 callApi 函数执行操作。',
    code: `import {
  defineModel,
  registerModel,
  getModel,
  executeAction,
  callApi
} from '@schema-component/engine'

// 1. 定义模型
const UserModel = defineModel({
  name: 'User',
  schema: { /* ... */ },
  actions: (context) => ({
    activate: async ({ id }) => {
      return context.repository.updateOne(id, { isActive: true })
    }
  }),
  apis: {
    getList: async (params) => {
      return UserModel.context.repository.getList(params)
    },
    createOne: async (data) => {
      return UserModel.context.repository.createOne(data)
    }
  }
})

// 2. 注册模型
registerModel(UserModel)

// 3. 获取已注册的模型
const model = getModel('User')
console.log('Retrieved model:', model?.name)

// 4. 调用 API
const user = await callApi(UserModel, 'createOne', {
  name: 'John Doe',
  email: 'john@example.com'
})
console.log('Created user:', user.id)

// 5. 执行 Action
await executeAction(UserModel, 'activate', { id: user.id })
console.log('User activated')

// 6. 获取列表
const list = await callApi(UserModel, 'getList', {
  pagination: { page: 1, pageSize: 10 }
})
console.log('Total users:', list.total)`,
    result: `Retrieved model: User
Created user: usr_123
User activated
Total users: 1`,
    isAsync: true
  }
}

// 8. 类型安全
export const TypeSafety: Story = {
  args: {
    title: '8. TypeScript 类型安全',
    description: 'defineModel 提供完整的 TypeScript 类型支持。',
    code: `// 定义类型
interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'user' | 'guest'
  isActive: boolean
}

// 创建类型安全的模型
const UserModel = defineModel({
  name: 'User',

  schema: {
    fields: {
      id: { type: 'string', required: true },
      name: { type: 'string', required: true },
      email: { type: 'string', required: true },
      role: { type: 'string', default: 'user' },
      isActive: { type: 'boolean', default: true }
    }
  },

  actions: (context) => ({
    // 类型安全的参数和返回值
    create: async (data: Omit<User, 'id'>): Promise<User> => {
      return context.repository.createOne({
        id: 'usr_' + Date.now(),
        ...data
      })
    },

    update: async (id: string, data: Partial<User>): Promise<User> => {
      return context.repository.updateOne(id, data)
    },

    findByEmail: async (email: string): Promise<User | null> => {
      const result = await context.repository.getList({
        filter: { email }
      })
      return result.data[0] || null
    }
  }),

  methods: {
    // 类型安全的工具方法
    isAdmin: (user: User): boolean => {
      return user.role === 'admin'
    },

    canAccess: (user: User, resource: string): boolean => {
      if (user.role === 'admin') return true
      if (user.role === 'user') return resource !== 'admin'
      return false
    }
  }
})

// TypeScript 会进行类型检查
// ✓ 正确的用法
await UserModel.actions.create({
  name: 'John',
  email: 'john@example.com',
  role: 'admin',
  isActive: true
})

// ✗ 错误的用法（TypeScript 会报错）
// await UserModel.actions.create({
//   name: 'John'
//   // 缺少必需的字段
// })`,
    result: `✓ TypeScript provides full type checking
✓ Autocomplete in IDE
✓ Compile-time error detection`
  }
}

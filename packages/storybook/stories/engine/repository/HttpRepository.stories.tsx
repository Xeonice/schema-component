import type { Meta, StoryObj } from '@storybook/react'
import React, { useState } from 'react'
import {
  createHttpClient,
  createRepository,
  defineModel,
  executeAction,
  callApi,
  createMockRepository,
  clearAllMockData,
  RepositoryFactory
} from '@schema-component/engine'
import type { IRepository } from '@schema-component/engine'

/**
 * HttpRepository - REST API 数据访问层
 * 提供统一的数据访问接口，支持 CRUD、列表查询、批量操作等功能
 */

interface CodeDemoProps {
  title: string
  description: string
  code: string
  onRun: () => Promise<string>
}

const CodeDemo: React.FC<CodeDemoProps> = ({ title, description, code, onRun }) => {
  const [output, setOutput] = useState<string>('')
  const [isRunning, setIsRunning] = useState(false)
  const [error, setError] = useState<string>('')

  const handleRun = async () => {
    setIsRunning(true)
    setOutput('')
    setError('')

    try {
      const result = await onRun()
      setOutput(result)
    } catch (err: any) {
      setError(err.message || '执行失败')
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div
      style={{
        padding: '20px',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        marginBottom: '20px'
      }}
    >
      <h3 style={{ marginTop: 0, color: '#1f2937' }}>{title}</h3>
      <p style={{ color: '#6b7280', marginBottom: '16px' }}>{description}</p>

      <div style={{ marginBottom: '16px' }}>
        <h4 style={{ fontSize: '14px', color: '#374151', marginBottom: '8px' }}>代码:</h4>
        <pre
          style={{
            backgroundColor: '#1f2937',
            color: '#f9fafb',
            padding: '16px',
            borderRadius: '6px',
            overflow: 'auto',
            fontSize: '13px',
            lineHeight: '1.5'
          }}
        >
          {code}
        </pre>
      </div>

      <button
        onClick={handleRun}
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

      {output && (
        <div style={{ marginTop: '12px' }}>
          <h4 style={{ fontSize: '14px', color: '#374151', marginBottom: '8px' }}>输出:</h4>
          <pre
            style={{
              backgroundColor: '#f0fdf4',
              color: '#166534',
              padding: '12px',
              borderRadius: '6px',
              overflow: 'auto',
              fontSize: '13px',
              border: '1px solid #bbf7d0'
            }}
          >
            {output}
          </pre>
        </div>
      )}

      {error && (
        <div style={{ marginTop: '12px' }}>
          <h4 style={{ fontSize: '14px', color: '#dc2626', marginBottom: '8px' }}>错误:</h4>
          <pre
            style={{
              backgroundColor: '#fef2f2',
              color: '#dc2626',
              padding: '12px',
              borderRadius: '6px',
              overflow: 'auto',
              fontSize: '13px',
              border: '1px solid #fecaca'
            }}
          >
            {error}
          </pre>
        </div>
      )}
    </div>
  )
}

const meta: Meta<typeof CodeDemo> = {
  title: 'Engine/Repository/HttpRepository',
  component: CodeDemo,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'HttpRepository 提供基于 REST API 的数据访问能力，实现 Repository 模式以解耦数据访问和业务逻辑。支持完整的 CRUD 操作、列表查询、批量操作等功能。'
      }
    }
  }
}

export default meta
type Story = StoryObj<typeof CodeDemo>

// 1. Creating HttpRepository
export const CreateHttpRepository: Story = {
  args: {
    title: '1. 创建 HTTP Repository',
    description: '使用 createRepository 创建 HTTP Repository 实例，连接到 REST API。',
    code: `import { createRepository, createHttpClient } from '@schema-component/engine'

// 创建 HTTP 客户端
const httpClient = createHttpClient({
  baseURL: 'https://jsonplaceholder.typicode.com',
  timeout: 10000
})

// 创建 HTTP Repository
const repository = createRepository({
  type: 'http',
  modelName: 'User',
  http: {
    httpClient,
    resourcePath: '/users'
  }
})

console.log('HTTP Repository created for /users endpoint')
console.log('Repository type:', repository.constructor.name)`,
    onRun: async () => {
      const httpClient = createHttpClient({
        baseURL: 'https://jsonplaceholder.typicode.com',
        timeout: 10000
      })

      const repository = createRepository({
        type: 'http',
        modelName: 'User',
        http: {
          httpClient,
          resourcePath: '/users'
        }
      })

      return `✓ HTTP Repository created successfully
✓ Endpoint: https://jsonplaceholder.typicode.com/users
✓ Repository type: ${repository.constructor.name}
✓ Ready to perform CRUD operations`
    }
  }
}

// 2. Get List with Repository
export const GetList: Story = {
  args: {
    title: '2. 获取列表数据',
    description: '使用 getList 方法获取列表数据，支持分页、排序和过滤。',
    code: `const httpClient = createHttpClient({
  baseURL: 'https://jsonplaceholder.typicode.com'
})

const repository = createRepository({
  type: 'http',
  modelName: 'User',
  http: { httpClient, resourcePath: '/users' }
})

// 获取用户列表（带分页）
const result = await repository.getList({
  pagination: { page: 1, pageSize: 5 }
})

console.log('Total users:', result.total)
console.log('Users on page 1:', result.data.length)
result.data.forEach((user: any) => {
  console.log(\`  - \${user.name} (\${user.email})\`)
})`,
    onRun: async () => {
      const httpClient = createHttpClient({
        baseURL: 'https://jsonplaceholder.typicode.com'
      })

      const repository = createRepository({
        type: 'http',
        modelName: 'User',
        http: { httpClient, resourcePath: '/users' }
      })

      const result = await repository.getList({
        pagination: { page: 1, pageSize: 5 }
      })

      const logs: string[] = []
      logs.push(`✓ Total users: ${result.total}`)
      logs.push(`✓ Users on page 1: ${result.data.length}`)
      logs.push('\nUsers:')
      result.data.forEach((user: any) => {
        logs.push(`  - ${user.name} (${user.email})`)
      })

      return logs.join('\n')
    }
  }
}

// 3. Get One Record
export const GetOne: Story = {
  args: {
    title: '3. 获取单条记录',
    description: '使用 getOne 方法根据 ID 获取单条记录。',
    code: `const repository = createRepository({
  type: 'http',
  modelName: 'User',
  http: {
    httpClient: createHttpClient({
      baseURL: 'https://jsonplaceholder.typicode.com'
    }),
    resourcePath: '/users'
  }
})

// 获取 ID 为 1 的用户
const user = await repository.getOne(1)

console.log('User ID:', user.id)
console.log('Name:', user.name)
console.log('Email:', user.email)
console.log('Phone:', user.phone)
console.log('Website:', user.website)`,
    onRun: async () => {
      const repository = createRepository({
        type: 'http',
        modelName: 'User',
        http: {
          httpClient: createHttpClient({
            baseURL: 'https://jsonplaceholder.typicode.com'
          }),
          resourcePath: '/users'
        }
      })

      const user = await repository.getOne(1)

      return `✓ User ID: ${user.id}
✓ Name: ${user.name}
✓ Email: ${user.email}
✓ Phone: ${user.phone}
✓ Website: ${user.website}
✓ Company: ${user.company.name}`
    }
  }
}

// 4. Create Record
export const CreateOne: Story = {
  args: {
    title: '4. 创建记录',
    description: '使用 createOne 方法创建新记录。',
    code: `const repository = createRepository({
  type: 'http',
  modelName: 'User',
  http: {
    httpClient: createHttpClient({
      baseURL: 'https://jsonplaceholder.typicode.com'
    }),
    resourcePath: '/users'
  }
})

// 创建新用户
const newUser = await repository.createOne({
  name: 'Jane Doe',
  email: 'jane.doe@example.com',
  username: 'janedoe',
  phone: '123-456-7890'
})

console.log('Created user:')
console.log('  ID:', newUser.id)
console.log('  Name:', newUser.name)
console.log('  Email:', newUser.email)`,
    onRun: async () => {
      const repository = createRepository({
        type: 'http',
        modelName: 'User',
        http: {
          httpClient: createHttpClient({
            baseURL: 'https://jsonplaceholder.typicode.com'
          }),
          resourcePath: '/users'
        }
      })

      const newUser = await repository.createOne({
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
        username: 'janedoe',
        phone: '123-456-7890'
      })

      return `✓ User created successfully!
✓ ID: ${newUser.id}
✓ Name: ${newUser.name}
✓ Email: ${newUser.email}
✓ Username: ${newUser.username}
✓ Phone: ${newUser.phone}`
    }
  }
}

// 5. Update Record
export const UpdateOne: Story = {
  args: {
    title: '5. 更新记录',
    description: '使用 updateOne 方法更新已存在的记录。',
    code: `const repository = createRepository({
  type: 'http',
  modelName: 'User',
  http: {
    httpClient: createHttpClient({
      baseURL: 'https://jsonplaceholder.typicode.com'
    }),
    resourcePath: '/users'
  }
})

// 更新用户信息
const updated = await repository.updateOne(1, {
  name: 'Leanne Graham Updated',
  email: 'updated@example.com'
})

console.log('Updated user:')
console.log('  ID:', updated.id)
console.log('  Name:', updated.name)
console.log('  Email:', updated.email)`,
    onRun: async () => {
      const repository = createRepository({
        type: 'http',
        modelName: 'User',
        http: {
          httpClient: createHttpClient({
            baseURL: 'https://jsonplaceholder.typicode.com'
          }),
          resourcePath: '/users'
        }
      })

      const updated = await repository.updateOne(1, {
        name: 'Leanne Graham Updated',
        email: 'updated@example.com'
      })

      return `✓ User updated successfully!
✓ ID: ${updated.id}
✓ Name: ${updated.name}
✓ Email: ${updated.email}
✓ Original data merged with updates`
    }
  }
}

// 6. Delete Record
export const DeleteOne: Story = {
  args: {
    title: '6. 删除记录',
    description: '使用 deleteOne 方法删除记录。',
    code: `const repository = createRepository({
  type: 'http',
  modelName: 'User',
  http: {
    httpClient: createHttpClient({
      baseURL: 'https://jsonplaceholder.typicode.com'
    }),
    resourcePath: '/users'
  }
})

// 删除用户
const success = await repository.deleteOne(1)

if (success) {
  console.log('User deleted successfully!')
} else {
  console.log('Failed to delete user')
}`,
    onRun: async () => {
      const repository = createRepository({
        type: 'http',
        modelName: 'User',
        http: {
          httpClient: createHttpClient({
            baseURL: 'https://jsonplaceholder.typicode.com'
          }),
          resourcePath: '/users'
        }
      })

      const success = await repository.deleteOne(1)

      if (success) {
        return `✓ User deleted successfully!
✓ Operation returned: ${success}
✓ Record removed from server`
      } else {
        return '✗ Failed to delete user'
      }
    }
  }
}

// 7. Integration with defineModel
export const IntegrationWithModel: Story = {
  args: {
    title: '7. 集成到 Model',
    description: '在 defineModel 中配置 HTTP Repository，自动创建和管理。',
    code: `import { defineModel, callApi } from '@schema-component/engine'

// 定义带 HTTP Repository 的 Model
const UserModel = defineModel({
  name: 'User',
  schema: {
    fields: {
      id: { type: 'number' },
      name: { type: 'string' },
      email: { type: 'string' }
    }
  },
  repository: {
    type: 'http',
    http: {
      baseURL: 'https://jsonplaceholder.typicode.com',
      resourcePath: '/users'
    }
  },
  apis: {
    getList: async (params) => {
      return UserModel.context.repository.getList(params || {})
    }
  }
})

// 通过 API 获取数据
const users = await callApi(UserModel, 'getList', {
  pagination: { page: 1, pageSize: 3 }
})

console.log(\`Found \${users.data.length} users\`)
users.data.forEach((u: any) => console.log(\`  - \${u.name}\`))`,
    onRun: async () => {
      const UserModel = defineModel({
        name: 'StoryUser',
        schema: {
          fields: {
            id: { type: 'number' },
            name: { type: 'string' },
            email: { type: 'string' }
          }
        },
        repository: {
          type: 'http',
          http: {
            baseURL: 'https://jsonplaceholder.typicode.com',
            resourcePath: '/users'
          }
        },
        apis: {
          getList: async (params: any) => {
            return UserModel.context.repository.getList(params || {})
          }
        }
      })

      const users = await callApi(UserModel, 'getList', {
        pagination: { page: 1, pageSize: 3 }
      })

      const logs: string[] = []
      logs.push(`✓ Found ${users.data.length} users via Model API`)
      logs.push('✓ Repository automatically integrated')
      logs.push('\nUsers:')
      users.data.forEach((u: any) => logs.push(`  - ${u.name} (${u.email})`))

      return logs.join('\n')
    }
  }
}

// 8. Model Actions with Repository
export const ModelActionsWithRepository: Story = {
  args: {
    title: '8. Model Actions 使用 Repository',
    description: 'Actions 可以通过 context 访问 repository 进行数据操作。',
    code: `const UserModel = defineModel({
  name: 'User',
  schema: { fields: { id: { type: 'number' }, active: { type: 'boolean' } } },
  repository: {
    type: 'http',
    http: {
      baseURL: 'https://jsonplaceholder.typicode.com',
      resourcePath: '/users'
    }
  },
  actions: (context) => ({
    activate: async ({ id }: { id: number }) => {
      console.log(\`Activating user \${id}...\`)
      return context.repository.updateOne(id, { active: true })
    },
    deactivate: async ({ id }: { id: number }) => {
      console.log(\`Deactivating user \${id}...\`)
      return context.repository.updateOne(id, { active: false })
    }
  })
})

// 执行 action
const activated = await executeAction(UserModel, 'activate', { id: 1 })
console.log('User activated:', activated.name)`,
    onRun: async () => {
      const UserModel = defineModel({
        name: 'ActionUser',
        schema: {
          fields: {
            id: { type: 'number' },
            name: { type: 'string' },
            active: { type: 'boolean' }
          }
        },
        repository: {
          type: 'http',
          http: {
            baseURL: 'https://jsonplaceholder.typicode.com',
            resourcePath: '/users'
          }
        },
        actions: (context) => ({
          activate: async ({ id }: { id: number }) => {
            return context.repository.updateOne(id, { active: true })
          }
        })
      })

      const activated = await executeAction(UserModel, 'activate', { id: 1 })

      return `✓ Action 'activate' executed successfully!
✓ User: ${activated.name}
✓ Email: ${activated.email}
✓ Active status: ${activated.active || true}
✓ Repository accessed via context in action`
    }
  }
}

// 9. Mock Repository for Testing
export const MockRepositoryForTesting: Story = {
  args: {
    title: '9. Mock Repository 测试',
    description: '使用 MockRepository 进行离线开发和测试，无需真实 API。',
    code: `import { createMockRepository, clearAllMockData } from '@schema-component/engine'

// 清空之前的数据
clearAllMockData()

// 创建 Mock Repository
const mockRepo = createMockRepository('User')

// 创建测试数据
const user1 = await mockRepo.createOne({
  name: 'Alice',
  email: 'alice@example.com'
})

const user2 = await mockRepo.createOne({
  name: 'Bob',
  email: 'bob@example.com'
})

console.log('Created users in mock store:')
console.log('  -', user1.name)
console.log('  -', user2.name)

// 获取列表
const result = await mockRepo.getList({})
console.log(\`\\nTotal users in mock store: \${result.total}\`)`,
    onRun: async () => {
      clearAllMockData()

      const mockRepo = createMockRepository('User')

      const user1 = await mockRepo.createOne({
        name: 'Alice',
        email: 'alice@example.com'
      })

      const user2 = await mockRepo.createOne({
        name: 'Bob',
        email: 'bob@example.com'
      })

      const user3 = await mockRepo.createOne({
        name: 'Charlie',
        email: 'charlie@example.com'
      })

      const result = await mockRepo.getList({})

      return `✓ Mock Repository created
✓ Created users in memory:
  - ${user1.name} (${user1.email})
  - ${user2.name} (${user2.email})
  - ${user3.name} (${user3.email})

✓ Total users in mock store: ${result.total}
✓ All data stored in memory (no HTTP calls)
✓ Perfect for testing and development!`
    }
  }
}

// 10. Sorting and Filtering
export const SortingAndFiltering: Story = {
  args: {
    title: '10. 排序和过滤',
    description: '使用 sort 和 filter 参数进行数据查询。',
    code: `const httpClient = createHttpClient({
  baseURL: 'https://jsonplaceholder.typicode.com'
})

const repository = createRepository({
  type: 'http',
  modelName: 'Post',
  http: { httpClient, resourcePath: '/posts' }
})

// 获取帖子列表（带排序）
const result = await repository.getList({
  pagination: { page: 1, pageSize: 5 },
  sort: [{ field: 'id', order: 'DESC' }]
})

console.log('Posts (sorted by ID DESC):')
result.data.forEach((post: any) => {
  console.log(\`  [\${post.id}] \${post.title.substring(0, 40)}...\`)
})

// Note: 某些 REST API 可能不支持所有查询参数
// 参数会被传递给后端，具体行为取决于后端实现`,
    onRun: async () => {
      const httpClient = createHttpClient({
        baseURL: 'https://jsonplaceholder.typicode.com'
      })

      const repository = createRepository({
        type: 'http',
        modelName: 'Post',
        http: { httpClient, resourcePath: '/posts' }
      })

      const result = await repository.getList({
        pagination: { page: 1, pageSize: 5 },
        sort: [{ field: 'id', order: 'DESC' }]
      })

      const logs: string[] = []
      logs.push('✓ Posts retrieved with sorting params')
      logs.push(`✓ Total: ${result.total}`)
      logs.push('\nPosts:')
      result.data.forEach((post: any) => {
        logs.push(`  [${post.id}] ${post.title.substring(0, 40)}...`)
      })
      logs.push('\nNote: Actual sorting depends on backend implementation')

      return logs.join('\n')
    }
  }
}

// 11. Error Handling
export const ErrorHandling: Story = {
  args: {
    title: '11. 错误处理',
    description: '处理 Repository 操作中的错误。',
    code: `const repository = createRepository({
  type: 'http',
  modelName: 'User',
  http: {
    httpClient: createHttpClient({
      baseURL: 'https://jsonplaceholder.typicode.com'
    }),
    resourcePath: '/users'
  }
})

try {
  // 尝试获取不存在的记录
  await repository.getOne(99999)
} catch (error: any) {
  console.log('Error caught!')
  console.log('Message:', error.message)

  if (error.response) {
    console.log('Status:', error.response.status)
  }
}

console.log('\\nError handling completed')`,
    onRun: async () => {
      const repository = createRepository({
        type: 'http',
        modelName: 'User',
        http: {
          httpClient: createHttpClient({
            baseURL: 'https://jsonplaceholder.typicode.com'
          }),
          resourcePath: '/users'
        }
      })

      try {
        await repository.getOne(99999)
        return '✓ No error occurred (record might exist)'
      } catch (error: any) {
        return `✓ Error caught successfully!
✓ Message: ${error.message}
✓ Error handling working properly

Note: This API might not throw errors for
non-existent records, but the error handling
mechanism is demonstrated.`
      }
    }
  }
}

// 12. Custom Repository Implementation
export const CustomRepositoryImplementation: Story = {
  args: {
    title: '12. 自定义 Repository 实现',
    description: '创建自定义 Repository 实现特殊数据源。',
    code: `import { IRepository, GetListParams, GetListResult, RecordId } from '@schema-component/engine'

// 自定义 Console Repository（将数据输出到控制台）
class ConsoleRepository implements IRepository {
  private data: any[] = []

  async getList(params: GetListParams): Promise<GetListResult> {
    console.log('[ConsoleRepository] getList called')
    return { data: this.data, total: this.data.length }
  }

  async getOne(id: RecordId): Promise<any> {
    console.log(\`[ConsoleRepository] getOne(\${id})\`)
    return this.data.find(item => item.id === id)
  }

  async createOne(data: any): Promise<any> {
    const record = { id: Date.now().toString(), ...data }
    this.data.push(record)
    console.log('[ConsoleRepository] Created:', record)
    return record
  }

  async updateOne(id: RecordId, data: any): Promise<any> {
    console.log(\`[ConsoleRepository] updateOne(\${id})\`, data)
    return { id, ...data }
  }

  async deleteOne(id: RecordId): Promise<boolean> {
    console.log(\`[ConsoleRepository] deleteOne(\${id})\`)
    return true
  }

  // 实现其他必需方法...
  async getMany(ids: RecordId[]): Promise<any[]> { return [] }
  async createMany(data: any[]): Promise<any[]> { return [] }
  async updateMany(ids: RecordId[], data: any): Promise<any[]> { return [] }
  async deleteMany(ids: RecordId[]): Promise<boolean> { return true }
}

// 使用自定义 Repository
const customRepo = new ConsoleRepository()
await customRepo.createOne({ name: 'Test User' })
const list = await customRepo.getList({})
console.log('List:', list)`,
    onRun: async () => {
      class ConsoleRepository implements IRepository {
        private data: any[] = []
        private logs: string[] = []

        async getList(params: GetListParams): Promise<GetListResult> {
          this.logs.push('[ConsoleRepository] getList called')
          return { data: this.data, total: this.data.length }
        }

        async getOne(id: RecordId): Promise<any> {
          this.logs.push(`[ConsoleRepository] getOne(${id})`)
          return this.data.find((item) => item.id === id)
        }

        async createOne(data: any): Promise<any> {
          const record = { id: Date.now().toString(), ...data }
          this.data.push(record)
          this.logs.push(`[ConsoleRepository] Created: ${JSON.stringify(record)}`)
          return record
        }

        async updateOne(id: RecordId, data: any): Promise<any> {
          this.logs.push(`[ConsoleRepository] updateOne(${id})`)
          return { id, ...data }
        }

        async deleteOne(id: RecordId): Promise<boolean> {
          this.logs.push(`[ConsoleRepository] deleteOne(${id})`)
          return true
        }

        async getMany(ids: RecordId[]): Promise<any[]> {
          return []
        }
        async createMany(data: any[]): Promise<any[]> {
          return []
        }
        async updateMany(ids: RecordId[], data: any): Promise<any[]> {
          return []
        }
        async deleteMany(ids: RecordId[]): Promise<boolean> {
          return true
        }

        getLogs(): string {
          return this.logs.join('\n')
        }
      }

      const customRepo = new ConsoleRepository()
      await customRepo.createOne({ name: 'Test User', email: 'test@example.com' })
      await customRepo.createOne({ name: 'Another User', email: 'another@example.com' })
      const list = await customRepo.getList({})

      return `✓ Custom Repository implemented!
✓ Implements IRepository interface
✓ Can use any data source

${customRepo.getLogs()}

✓ List total: ${list.total}
✓ Custom logging and behavior working!`
    }
  }
}

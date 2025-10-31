/**
 * Basic Model Example
 * 演示如何使用 defineModel 定义和使用 Model
 */

import {
  defineModel,
  registerModel,
  getModel,
  executeAction,
  callApi,
  createEngineContext
} from '../../src'

// ============================================================================
// 1. 定义 User Model
// ============================================================================

const UserModel = defineModel({
  name: 'User',

  // Schema 定义
  schema: {
    fields: {
      id: { type: 'string', required: true },
      name: { type: 'string', required: true },
      email: { type: 'string', required: true },
      role: { type: 'string', default: 'user' },
      isActive: { type: 'boolean', default: true }
    }
  },

  // Views 定义（函数形式，可访问 context）
  views: (context) => ({
    list: {
      type: 'list',
      title: `${context.modelName} List`,
      columns: [
        { field: 'name', label: 'Name', sortable: true },
        { field: 'email', label: 'Email' },
        { field: 'role', label: 'Role' },
        { field: 'isActive', label: 'Status' }
      ]
    },
    form: {
      type: 'form',
      title: `${context.modelName} Form`,
      fields: ['name', 'email', 'role', 'isActive']
    }
  }),

  // Actions 定义（函数形式，可访问 context）
  actions: (context) => ({
    activate: async ({ id }: { id: string }) => {
      console.log(`[Action] Activating user ${id}...`)

      // 访问 repository
      const user = await context.repository.updateOne(id, { isActive: true })

      // 触发事件
      context.eventBus.publish({
        type: 'user:activated',
        payload: { id, user },
        timestamp: Date.now()
      })

      return user
    },

    deactivate: async ({ id }: { id: string }) => {
      console.log(`[Action] Deactivating user ${id}...`)
      const user = await context.repository.updateOne(id, { isActive: false })

      context.eventBus.publish({
        type: 'user:deactivated',
        payload: { id, user },
        timestamp: Date.now()
      })

      return user
    },

    assignRole: async ({ id, role }: { id: string; role: string }) => {
      console.log(`[Action] Assigning role "${role}" to user ${id}...`)
      return context.repository.updateOne(id, { role })
    }
  }),

  // APIs 定义（可执行函数）
  apis: {
    getList: async (params) => {
      console.log('[API] Getting user list...', params)
      // 在实际应用中，这里会调用 HTTP 客户端
      // 现在使用 Mock Repository
      const repository = UserModel.context.repository
      return repository.getList(params || {})
    },

    getOne: async (id: string) => {
      console.log(`[API] Getting user ${id}...`)
      const repository = UserModel.context.repository
      return repository.getOne(id)
    },

    createOne: async (data: any) => {
      console.log('[API] Creating user...', data)
      const repository = UserModel.context.repository
      return repository.createOne(data)
    },

    updateOne: async (id: string, data: any) => {
      console.log(`[API] Updating user ${id}...`, data)
      const repository = UserModel.context.repository
      return repository.updateOne(id, data)
    },

    deleteOne: async (id: string) => {
      console.log(`[API] Deleting user ${id}...`)
      const repository = UserModel.context.repository
      return repository.deleteOne(id)
    }
  },

  // Hooks 定义
  hooks: {
    beforeCreate: async (data) => {
      console.log('[Hook] beforeCreate:', data)
      // 添加默认值
      return {
        ...data,
        isActive: data.isActive !== undefined ? data.isActive : true,
        createdBy: 'system'
      }
    },

    afterCreate: async (record) => {
      console.log('[Hook] afterCreate:', record)
      // 发送欢迎邮件等
      console.log(`  → Sending welcome email to ${record.email}`)
    },

    beforeUpdate: async (id, data) => {
      console.log(`[Hook] beforeUpdate: ${id}`, data)
      return data
    },

    afterUpdate: async (record) => {
      console.log('[Hook] afterUpdate:', record)
    }
  },

  // Methods 定义
  methods: {
    resetPassword: async (id: string) => {
      console.log(`[Method] Resetting password for user ${id}...`)
      return { id, passwordReset: true, resetToken: 'mock-token-' + Date.now() }
    },

    sendEmail: async (id: string, subject: string, body: string) => {
      console.log(`[Method] Sending email to user ${id}...`)
      console.log(`  Subject: ${subject}`)
      console.log(`  Body: ${body}`)
      return { id, emailSent: true }
    }
  },

  // Options
  options: {
    tableName: 'users',
    description: 'User management model',
    timestamps: true
  }
})

// ============================================================================
// 2. 使用 Model
// ============================================================================

async function main() {
  console.log('\n=== Model Basic Example ===\n')

  // 创建 Engine Context
  const engine = createEngineContext({ debug: true })
  await engine.initialize()

  // 注册 Model
  console.log('1. Registering User Model...')
  registerModel(UserModel)
  console.log('   ✓ Model registered\n')

  // 获取已注册的 Model
  const registeredModel = getModel('User')
  console.log('2. Retrieved registered model:', registeredModel?.name, '\n')

  // 创建用户（使用 API）
  console.log('3. Creating users...')
  const user1 = await callApi(UserModel, 'createOne', {
    name: 'John Doe',
    email: 'john@example.com',
    role: 'admin'
  })
  console.log('   Created user:', user1, '\n')

  const user2 = await callApi(UserModel, 'createOne', {
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'user'
  })
  console.log('   Created user:', user2, '\n')

  // 获取用户列表
  console.log('4. Getting user list...')
  const userList = await callApi(UserModel, 'getList', {
    pagination: { page: 1, pageSize: 10 }
  })
  console.log('   User list:', userList, '\n')

  // 执行 Action
  console.log('5. Executing actions...')
  await executeAction(UserModel, 'activate', { id: user1.id })
  await executeAction(UserModel, 'assignRole', { id: user2.id, role: 'moderator' })
  console.log('\n')

  // 更新用户
  console.log('6. Updating user...')
  const updated = await callApi(UserModel, 'updateOne', user1.id, {
    name: 'John Doe (Updated)'
  })
  console.log('   Updated user:', updated, '\n')

  // 查看 Views
  console.log('7. Model Views:')
  console.log('   List View:', UserModel.views.list)
  console.log('   Form View:', UserModel.views.form, '\n')

  // 查看 Model 信息
  console.log('8. Model Information:')
  console.log('   Name:', UserModel.name)
  console.log('   Actions:', Object.keys(UserModel.actions))
  console.log('   APIs:', Object.keys(UserModel.apis))
  console.log('   Methods:', Object.keys(UserModel.methods))
  console.log('   Hooks:', Object.keys(UserModel.hooks))
  console.log('   Options:', UserModel.options, '\n')

  // 清理
  await engine.destroy()
  console.log('=== Example completed ===\n')
}

// 运行示例
main().catch(console.error)

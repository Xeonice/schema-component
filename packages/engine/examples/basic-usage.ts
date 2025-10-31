/**
 * Basic Usage Example
 * 展示如何使用 @schema-component/engine 的基本功能
 */

import { defineModel, ModelRegistry, createModelStore, createMockRepository } from '../src'

// 1. 定义 Model
const UserModel = defineModel({
  name: 'User',
  schema: {
    fields: {
      id: { type: 'number' },
      name: { type: 'string' },
      email: { type: 'string' },
      age: { type: 'number' }
    }
  },
  apis: {},
  actions: {
    // 定义业务逻辑
    sendEmail: async function(userId: number, subject: string, body: string) {
      console.log(`Sending email to user ${userId}`)
      console.log(`Subject: ${subject}`)
      console.log(`Body: ${body}`)
      return { success: true, messageId: `msg-${Date.now()}` }
    }
  },
  views: {
    // 定义视图
    list: {
      type: 'list',
      title: 'User List',
      fields: ['id', 'name', 'email']
    },
    detail: {
      type: 'detail',
      title: 'User Detail'
    },
    form: {
      type: 'form',
      title: 'Edit User'
    }
  },
  hooks: {
    // 定义生命周期钩子
    beforeCreate: async (data) => {
      console.log('Before creating user:', data)
      return data
    },
    afterCreate: async (result) => {
      console.log('After creating user:', result)
      return result
    }
  }
})

// 2. 注册 Model
ModelRegistry.getInstance().register(UserModel)

// 3. 创建 Repository 和 Store
const repository = createMockRepository('User')
const userStore = createModelStore({
  modelName: 'User',
  repository
})

// 4. 使用 Store 进行 CRUD 操作
async function main() {
  console.log('\n=== Basic Usage Example ===\n')

  // Create
  console.log('1. Creating user...')
  const newUser = await userStore.create({
    name: 'Alice',
    email: 'alice@example.com',
    age: 25
  })
  console.log('Created:', newUser)

  // Read (Load List)
  console.log('\n2. Loading users...')
  await userStore.loadList({})
  console.log('Users:', userStore.records)
  console.log('Total:', userStore.total)

  // Read (Load One)
  console.log('\n3. Loading single user...')
  await userStore.loadOne((newUser as any).id)
  console.log('Current user:', userStore.current)

  // Update
  console.log('\n4. Updating user...')
  const updated = await userStore.update((newUser as any).id, {
    name: 'Alice Updated',
    age: 26
  })
  console.log('Updated:', updated)

  // Use Action
  console.log('\n5. Using action...')
  const emailResult = await UserModel.actions.sendEmail(
    (newUser as any).id,
    'Welcome',
    'Welcome to our platform!'
  )
  console.log('Email result:', emailResult)

  // Delete
  console.log('\n6. Deleting user...')
  await userStore.delete((newUser as any).id)
  console.log('Deleted successfully')
  console.log('Remaining users:', userStore.records)

  console.log('\n=== Example Complete ===\n')
}

// Run example
if (require.main === module) {
  main().catch(console.error)
}

export { main }

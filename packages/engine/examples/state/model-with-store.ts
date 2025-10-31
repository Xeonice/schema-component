/**
 * 示例: Model with MobX Store
 * 演示如何在 Model 中集成 MobX 响应式状态管理
 */

import { defineSchema } from '@schema-component/schema'
import { defineModel } from '../../src/core/defineModel'
import type { IModel } from '../../src/core/defineModel'
import type { ModelStore } from '../../src/state/ModelStore'

// ============================================================================
// 1. 定义 Schema
// ============================================================================

const UserSchema = defineSchema({
  type: 'object',
  name: 'User',
  fields: {
    id: {
      type: 'string',
      label: 'ID'
    },
    name: {
      type: 'string',
      label: '名称',
      required: true
    },
    email: {
      type: 'string',
      label: '邮箱',
      required: true
    },
    isActive: {
      type: 'boolean',
      label: '是否激活',
      default: true
    }
  }
})

// ============================================================================
// 2. 定义 Model（不使用 Store）
// ============================================================================

const UserModelWithoutStore = defineModel({
  name: 'User',
  schema: UserSchema,

  // 使用 Mock Repository
  repository: {
    type: 'mock'
  }
})

console.log('\n=== Model Without Store ===')
console.log('Model name:', UserModelWithoutStore.name)
console.log('Has store:', !!UserModelWithoutStore.context.store)

// ============================================================================
// 3. 定义 Model（使用 Store，基础配置）
// ============================================================================

const UserModelWithStore = defineModel({
  name: 'User',
  schema: UserSchema,

  // 使用 Mock Repository
  repository: {
    type: 'mock'
  },

  // 启用 Store（使用默认配置）
  store: true
})

console.log('\n=== Model With Store (Basic) ===')
console.log('Model name:', UserModelWithStore.name)
console.log('Has store:', !!UserModelWithStore.context.store)

// 访问 Store
const store = UserModelWithStore.context.store as ModelStore

console.log('Store initial state:')
console.log('  - records:', store.records)
console.log('  - total:', store.total)
console.log('  - page:', store.page)
console.log('  - pageSize:', store.pageSize)
console.log('  - loadingState:', store.loadingState)
console.log('  - isLoading:', store.isLoading)
console.log('  - hasData:', store.hasData)

// ============================================================================
// 4. 定义 Model（使用 Store，高级配置）
// ============================================================================

const ProductModelWithStore = defineModel({
  name: 'Product',
  schema: defineSchema({
    type: 'object',
    name: 'Product',
    fields: {
      id: { type: 'string', label: 'ID' },
      name: { type: 'string', label: '产品名称' },
      price: { type: 'number', label: '价格' },
      stock: { type: 'number', label: '库存' }
    }
  }),

  repository: {
    type: 'mock'
  },

  // 启用 Store（高级配置）
  store: {
    autoLoad: true,      // 自动加载数据
    defaultPageSize: 50  // 默认分页大小
  }
})

console.log('\n=== Model With Store (Advanced) ===')
console.log('Model name:', ProductModelWithStore.name)
console.log('Has store:', !!ProductModelWithStore.context.store)

const productStore = ProductModelWithStore.context.store as ModelStore

console.log('Store configuration:')
console.log('  - autoLoad: true (will auto load on creation)')
console.log('  - defaultPageSize:', productStore.pageSize)

// ============================================================================
// 5. 演示 Store 的响应式操作
// ============================================================================

console.log('\n=== Store Operations Demo ===')

async function demoStoreOperations() {
  console.log('\n1. 加载列表数据...')

  await store.loadList()

  console.log('   - records count:', store.records.length)
  console.log('   - total:', store.total)
  console.log('   - loadingState:', store.loadingState)
  console.log('   - hasData:', store.hasData)

  console.log('\n2. 创建新记录...')

  const newUser = await store.create({
    name: 'John Doe',
    email: 'john@example.com',
    isActive: true
  })

  console.log('   - created user:', newUser)
  console.log('   - records count:', store.records.length)
  console.log('   - total:', store.total)

  console.log('\n3. 设置当前记录...')

  store.setCurrent(newUser)
  console.log('   - current user:', store.current)

  console.log('\n4. 更新记录...')

  const updated = await store.update((newUser as any).id, {
    name: 'John Updated'
  })

  console.log('   - updated user:', updated)
  console.log('   - current user (auto updated):', store.current)

  console.log('\n5. 分页操作...')

  store.setPage(2)
  console.log('   - current page:', store.page)

  store.setPageSize(10)
  console.log('   - page size:', store.pageSize)
  console.log('   - total pages:', store.totalPages)

  console.log('\n6. 加载单个记录...')

  await store.loadOne((newUser as any).id)
  console.log('   - loaded user:', store.current)

  console.log('\n7. 删除记录...')

  await store.delete((newUser as any).id)
  console.log('   - records count:', store.records.length)
  console.log('   - total:', store.total)
  console.log('   - current (auto cleared):', store.current)

  console.log('\n8. 重置状态...')

  store.reset()
  console.log('   - records:', store.records)
  console.log('   - total:', store.total)
  console.log('   - page:', store.page)
  console.log('   - loadingState:', store.loadingState)
}

// ============================================================================
// 6. 演示 Store 与 Actions 的结合
// ============================================================================

const UserModelWithActions = defineModel({
  name: 'UserWithActions',
  schema: UserSchema,

  repository: {
    type: 'mock'
  },

  store: true,

  // Actions 可以访问 context.store
  actions: (context) => ({
    // 激活用户
    activate: async ({ id }: { id: string | number }) => {
      const store = context.store as ModelStore

      // 更新数据
      await store.update(id, { isActive: true })

      // 发布事件
      context.eventBus.publish({
        type: 'user:activated',
        payload: { userId: id },
        timestamp: Date.now()
      })
    },

    // 停用用户
    deactivate: async ({ id }: { id: string | number }) => {
      const store = context.store as ModelStore

      await store.update(id, { isActive: false })

      context.eventBus.publish({
        type: 'user:deactivated',
        payload: { userId: id },
        timestamp: Date.now()
      })
    },

    // 批量加载并激活
    loadAndActivateAll: async () => {
      const store = context.store as ModelStore

      // 加载所有用户
      await store.loadList()

      // 激活所有用户
      const activatePromises = store.records.map((user: any) =>
        store.update(user.id, { isActive: true })
      )

      await Promise.all(activatePromises)

      console.log('All users activated')
    }
  })
})

console.log('\n=== Model With Store + Actions ===')
console.log('Model name:', UserModelWithActions.name)
console.log('Has store:', !!UserModelWithActions.context.store)
console.log('Actions:', Object.keys(UserModelWithActions.actions))

async function demoActionsWithStore() {
  console.log('\n演示 Actions 与 Store 的结合...')

  const store = UserModelWithActions.context.store as ModelStore

  // 1. 创建一个用户
  const user = await store.create({
    name: 'Test User',
    email: 'test@example.com',
    isActive: false
  })

  console.log('Created user:', user)

  // 2. 使用 Action 激活用户
  await UserModelWithActions.actions.activate({ id: (user as any).id })

  // 3. 查看更新后的状态
  console.log('User after activation:', store.current)

  // 4. 使用 Action 停用用户
  await UserModelWithActions.actions.deactivate({ id: (user as any).id })

  console.log('User after deactivation:', store.current)
}

// ============================================================================
// 7. 运行示例
// ============================================================================

async function runExamples() {
  try {
    console.log('\n' + '='.repeat(60))
    console.log('Running Store Operations Demo')
    console.log('='.repeat(60))

    await demoStoreOperations()

    console.log('\n' + '='.repeat(60))
    console.log('Running Actions + Store Demo')
    console.log('='.repeat(60))

    await demoActionsWithStore()

    console.log('\n' + '='.repeat(60))
    console.log('All examples completed successfully!')
    console.log('='.repeat(60))
  } catch (error) {
    console.error('Error running examples:', error)
  }
}

// 运行示例
runExamples()

// ============================================================================
// 8. 导出供外部使用
// ============================================================================

export {
  UserModelWithoutStore,
  UserModelWithStore,
  ProductModelWithStore,
  UserModelWithActions
}

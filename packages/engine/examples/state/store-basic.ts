/**
 * 示例: Basic Store Usage (不依赖 @schema-component/schema)
 * 演示如何在 Model 中集成 MobX 响应式状态管理
 */

import { defineModel } from '../../src/core/defineModel'
import type { ModelStore } from '../../src/state/ModelStore'

// ============================================================================
// 1. 定义简单的 Schema（不使用 @schema-component/schema）
// ============================================================================

const UserSchema = {
  type: 'object',
  name: 'User',
  fields: {
    id: { type: 'string', label: 'ID' },
    name: { type: 'string', label: '名称', required: true },
    email: { type: 'string', label: '邮箱', required: true },
    isActive: { type: 'boolean', label: '是否激活', default: true }
  }
}

// ============================================================================
// 2. 定义 Model（不使用 Store）
// ============================================================================

const UserModelWithoutStore = defineModel({
  name: 'User',
  schema: UserSchema,
  repository: { type: 'mock' }
})

console.log('\n=== Model Without Store ===')
console.log('Model name:', UserModelWithoutStore.name)
console.log('Has store:', !!UserModelWithoutStore.context.store)

// ============================================================================
// 3. 定义 Model（使用 Store）
// ============================================================================

const UserModelWithStore = defineModel({
  name: 'UserWithStore',
  schema: UserSchema,
  repository: { type: 'mock' },
  store: true  // 启用 Store
})

console.log('\n=== Model With Store ===')
console.log('Model name:', UserModelWithStore.name)
console.log('Has store:', !!UserModelWithStore.context.store)

// 访问 Store
const store = UserModelWithStore.context.store as ModelStore

console.log('\nStore initial state:')
console.log('  - records:', store.records)
console.log('  - total:', store.total)
console.log('  - page:', store.page)
console.log('  - pageSize:', store.pageSize)
console.log('  - loadingState:', store.loadingState)
console.log('  - isLoading:', store.isLoading)
console.log('  - hasData:', store.hasData)

// ============================================================================
// 4. 演示 Store 的响应式操作
// ============================================================================

async function demoStoreOperations() {
  console.log('\n' + '='.repeat(60))
  console.log('Store Operations Demo')
  console.log('='.repeat(60))

  console.log('\n1. 加载列表数据...')
  await store.loadList()
  console.log('   ✓ records count:', store.records.length)
  console.log('   ✓ total:', store.total)
  console.log('   ✓ loadingState:', store.loadingState)
  console.log('   ✓ hasData:', store.hasData)

  console.log('\n2. 创建新记录...')
  const newUser = await store.create({
    name: 'John Doe',
    email: 'john@example.com',
    isActive: true
  })
  console.log('   ✓ created user:', newUser)
  console.log('   ✓ records count after create:', store.records.length)
  console.log('   ✓ total after create:', store.total)

  console.log('\n3. 设置当前记录...')
  store.setCurrent(newUser)
  console.log('   ✓ current user:', store.current)

  console.log('\n4. 更新记录...')
  const updated = await store.update((newUser as any).id, {
    name: 'John Updated'
  })
  console.log('   ✓ updated user:', updated)
  console.log('   ✓ current user (auto updated):', store.current)

  console.log('\n5. 分页操作...')
  store.setPage(2)
  console.log('   ✓ current page:', store.page)
  store.setPageSize(10)
  console.log('   ✓ page size:', store.pageSize)
  console.log('   ✓ total pages:', store.totalPages)

  console.log('\n6. 加载单个记录...')
  await store.loadOne((newUser as any).id)
  console.log('   ✓ loaded user:', store.current)

  console.log('\n7. 删除记录...')
  await store.delete((newUser as any).id)
  console.log('   ✓ records count after delete:', store.records.length)
  console.log('   ✓ total after delete:', store.total)
  console.log('   ✓ current (auto cleared):', store.current)

  console.log('\n8. 重置状态...')
  store.reset()
  console.log('   ✓ records:', store.records)
  console.log('   ✓ total:', store.total)
  console.log('   ✓ page:', store.page)
  console.log('   ✓ loadingState:', store.loadingState)
}

// ============================================================================
// 5. 定义 Model（Store 高级配置）
// ============================================================================

const ProductModel = defineModel({
  name: 'Product',
  schema: {
    type: 'object',
    name: 'Product',
    fields: {
      id: { type: 'string', label: 'ID' },
      name: { type: 'string', label: '产品名称' },
      price: { type: 'number', label: '价格' },
      stock: { type: 'number', label: '库存' }
    }
  },
  repository: { type: 'mock' },
  store: {
    autoLoad: true,
    defaultPageSize: 50
  }
})

console.log('\n=== Model With Store (Advanced Config) ===')
console.log('Model name:', ProductModel.name)
console.log('Store config:')
const productStore = ProductModel.context.store as ModelStore
console.log('  - autoLoad: true')
console.log('  - defaultPageSize:', productStore.pageSize)

// ============================================================================
// 6. 演示 Store 与 Actions 的结合
// ============================================================================

const UserModelWithActions = defineModel({
  name: 'UserWithActions',
  schema: UserSchema,
  repository: { type: 'mock' },
  store: true,
  actions: (context) => ({
    activate: async ({ id }: { id: string | number }) => {
      const store = context.store as ModelStore
      await store.update(id, { isActive: true })
      context.eventBus.publish({
        type: 'user:activated',
        payload: { userId: id },
        timestamp: Date.now()
      })
      console.log(`   ✓ User ${id} activated`)
    },
    deactivate: async ({ id }: { id: string | number }) => {
      const store = context.store as ModelStore
      await store.update(id, { isActive: false })
      context.eventBus.publish({
        type: 'user:deactivated',
        payload: { userId: id },
        timestamp: Date.now()
      })
      console.log(`   ✓ User ${id} deactivated`)
    }
  })
})

async function demoActionsWithStore() {
  console.log('\n' + '='.repeat(60))
  console.log('Actions + Store Demo')
  console.log('='.repeat(60))

  const actionStore = UserModelWithActions.context.store as ModelStore

  console.log('\n1. 创建用户...')
  const user = await actionStore.create({
    name: 'Test User',
    email: 'test@example.com',
    isActive: false
  })
  console.log('   ✓ Created user:', user)

  console.log('\n2. 使用 Action 激活用户...')
  await UserModelWithActions.actions.activate({ id: (user as any).id })

  console.log('\n3. 使用 Action 停用用户...')
  await UserModelWithActions.actions.deactivate({ id: (user as any).id })
}

// ============================================================================
// 7. 运行示例
// ============================================================================

async function runExamples() {
  try {
    await demoStoreOperations()
    await demoActionsWithStore()

    console.log('\n' + '='.repeat(60))
    console.log('✅ All examples completed successfully!')
    console.log('='.repeat(60))
  } catch (error) {
    console.error('\n❌ Error running examples:', error)
    process.exit(1)
  }
}

runExamples()

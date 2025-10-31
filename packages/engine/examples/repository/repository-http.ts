/**
 * HTTP Repository Example
 * 演示如何使用 HTTP Repository 和 defineModel 集成
 */

import {
  defineModel,
  createHttpClient,
  createRepository,
  executeAction,
  callApi
} from '../../src'

// ============================================================================
// 1. 使用 HTTP Repository 定义 Model（通过配置）
// ============================================================================

console.log('=== HTTP Repository Example ===\n')

// 方式 1：通过配置自动创建 HTTP Repository
const UserModel = defineModel({
  name: 'User',

  schema: {
    fields: {
      id: { type: 'string', required: true },
      name: { type: 'string', required: true },
      email: { type: 'string', required: true },
      role: { type: 'string', default: 'user' }
    }
  },

  // 配置 HTTP Repository
  repository: {
    type: 'http',
    http: {
      baseURL: 'https://jsonplaceholder.typicode.com',
      resourcePath: '/users'
    }
  },

  // Actions 可以访问 HTTP Repository
  actions: (context) => ({
    activate: async ({ id }: { id: string | number }) => {
      console.log(`[Action] Activating user ${id}...`)
      const user = await context.repository.updateOne(id, {
        active: true
      })
      return user
    }
  }),

  // APIs 使用 HTTP Repository
  apis: {
    getList: async (params) => {
      console.log('[API] Getting user list via HTTP...')
      const model = UserModel
      return model.context.repository.getList(params || {})
    },

    getOne: async (id: string | number) => {
      console.log(`[API] Getting user ${id} via HTTP...`)
      const model = UserModel
      return model.context.repository.getOne(id)
    },

    createOne: async (data: any) => {
      console.log('[API] Creating user via HTTP...', data)
      const model = UserModel
      return model.context.repository.createOne(data)
    }
  }
})

// ============================================================================
// 2. 手动创建 HTTP Repository 并传入 Model
// ============================================================================

const PostModel = defineModel({
  name: 'Post',

  schema: {
    fields: {
      id: { type: 'number', required: true },
      userId: { type: 'number', required: true },
      title: { type: 'string', required: true },
      body: { type: 'string', required: true }
    }
  },

  // 手动创建 HTTP Repository
  repository: (() => {
    const httpClient = createHttpClient({
      baseURL: 'https://jsonplaceholder.typicode.com',
      timeout: 10000
    })

    return createRepository({
      type: 'http',
      modelName: 'Post',
      http: {
        httpClient,
        resourcePath: '/posts'
      }
    })
  })(),

  actions: (context) => ({
    publish: async ({ id }: { id: number }) => {
      console.log(`[Action] Publishing post ${id}...`)
      return context.repository.updateOne(id, { published: true })
    }
  })
})

// ============================================================================
// 3. 使用示例
// ============================================================================

async function demonstrateHttpRepository() {
  try {
    console.log('1. Fetching users from HTTP API...')
    const users = await callApi(UserModel, 'getList', {
      pagination: { page: 1, pageSize: 5 }
    })
    console.log(`   Found ${users.data?.length || users.length} users`)
    console.log('   First user:', users.data?.[0] || users[0])
    console.log()

    console.log('2. Fetching single user...')
    const user = await callApi(UserModel, 'getOne', 1)
    console.log('   User:', user.name)
    console.log()

    console.log('3. Creating new user...')
    const newUser = await callApi(UserModel, 'createOne', {
      name: 'New User',
      email: 'newuser@example.com',
      username: 'newuser'
    })
    console.log('   Created user:', newUser)
    console.log()

    console.log('4. Executing action on user...')
    const activated = await executeAction(UserModel, 'activate', { id: 1 })
    console.log('   Activated user:', activated)
    console.log()

    console.log('5. Working with Posts...')
    const posts = await PostModel.context.repository.getList({
      pagination: { page: 1, pageSize: 3 }
    })
    console.log(`   Found ${posts.data.length} posts`)
    console.log('   First post:', posts.data[0])
    console.log()

    console.log('6. Publishing a post...')
    const published = await executeAction(PostModel, 'publish', { id: 1 })
    console.log('   Published post:', published)
    console.log()

  } catch (error: any) {
    console.error('Error occurred:', error.message)
    if (error.response) {
      console.error('Response status:', error.response.status)
    }
  }
}

// ============================================================================
// 4. 对比 Mock Repository 和 HTTP Repository
// ============================================================================

async function compareRepositories() {
  console.log('\n=== Repository Comparison ===\n')

  // Mock Repository Model
  const MockUserModel = defineModel({
    name: 'MockUser',
    schema: { fields: { id: { type: 'string' }, name: { type: 'string' } } },
    // 不指定 repository，默认使用 Mock
  })

  // HTTP Repository Model
  const HttpUserModel = defineModel({
    name: 'HttpUser',
    schema: { fields: { id: { type: 'string' }, name: { type: 'string' } } },
    repository: {
      type: 'http',
      http: {
        baseURL: 'https://jsonplaceholder.typicode.com',
        resourcePath: '/users'
      }
    }
  })

  console.log('Mock Repository:')
  console.log('  - Type:', MockUserModel.context.repository.constructor.name)
  console.log('  - Good for: testing, development, offline work')
  console.log()

  console.log('HTTP Repository:')
  console.log('  - Type:', HttpUserModel.context.repository.constructor.name)
  console.log('  - Good for: production, real API integration')
  console.log()

  // 使用 Mock Repository
  console.log('Creating user with Mock Repository...')
  const mockUser = await MockUserModel.context.repository.createOne({
    name: 'Mock User',
    email: 'mock@example.com'
  })
  console.log('  Created:', mockUser)
  console.log()

  // 使用 HTTP Repository
  console.log('Creating user with HTTP Repository...')
  const httpUser = await HttpUserModel.context.repository.createOne({
    name: 'HTTP User',
    email: 'http@example.com',
    username: 'httpuser'
  })
  console.log('  Created:', httpUser)
}

// ============================================================================
// 运行示例
// ============================================================================

async function main() {
  console.log('Starting HTTP Repository examples...\n')

  await demonstrateHttpRepository()
  await compareRepositories()

  console.log('\n=== Examples completed ===')
}

// 运行示例
main().catch(console.error)

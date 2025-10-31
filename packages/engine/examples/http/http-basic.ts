/**
 * HTTP Layer Basic Example
 * 演示如何使用 HTTP Client 和 REST Client
 */

import {
  createHttpClient,
  createRestClient,
  HttpClient,
  RestClient
} from '../../src'

// ============================================================================
// 1. 创建 HTTP Client
// ============================================================================

console.log('=== HTTP Client Example ===\n')

// 创建基础 HTTP 客户端
const httpClient = createHttpClient({
  baseURL: 'https://jsonplaceholder.typicode.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// ============================================================================
// 2. 使用拦截器
// ============================================================================

// 添加请求拦截器
httpClient.addRequestInterceptor((config) => {
  console.log('[Request Interceptor] Sending request to:', config.url)

  // 可以在这里添加认证 token
  config.headers = config.headers || {}
  config.headers['Authorization'] = 'Bearer mock-token'

  return config
})

// 添加响应拦截器
httpClient.addResponseInterceptor(
  (response) => {
    console.log('[Response Interceptor] Received response:', response.status)
    return response
  },
  (error) => {
    console.error('[Response Error Interceptor] Error:', error.message)
    throw error
  }
)

// ============================================================================
// 3. 使用 REST Client
// ============================================================================

console.log('\n=== REST Client Example ===\n')

// 创建 REST Client（针对 posts 资源）
const postsClient = createRestClient({
  httpClient,
  resourcePath: '/posts'
})

async function demonstrateRestClient() {
  try {
    // 1. 获取列表（带分页）
    console.log('1. Fetching posts list...')
    const listResult = await postsClient.getList({
      pagination: { page: 1, pageSize: 5 }
    })
    console.log(`   Found ${listResult.data.length} posts\n`)

    // 2. 获取单个资源
    console.log('2. Fetching post #1...')
    const post = await postsClient.getOne(1)
    console.log('   Post title:', post.title, '\n')

    // 3. 创建新资源
    console.log('3. Creating new post...')
    const newPost = await postsClient.createOne({
      title: 'New Post from Engine',
      body: 'This is created using @schema-component/engine',
      userId: 1
    })
    console.log('   Created post ID:', newPost.id, '\n')

    // 4. 更新资源
    console.log('4. Updating post...')
    const updatedPost = await postsClient.updateOne(1, {
      title: 'Updated Title',
      body: 'Updated content',
      userId: 1
    })
    console.log('   Updated post title:', updatedPost.title, '\n')

    // 5. 部分更新（PATCH）
    console.log('5. Patching post...')
    const patchedPost = await postsClient.patchOne(1, {
      title: 'Patched Title Only'
    })
    console.log('   Patched post title:', patchedPost.title, '\n')

    // 6. 获取多个资源
    console.log('6. Fetching multiple posts...')
    const multiplePosts = await postsClient.getMany([1, 2, 3])
    console.log(`   Fetched ${multiplePosts.length} posts\n`)

    // 7. 删除资源
    console.log('7. Deleting post...')
    const deleteResult = await postsClient.deleteOne(1)
    console.log('   Delete successful:', deleteResult, '\n')

  } catch (error: any) {
    console.error('Error occurred:', error.message)
    if (error.response) {
      console.error('Response status:', error.response.status)
      console.error('Response data:', error.response.data)
    }
  }
}

// ============================================================================
// 4. 直接使用 HTTP Client
// ============================================================================

async function demonstrateHttpClient() {
  console.log('\n=== Direct HTTP Client Usage ===\n')

  try {
    // GET 请求
    console.log('1. GET request...')
    const getResponse = await httpClient.get('/users/1')
    console.log('   User name:', getResponse.data.name, '\n')

    // POST 请求
    console.log('2. POST request...')
    const postResponse = await httpClient.post('/users', {
      name: 'New User',
      email: 'newuser@example.com'
    })
    console.log('   Created user ID:', postResponse.data.id, '\n')

    // PUT 请求
    console.log('3. PUT request...')
    const putResponse = await httpClient.put('/users/1', {
      name: 'Updated User',
      email: 'updated@example.com'
    })
    console.log('   Updated user:', putResponse.data.name, '\n')

    // DELETE 请求
    console.log('4. DELETE request...')
    const deleteResponse = await httpClient.delete('/users/1')
    console.log('   Delete status:', deleteResponse.status, '\n')

  } catch (error: any) {
    console.error('Error:', error.message)
  }
}

// ============================================================================
// 5. 错误处理示例
// ============================================================================

async function demonstrateErrorHandling() {
  console.log('\n=== Error Handling Example ===\n')

  try {
    // 尝试获取不存在的资源
    await httpClient.get('/posts/99999')
  } catch (error: any) {
    console.log('Caught error:')
    console.log('  - Message:', error.message)
    console.log('  - Is network error:', error.isNetworkError)
    console.log('  - Is timeout:', error.isTimeout)

    if (error.response) {
      console.log('  - Status:', error.response.status)
      console.log('  - Status text:', error.response.statusText)
    }
  }
}

// ============================================================================
// 运行示例
// ============================================================================

async function main() {
  console.log('Starting HTTP Layer examples...\n')

  // 演示 REST Client
  await demonstrateRestClient()

  // 演示 HTTP Client
  await demonstrateHttpClient()

  // 演示错误处理
  await demonstrateErrorHandling()

  console.log('\n=== Examples completed ===')
}

// 运行示例
main().catch(console.error)

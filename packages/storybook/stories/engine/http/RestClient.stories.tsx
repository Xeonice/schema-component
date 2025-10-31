import type { Meta, StoryObj } from '@storybook/react'
import React, { useState } from 'react'
import { createHttpClient, createRestClient } from '@schema-component/engine'

/**
 * RestClient - REST API 客户端
 * 提供面向资源的 REST API 操作，支持 CRUD、分页、排序、过滤等功能
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
  title: 'Engine/HTTP/RestClient',
  component: CodeDemo,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'RestClient 提供面向资源的 REST API 操作，封装了标准的 CRUD 功能，支持分页、排序、过滤和批量操作。'
      }
    }
  }
}

export default meta
type Story = StoryObj<typeof CodeDemo>

// 1. 创建 REST Client
export const CreateRestClient: Story = {
  args: {
    title: '1. 创建 REST Client',
    description: '使用 createRestClient 创建一个面向资源的 REST API 客户端。',
    code: `import { createHttpClient, createRestClient } from '@schema-component/engine'

// 创建 HTTP Client
const httpClient = createHttpClient({
  baseURL: 'https://jsonplaceholder.typicode.com'
})

// 创建 REST Client（针对 posts 资源）
const postsClient = createRestClient({
  httpClient,
  resourcePath: '/posts'
})

console.log('REST Client created for resource: /posts')
console.log('Ready to perform CRUD operations')`,
    onRun: async () => {
      const httpClient = createHttpClient({
        baseURL: 'https://jsonplaceholder.typicode.com'
      })

      const postsClient = createRestClient({
        httpClient,
        resourcePath: '/posts'
      })

      return `✓ HTTP Client created
✓ REST Client created for resource: /posts
✓ Resource path: ${postsClient.getResourcePath()}
✓ Ready to perform CRUD operations`
    }
  }
}

// 2. getList - 获取列表
export const GetList: Story = {
  args: {
    title: '2. getList - 获取列表',
    description: '使用 getList 获取资源列表，支持分页参数。',
    code: `const httpClient = createHttpClient({
  baseURL: 'https://jsonplaceholder.typicode.com'
})

const postsClient = createRestClient({
  httpClient,
  resourcePath: '/posts'
})

// 获取列表（带分页）
const result = await postsClient.getList({
  pagination: { page: 1, pageSize: 5 }
})

console.log('Total posts:', result.data.length)
result.data.forEach(post => {
  console.log(\`- [\${post.id}] \${post.title}\`)
})`,
    onRun: async () => {
      const httpClient = createHttpClient({
        baseURL: 'https://jsonplaceholder.typicode.com'
      })

      const postsClient = createRestClient({
        httpClient,
        resourcePath: '/posts'
      })

      const result = await postsClient.getList({
        pagination: { page: 1, pageSize: 5 }
      })

      const logs: string[] = []
      logs.push(`✓ Fetched ${result.data.length} posts`)
      logs.push('')
      result.data.slice(0, 5).forEach((post: any) => {
        logs.push(`[${post.id}] ${post.title.substring(0, 50)}...`)
      })

      return logs.join('\n')
    }
  }
}

// 3. getOne - 获取单个记录
export const GetOne: Story = {
  args: {
    title: '3. getOne - 获取单个记录',
    description: '使用 getOne 获取单个资源记录。',
    code: `const httpClient = createHttpClient({
  baseURL: 'https://jsonplaceholder.typicode.com'
})

const postsClient = createRestClient({
  httpClient,
  resourcePath: '/posts'
})

// 获取单个记录
const post = await postsClient.getOne(1)

console.log('Post ID:', post.id)
console.log('Title:', post.title)
console.log('Body:', post.body)
console.log('User ID:', post.userId)`,
    onRun: async () => {
      const httpClient = createHttpClient({
        baseURL: 'https://jsonplaceholder.typicode.com'
      })

      const postsClient = createRestClient({
        httpClient,
        resourcePath: '/posts'
      })

      const post = await postsClient.getOne(1)

      return `✓ Post fetched successfully
✓ Post ID: ${post.id}
✓ Title: ${post.title}
✓ Body: ${post.body.substring(0, 60)}...
✓ User ID: ${post.userId}`
    }
  }
}

// 4. getMany - 获取多个记录
export const GetMany: Story = {
  args: {
    title: '4. getMany - 获取多个记录',
    description: '使用 getMany 根据 ID 列表获取多个资源记录。',
    code: `const httpClient = createHttpClient({
  baseURL: 'https://jsonplaceholder.typicode.com'
})

const postsClient = createRestClient({
  httpClient,
  resourcePath: '/posts'
})

// 获取多个记录
const posts = await postsClient.getMany([1, 2, 3])

console.log(\`Fetched \${posts.length} posts\`)
posts.forEach(post => {
  console.log(\`- [\${post.id}] \${post.title}\`)
})`,
    onRun: async () => {
      const httpClient = createHttpClient({
        baseURL: 'https://jsonplaceholder.typicode.com'
      })

      const postsClient = createRestClient({
        httpClient,
        resourcePath: '/posts'
      })

      // Note: JSONPlaceholder returns all posts, we'll filter manually
      const posts = await postsClient.getMany([1, 2, 3])

      const logs: string[] = []
      logs.push(`✓ Fetched ${Array.isArray(posts) ? posts.length : 'multiple'} posts`)
      logs.push('✓ Requested IDs: [1, 2, 3]')
      logs.push('')

      if (Array.isArray(posts) && posts.length > 0) {
        posts.slice(0, 3).forEach((post: any) => {
          logs.push(`[${post.id}] ${post.title.substring(0, 50)}...`)
        })
      }

      return logs.join('\n')
    }
  }
}

// 5. createOne - 创建记录
export const CreateOne: Story = {
  args: {
    title: '5. createOne - 创建记录',
    description: '使用 createOne 创建新的资源记录。',
    code: `const httpClient = createHttpClient({
  baseURL: 'https://jsonplaceholder.typicode.com'
})

const postsClient = createRestClient({
  httpClient,
  resourcePath: '/posts'
})

// 创建新记录
const newPost = await postsClient.createOne({
  title: 'New Post from Engine',
  body: 'This is created using @schema-component/engine',
  userId: 1
})

console.log('Created Post ID:', newPost.id)
console.log('Title:', newPost.title)
console.log('Body:', newPost.body)`,
    onRun: async () => {
      const httpClient = createHttpClient({
        baseURL: 'https://jsonplaceholder.typicode.com'
      })

      const postsClient = createRestClient({
        httpClient,
        resourcePath: '/posts'
      })

      const newPost = await postsClient.createOne({
        title: 'New Post from Engine',
        body: 'This is created using @schema-component/engine',
        userId: 1
      })

      return `✓ Post created successfully
✓ Created Post ID: ${newPost.id}
✓ Title: ${newPost.title}
✓ Body: ${newPost.body}
✓ User ID: ${newPost.userId}`
    }
  }
}

// 6. updateOne - 更新记录
export const UpdateOne: Story = {
  args: {
    title: '6. updateOne - 更新记录',
    description: '使用 updateOne 完整更新一个资源记录（PUT 请求）。',
    code: `const httpClient = createHttpClient({
  baseURL: 'https://jsonplaceholder.typicode.com'
})

const postsClient = createRestClient({
  httpClient,
  resourcePath: '/posts'
})

// 更新记录
const updatedPost = await postsClient.updateOne(1, {
  id: 1,
  title: 'Updated Title',
  body: 'Updated content',
  userId: 1
})

console.log('Updated Post ID:', updatedPost.id)
console.log('New Title:', updatedPost.title)
console.log('New Body:', updatedPost.body)`,
    onRun: async () => {
      const httpClient = createHttpClient({
        baseURL: 'https://jsonplaceholder.typicode.com'
      })

      const postsClient = createRestClient({
        httpClient,
        resourcePath: '/posts'
      })

      const updatedPost = await postsClient.updateOne(1, {
        id: 1,
        title: 'Updated Title',
        body: 'Updated content',
        userId: 1
      })

      return `✓ Post updated successfully (PUT)
✓ Updated Post ID: ${updatedPost.id}
✓ New Title: ${updatedPost.title}
✓ New Body: ${updatedPost.body}
✓ User ID: ${updatedPost.userId}`
    }
  }
}

// 7. patchOne - 部分更新
export const PatchOne: Story = {
  args: {
    title: '7. patchOne - 部分更新',
    description: '使用 patchOne 部分更新资源记录（PATCH 请求），只更新指定字段。',
    code: `const httpClient = createHttpClient({
  baseURL: 'https://jsonplaceholder.typicode.com'
})

const postsClient = createRestClient({
  httpClient,
  resourcePath: '/posts'
})

// 部分更新（只更新 title）
const patchedPost = await postsClient.patchOne(1, {
  title: 'Patched Title Only'
})

console.log('Patched Post ID:', patchedPost.id)
console.log('New Title:', patchedPost.title)
console.log('Body (unchanged):', patchedPost.body)`,
    onRun: async () => {
      const httpClient = createHttpClient({
        baseURL: 'https://jsonplaceholder.typicode.com'
      })

      const postsClient = createRestClient({
        httpClient,
        resourcePath: '/posts'
      })

      const patchedPost = await postsClient.patchOne(1, {
        title: 'Patched Title Only'
      })

      return `✓ Post patched successfully (PATCH)
✓ Patched Post ID: ${patchedPost.id}
✓ New Title: ${patchedPost.title}
✓ Body: ${patchedPost.body ? patchedPost.body.substring(0, 50) + '...' : 'N/A'}
✓ Only specified fields were updated`
    }
  }
}

// 8. deleteOne - 删除记录
export const DeleteOne: Story = {
  args: {
    title: '8. deleteOne - 删除记录',
    description: '使用 deleteOne 删除单个资源记录。',
    code: `const httpClient = createHttpClient({
  baseURL: 'https://jsonplaceholder.typicode.com'
})

const postsClient = createRestClient({
  httpClient,
  resourcePath: '/posts'
})

// 删除记录
const result = await postsClient.deleteOne(1)

console.log('Delete successful:', result)
console.log('Post #1 has been deleted')`,
    onRun: async () => {
      const httpClient = createHttpClient({
        baseURL: 'https://jsonplaceholder.typicode.com'
      })

      const postsClient = createRestClient({
        httpClient,
        resourcePath: '/posts'
      })

      const result = await postsClient.deleteOne(1)

      return `✓ Delete operation completed
✓ Delete successful: ${result}
✓ Post #1 has been deleted
✓ (Note: This is a simulated delete on test API)`
    }
  }
}

// 9. 带查询参数的列表
export const ListWithQueryParams: Story = {
  args: {
    title: '9. 带查询参数的列表',
    description: '使用分页、排序和过滤参数获取列表。',
    code: `const httpClient = createHttpClient({
  baseURL: 'https://jsonplaceholder.typicode.com'
})

const postsClient = createRestClient({
  httpClient,
  resourcePath: '/posts'
})

// 带分页、排序和过滤
const result = await postsClient.getList({
  pagination: { page: 1, pageSize: 3 },
  sort: [{ field: 'id', order: 'DESC' }],
  filter: { userId: 1 }
})

console.log(\`Found \${result.data.length} posts\`)
result.data.forEach(post => {
  console.log(\`- [\${post.id}] \${post.title}\`)
})`,
    onRun: async () => {
      const httpClient = createHttpClient({
        baseURL: 'https://jsonplaceholder.typicode.com'
      })

      const postsClient = createRestClient({
        httpClient,
        resourcePath: '/posts'
      })

      const result = await postsClient.getList({
        pagination: { page: 1, pageSize: 3 },
        sort: [{ field: 'id', order: 'DESC' }],
        filter: { userId: 1 }
      })

      const logs: string[] = []
      logs.push(`✓ Query executed with parameters:`)
      logs.push('  - Pagination: page 1, size 3')
      logs.push('  - Sort: id DESC')
      logs.push('  - Filter: userId = 1')
      logs.push('')
      logs.push(`✓ Found ${result.data.length} posts:`)
      logs.push('')

      result.data.slice(0, 3).forEach((post: any) => {
        logs.push(`[${post.id}] ${post.title.substring(0, 45)}...`)
      })

      return logs.join('\n')
    }
  }
}

// 10. 完整 CRUD 示例
export const CompleteCRUDExample: Story = {
  args: {
    title: '10. 完整 CRUD 示例',
    description: '演示完整的 CRUD 操作流程。',
    code: `const httpClient = createHttpClient({
  baseURL: 'https://jsonplaceholder.typicode.com'
})

const postsClient = createRestClient({
  httpClient,
  resourcePath: '/posts'
})

// 1. 创建
console.log('1. Creating post...')
const newPost = await postsClient.createOne({
  title: 'CRUD Example',
  body: 'Testing CRUD operations',
  userId: 1
})
console.log('Created:', newPost.id)

// 2. 读取
console.log('2. Reading post...')
const post = await postsClient.getOne(newPost.id)
console.log('Read:', post.title)

// 3. 更新
console.log('3. Updating post...')
const updated = await postsClient.patchOne(newPost.id, {
  title: 'CRUD Example (Updated)'
})
console.log('Updated:', updated.title)

// 4. 删除
console.log('4. Deleting post...')
await postsClient.deleteOne(newPost.id)
console.log('Deleted successfully')`,
    onRun: async () => {
      const httpClient = createHttpClient({
        baseURL: 'https://jsonplaceholder.typicode.com'
      })

      const postsClient = createRestClient({
        httpClient,
        resourcePath: '/posts'
      })

      const logs: string[] = []

      // Create
      logs.push('1. Creating post...')
      const newPost = await postsClient.createOne({
        title: 'CRUD Example',
        body: 'Testing CRUD operations',
        userId: 1
      })
      logs.push(`   ✓ Created post ID: ${newPost.id}`)
      logs.push('')

      // Read
      logs.push('2. Reading post...')
      const post = await postsClient.getOne(newPost.id || 1)
      logs.push(`   ✓ Read: ${post.title}`)
      logs.push('')

      // Update
      logs.push('3. Updating post...')
      const updated = await postsClient.patchOne(newPost.id || 1, {
        title: 'CRUD Example (Updated)'
      })
      logs.push(`   ✓ Updated: ${updated.title}`)
      logs.push('')

      // Delete
      logs.push('4. Deleting post...')
      await postsClient.deleteOne(newPost.id || 1)
      logs.push('   ✓ Deleted successfully')
      logs.push('')
      logs.push('✓ Complete CRUD cycle finished!')

      return logs.join('\n')
    }
  }
}

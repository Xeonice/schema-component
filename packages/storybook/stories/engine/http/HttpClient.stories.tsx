import type { Meta, StoryObj } from '@storybook/react'
import React, { useState } from 'react'
import { createHttpClient, HttpClient as HttpClientType } from '@schema-component/engine'

/**
 * HttpClient - 底层 HTTP 客户端
 * 提供灵活的 HTTP 请求能力，支持拦截器、重试、超时等高级功能
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
  title: 'Engine/HTTP/HttpClient',
  component: CodeDemo,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'HttpClient 提供底层的 HTTP 请求能力，基于 axios 封装，支持拦截器、重试、超时等高级功能。'
      }
    }
  }
}

export default meta
type Story = StoryObj<typeof CodeDemo>

// 1. 创建 HTTP Client
export const CreateHttpClient: Story = {
  args: {
    title: '1. 创建 HTTP Client',
    description: '使用 createHttpClient 创建一个 HTTP 客户端实例，配置基础 URL 和超时时间。',
    code: `import { createHttpClient } from '@schema-component/engine'

const httpClient = createHttpClient({
  baseURL: 'https://jsonplaceholder.typicode.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

console.log('HTTP Client created successfully')
console.log('Base URL: https://jsonplaceholder.typicode.com')
console.log('Timeout: 10000ms')`,
    onRun: async () => {
      const httpClient = createHttpClient({
        baseURL: 'https://jsonplaceholder.typicode.com',
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      })

      return `✓ HTTP Client created successfully
✓ Base URL: https://jsonplaceholder.typicode.com
✓ Timeout: 10000ms
✓ Default headers configured`
    }
  }
}

// 2. GET 请求
export const GetRequest: Story = {
  args: {
    title: '2. 发送 GET 请求',
    description: '使用 GET 方法获取数据。',
    code: `const httpClient = createHttpClient({
  baseURL: 'https://jsonplaceholder.typicode.com'
})

// 发送 GET 请求
const response = await httpClient.get('/users/1')

console.log('Status:', response.status)
console.log('User:', response.data.name)
console.log('Email:', response.data.email)`,
    onRun: async () => {
      const httpClient = createHttpClient({
        baseURL: 'https://jsonplaceholder.typicode.com'
      })

      const response = await httpClient.get('/users/1')

      return `✓ Status: ${response.status}
✓ User: ${response.data.name}
✓ Email: ${response.data.email}
✓ Username: ${response.data.username}`
    }
  }
}

// 3. POST 请求
export const PostRequest: Story = {
  args: {
    title: '3. 发送 POST 请求',
    description: '使用 POST 方法创建新资源。',
    code: `const httpClient = createHttpClient({
  baseURL: 'https://jsonplaceholder.typicode.com'
})

// 发送 POST 请求
const response = await httpClient.post('/posts', {
  title: 'New Post from Engine',
  body: 'This is created using @schema-component/engine',
  userId: 1
})

console.log('Status:', response.status)
console.log('Created Post ID:', response.data.id)
console.log('Title:', response.data.title)`,
    onRun: async () => {
      const httpClient = createHttpClient({
        baseURL: 'https://jsonplaceholder.typicode.com'
      })

      const response = await httpClient.post('/posts', {
        title: 'New Post from Engine',
        body: 'This is created using @schema-component/engine',
        userId: 1
      })

      return `✓ Status: ${response.status}
✓ Created Post ID: ${response.data.id}
✓ Title: ${response.data.title}
✓ User ID: ${response.data.userId}`
    }
  }
}

// 4. 请求拦截器
export const RequestInterceptor: Story = {
  args: {
    title: '4. 使用请求拦截器',
    description: '添加请求拦截器，在请求发送前修改配置（如添加认证 token）。',
    code: `const httpClient = createHttpClient({
  baseURL: 'https://jsonplaceholder.typicode.com'
})

// 添加请求拦截器
httpClient.addRequestInterceptor((config) => {
  console.log('Request Interceptor: Adding auth token')
  config.headers = config.headers || {}
  config.headers['Authorization'] = 'Bearer mock-token-12345'
  return config
})

// 发送请求
const response = await httpClient.get('/users/1')

console.log('Status:', response.status)
console.log('Request was intercepted and modified')`,
    onRun: async () => {
      const httpClient = createHttpClient({
        baseURL: 'https://jsonplaceholder.typicode.com'
      })

      const logs: string[] = []

      httpClient.addRequestInterceptor((config) => {
        logs.push('[Request Interceptor] Adding auth token')
        logs.push('[Request Interceptor] URL: ' + config.url)
        config.headers = config.headers || {}
        config.headers['Authorization'] = 'Bearer mock-token-12345'
        return config
      })

      const response = await httpClient.get('/users/1')

      logs.push('✓ Status: ' + response.status)
      logs.push('✓ Request was intercepted and modified')
      logs.push('✓ Auth header was added to request')

      return logs.join('\n')
    }
  }
}

// 5. 响应拦截器
export const ResponseInterceptor: Story = {
  args: {
    title: '5. 使用响应拦截器',
    description: '添加响应拦截器，处理响应数据或错误。',
    code: `const httpClient = createHttpClient({
  baseURL: 'https://jsonplaceholder.typicode.com'
})

// 添加响应拦截器
httpClient.addResponseInterceptor(
  (response) => {
    console.log('Response Interceptor: Received', response.status)
    // 可以在这里转换数据
    return response
  },
  (error) => {
    console.error('Response Error Interceptor:', error.message)
    throw error
  }
)

const response = await httpClient.get('/posts/1')
console.log('Post title:', response.data.title)`,
    onRun: async () => {
      const httpClient = createHttpClient({
        baseURL: 'https://jsonplaceholder.typicode.com'
      })

      const logs: string[] = []

      httpClient.addResponseInterceptor(
        (response) => {
          logs.push(`[Response Interceptor] Received status: ${response.status}`)
          logs.push(`[Response Interceptor] Response processed`)
          return response
        },
        (error) => {
          logs.push(`[Response Error Interceptor] ${error.message}`)
          throw error
        }
      )

      const response = await httpClient.get('/posts/1')
      logs.push('✓ Post title: ' + response.data.title)
      logs.push('✓ Post body length: ' + response.data.body.length + ' chars')

      return logs.join('\n')
    }
  }
}

// 6. 错误处理
export const ErrorHandling: Story = {
  args: {
    title: '6. 错误处理',
    description: '演示如何处理 HTTP 错误，包括网络错误和服务器错误。',
    code: `const httpClient = createHttpClient({
  baseURL: 'https://jsonplaceholder.typicode.com'
})

try {
  // 尝试获取不存在的资源
  await httpClient.get('/posts/99999')
} catch (error: any) {
  console.log('Error caught!')
  console.log('Message:', error.message)
  console.log('Is network error:', error.isNetworkError)
  console.log('Is timeout:', error.isTimeout)

  if (error.response) {
    console.log('Status:', error.response.status)
    console.log('Status text:', error.response.statusText)
  }
}`,
    onRun: async () => {
      const httpClient = createHttpClient({
        baseURL: 'https://jsonplaceholder.typicode.com'
      })

      try {
        await httpClient.get('/posts/99999')
        return 'No error occurred'
      } catch (error: any) {
        const logs: string[] = []
        logs.push('✓ Error caught successfully!')
        logs.push('✓ Message: ' + error.message)
        logs.push('✓ Is network error: ' + (error.isNetworkError || false))
        logs.push('✓ Is timeout: ' + (error.isTimeout || false))

        if (error.response) {
          logs.push('✓ Status: ' + error.response.status)
          logs.push('✓ Status text: ' + error.response.statusText)
        }

        // Note: JSONPlaceholder returns empty object for non-existent posts
        // but doesn't actually throw 404, so we demonstrate the error handling pattern
        logs.push('\n(Note: This API returns empty data instead of 404)')

        return logs.join('\n')
      }
    }
  }
}

// 7. 超时配置
export const TimeoutConfiguration: Story = {
  args: {
    title: '7. 超时配置',
    description: '配置请求超时时间，可以全局设置或针对单个请求设置。',
    code: `// 创建带有全局超时的客户端
const httpClient = createHttpClient({
  baseURL: 'https://jsonplaceholder.typicode.com',
  timeout: 5000 // 5 秒超时
})

// 发送请求（使用全局超时）
const response1 = await httpClient.get('/users/1')
console.log('Request 1 completed:', response1.data.name)

// 为特定请求设置不同的超时
const response2 = await httpClient.get('/posts/1', {
  timeout: 10000 // 这个请求使用 10 秒超时
})
console.log('Request 2 completed:', response2.data.title)`,
    onRun: async () => {
      const httpClient = createHttpClient({
        baseURL: 'https://jsonplaceholder.typicode.com',
        timeout: 5000
      })

      const logs: string[] = []
      logs.push('✓ HTTP Client created with 5s timeout')

      const response1 = await httpClient.get('/users/1')
      logs.push('✓ Request 1 completed: ' + response1.data.name)
      logs.push('  (Used global timeout: 5000ms)')

      const response2 = await httpClient.get('/posts/1', {
        timeout: 10000
      })
      logs.push('✓ Request 2 completed: ' + response2.data.title)
      logs.push('  (Used custom timeout: 10000ms)')

      return logs.join('\n')
    }
  }
}

// 8. 完整示例：带重试逻辑
export const CompleteExampleWithRetry: Story = {
  args: {
    title: '8. 完整示例：带重试逻辑',
    description: '结合拦截器实现请求重试逻辑。',
    code: `const httpClient = createHttpClient({
  baseURL: 'https://jsonplaceholder.typicode.com'
})

let retryCount = 0
const maxRetries = 2

// 添加请求拦截器
httpClient.addRequestInterceptor((config) => {
  console.log(\`Sending request to: \${config.url}\`)
  return config
})

// 添加响应拦截器（含重试逻辑）
httpClient.addResponseInterceptor(
  (response) => {
    console.log(\`Success: \${response.status}\`)
    return response
  },
  async (error) => {
    if (retryCount < maxRetries && error.response?.status >= 500) {
      retryCount++
      console.log(\`Retry \${retryCount}/\${maxRetries}\`)
      await new Promise(resolve => setTimeout(resolve, 1000))
      return httpClient.request(error.config)
    }
    throw error
  }
)

// 发送请求
const response = await httpClient.get('/users/1')
console.log('User:', response.data.name)`,
    onRun: async () => {
      const httpClient = createHttpClient({
        baseURL: 'https://jsonplaceholder.typicode.com'
      })

      const logs: string[] = []
      let retryCount = 0
      const maxRetries = 2

      httpClient.addRequestInterceptor((config) => {
        logs.push(`[Request] Sending to: ${config.url}`)
        return config
      })

      httpClient.addResponseInterceptor(
        (response) => {
          logs.push(`[Response] Success: ${response.status}`)
          return response
        },
        async (error) => {
          if (retryCount < maxRetries && error.response?.status >= 500) {
            retryCount++
            logs.push(`[Retry] Attempt ${retryCount}/${maxRetries}`)
            await new Promise((resolve) => setTimeout(resolve, 1000))
            return httpClient.request(error.config)
          }
          throw error
        }
      )

      const response = await httpClient.get('/users/1')
      logs.push('✓ User: ' + response.data.name)
      logs.push('✓ Email: ' + response.data.email)
      logs.push(`✓ Retry logic configured (max ${maxRetries} retries)`)

      return logs.join('\n')
    }
  }
}

import type { Meta, StoryObj } from '@storybook/react'
import React, { useState, useEffect } from 'react'

/**
 * ActionQueue - 动作队列示例
 *
 * ActionQueue 管理异步动作的执行，提供：
 * - 优先级队列
 * - 并发控制
 * - 重试逻辑
 * - 超时处理
 * - 状态追踪
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
  title: 'Engine/Render/ActionQueue',
  component: CodeDemo,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'ActionQueue 管理异步动作的执行队列，支持并发控制、优先级调度、重试机制和超时处理。它使用 MobX 提供响应式状态更新。'
      }
    }
  }
}

export default meta
type Story = StoryObj<typeof CodeDemo>

// 1. Basic Queue
export const BasicQueue: Story = {
  args: {
    title: '1. 创建基础队列',
    description: '创建一个简单的 ActionQueue，使用默认配置。',
    code: `import { ActionQueue } from '@schema-component/engine'

// 创建队列（使用默认配置）
const queue = new ActionQueue()

console.log('ActionQueue created')
console.log('Default concurrency:', 3)
console.log('Default max retries:', 0)
console.log('Default timeout:', '30s')
console.log('Pending tasks:', queue.pending.length)
console.log('Running tasks:', queue.running.length)`,
    result: `ActionQueue created
Default concurrency: 3
Default max retries: 0
Default timeout: 30s
Pending tasks: 0
Running tasks: 0`
  }
}

// 2. Custom Configuration
export const CustomConfiguration: Story = {
  args: {
    title: '2. 自定义队列配置',
    description: '创建带有自定义配置的 ActionQueue，设置并发数、重试次数和超时时间。',
    code: `import { ActionQueue } from '@schema-component/engine'

// 创建自定义配置的队列
const queue = new ActionQueue({
  concurrency: 5,         // 最多同时执行 5 个任务
  defaultMaxRetries: 3,   // 失败后自动重试 3 次
  timeout: 60000          // 60 秒超时
})

console.log('Custom ActionQueue created')
console.log('Concurrency:', 5)
console.log('Max retries:', 3)
console.log('Timeout:', '60s')
console.log('')
console.log('适用场景:')
console.log('- 高并发: 并行处理多个请求')
console.log('- 网络不稳定: 自动重试失败的请求')
console.log('- 长时间操作: 设置合理的超时时间')`,
    result: `Custom ActionQueue created
Concurrency: 5
Max retries: 3
Timeout: 60s

适用场景:
- 高并发: 并行处理多个请求
- 网络不稳定: 自动重试失败的请求
- 长时间操作: 设置合理的超时时间`
  }
}

// 3. Enqueue Task
export const EnqueueTask: Story = {
  args: {
    title: '3. 添加任务到队列',
    description: '将服务端动作加入队列，返回任务 ID 用于追踪。',
    code: `import { ActionQueue } from '@schema-component/engine'

const queue = new ActionQueue()

// 模拟模型和上下文
const UserModel = {
  actions: {
    create: async (params) => {
      console.log('Creating user:', params.name)
      await new Promise(resolve => setTimeout(resolve, 1000))
      return { id: 'usr_123', ...params }
    }
  }
}

const context = {
  modelName: 'User',
  model: UserModel,
  viewStack: {},
  actionQueue: queue
}

// 定义服务端动作
const createAction = {
  type: 'server',
  name: 'create',
  label: 'Create User'
}

// 加入队列
const taskId = queue.enqueue(
  createAction,
  { name: 'John Doe', email: 'john@example.com' },
  context
)

console.log('Task enqueued')
console.log('Task ID:', taskId)
console.log('Status: pending')
console.log('Pending tasks:', queue.pending.length)`,
    result: `Task enqueued
Task ID: task_1234567890_abc123
Status: pending
Pending tasks: 1`
  }
}

// 4. Task Lifecycle
export const TaskLifecycle: Story = {
  args: {
    title: '4. 任务生命周期',
    description: '追踪任务从 pending -> running -> success/failed 的完整生命周期。',
    code: `import { ActionQueue } from '@schema-component/engine'

const queue = new ActionQueue()

// 模拟异步操作
const updateAction = {
  type: 'server',
  name: 'update',
  label: 'Update User',
  onSuccess: (result, ctx) => {
    console.log('[onSuccess] User updated:', result.id)
  },
  onError: (error, ctx) => {
    console.error('[onError] Update failed:', error.message)
  }
}

const context = {
  modelName: 'User',
  model: {
    actions: {
      update: async (params) => {
        console.log('[2] Task running...')
        await new Promise(resolve => setTimeout(resolve, 500))
        return { id: params.id, updated: true }
      }
    }
  },
  viewStack: {},
  actionQueue: queue
}

// 加入队列
const taskId = queue.enqueue(updateAction, { id: 'usr_123' }, context)

console.log('[1] Task created: pending')

// 订阅任务状态变化
queue.subscribe(taskId, (task) => {
  console.log(\`[Status Update] \${task.status}\`)

  if (task.status === 'success') {
    console.log('[3] Task completed')
    console.log('    Result:', task.result)
    console.log('    Duration:', task.completedAt - task.createdAt, 'ms')
  }
})`,
    result: `[1] Task created: pending
[Status Update] running
[2] Task running...
[Status Update] success
[onSuccess] User updated: usr_123
[3] Task completed
    Result: { id: 'usr_123', updated: true }
    Duration: 523 ms`,
    isAsync: true
  }
}

// 5. Concurrency Control
export const ConcurrencyControl: Story = {
  args: {
    title: '5. 并发控制',
    description: '队列自动控制并发数，超过限制的任务会等待。',
    code: `import { ActionQueue } from '@schema-component/engine'

// 创建并发数为 2 的队列
const queue = new ActionQueue({
  concurrency: 2
})

// 模拟慢速操作
const slowAction = {
  type: 'server',
  name: 'process',
  label: 'Process Data'
}

const context = {
  modelName: 'Data',
  model: {
    actions: {
      process: async (params) => {
        console.log(\`  [Start] Task \${params.id}\`)
        await new Promise(resolve => setTimeout(resolve, 2000))
        console.log(\`  [Done] Task \${params.id}\`)
        return { processed: true }
      }
    }
  },
  viewStack: {},
  actionQueue: queue
}

// 添加 5 个任务
console.log('Enqueueing 5 tasks (concurrency: 2)...')
for (let i = 1; i <= 5; i++) {
  queue.enqueue(slowAction, { id: i }, context)
}

console.log('')
console.log('Status:')
console.log('  Pending:', queue.pending.length, 'tasks')
console.log('  Running:', queue.running.length, 'tasks')
console.log('')
console.log('Execution:')
console.log('  Tasks 1-2: Start immediately')
console.log('  Tasks 3-5: Wait for free slot')

// 监听队列状态
queue.subscribeQueue((q) => {
  console.log(\`  Queue: \${q.running.length} running, \${q.pending.length} pending\`)
})`,
    result: `Enqueueing 5 tasks (concurrency: 2)...

Status:
  Pending: 3 tasks
  Running: 2 tasks

Execution:
  Tasks 1-2: Start immediately
  Tasks 3-5: Wait for free slot
  Queue: 2 running, 3 pending
  [Start] Task 1
  [Start] Task 2
  Queue: 2 running, 2 pending
  [Done] Task 1
  [Start] Task 3
  Queue: 2 running, 1 pending
  [Done] Task 2
  [Start] Task 4
  Queue: 1 running, 0 pending
  [Done] Task 3
  [Start] Task 5
  [Done] Task 4
  [Done] Task 5
  Queue: 0 running, 0 pending`,
    isAsync: true
  }
}

// 6. Retry Mechanism
export const RetryMechanism: Story = {
  args: {
    title: '6. 重试机制',
    description: '任务失败后自动重试，直到达到最大重试次数。',
    code: `import { ActionQueue } from '@schema-component/engine'

const queue = new ActionQueue({
  defaultMaxRetries: 3
})

let attemptCount = 0

// 模拟不稳定的操作（前 2 次失败，第 3 次成功）
const unstableAction = {
  type: 'server',
  name: 'fetch',
  label: 'Fetch Data',
  onSuccess: (result, ctx) => {
    console.log('[Success] Data fetched')
  },
  onError: (error, ctx) => {
    console.log('[Error] Fetch failed:', error.message)
  }
}

const context = {
  modelName: 'Data',
  model: {
    actions: {
      fetch: async (params) => {
        attemptCount++
        console.log(\`[Attempt \${attemptCount}] Fetching data...\`)

        if (attemptCount < 3) {
          throw new Error('Network error')
        }

        return { data: 'Success!' }
      }
    }
  },
  viewStack: {},
  actionQueue: queue
}

// 加入队列
const taskId = queue.enqueue(unstableAction, {}, context)

queue.subscribe(taskId, (task) => {
  console.log(\`[Status] \${task.status}\`)
  if (task.status === 'pending' && task.retryCount > 0) {
    console.log(\`[Retry] Attempt \${task.retryCount + 1}/\${task.maxRetries + 1}\`)
  }
})`,
    result: `[Attempt 1] Fetching data...
[Status] running
[Status] pending
[Error] Fetch failed: Network error
[Retry] Attempt 2/4
[Attempt 2] Fetching data...
[Status] running
[Status] pending
[Error] Fetch failed: Network error
[Retry] Attempt 3/4
[Attempt 3] Fetching data...
[Status] running
[Status] success
[Success] Data fetched`,
    isAsync: true
  }
}

// 7. Task Cancellation
export const TaskCancellation: Story = {
  args: {
    title: '7. 取消任务',
    description: '取消待处理或正在执行的任务。',
    code: `import { ActionQueue } from '@schema-component/engine'

const queue = new ActionQueue({
  concurrency: 1  // 一次只执行一个任务
})

// 模拟长时间操作
const longAction = {
  type: 'server',
  name: 'longProcess',
  label: 'Long Process'
}

const context = {
  modelName: 'Task',
  model: {
    actions: {
      longProcess: async (params) => {
        console.log(\`  Processing task \${params.id}...\`)
        await new Promise(resolve => setTimeout(resolve, 5000))
        return { done: true }
      }
    }
  },
  viewStack: {},
  actionQueue: queue
}

// 添加 3 个任务
console.log('Enqueueing 3 tasks...')
const task1 = queue.enqueue(longAction, { id: 1 }, context)
const task2 = queue.enqueue(longAction, { id: 2 }, context)
const task3 = queue.enqueue(longAction, { id: 3 }, context)

console.log('Queue status:')
console.log('  Task 1: running')
console.log('  Task 2: pending')
console.log('  Task 3: pending')
console.log('')

// 取消第 2 个任务
setTimeout(() => {
  const cancelled = queue.cancel(task2)
  console.log(\`Task 2 cancelled: \${cancelled}\`)
  console.log('  Task 1: still running')
  console.log('  Task 2: cancelled')
  console.log('  Task 3: will run after task 1')
}, 1000)`,
    result: `Enqueueing 3 tasks...
Queue status:
  Task 1: running
  Task 2: pending
  Task 3: pending

  Processing task 1...
Task 2 cancelled: true
  Task 1: still running
  Task 2: cancelled
  Task 3: will run after task 1`,
    isAsync: true
  }
}

// 8. Manual Retry
export const ManualRetry: Story = {
  args: {
    title: '8. 手动重试',
    description: '手动重试失败的任务。',
    code: `import { ActionQueue } from '@schema-component/engine'

const queue = new ActionQueue({
  defaultMaxRetries: 0  // 禁用自动重试
})

// 模拟会失败的操作
const failingAction = {
  type: 'server',
  name: 'upload',
  label: 'Upload File',
  onError: (error, ctx) => {
    console.log('[Error] Upload failed:', error.message)
  }
}

const context = {
  modelName: 'File',
  model: {
    actions: {
      upload: async (params) => {
        console.log('Attempting upload...')
        throw new Error('Network timeout')
      }
    }
  },
  viewStack: {},
  actionQueue: queue
}

// 加入队列
const taskId = queue.enqueue(failingAction, { file: 'image.png' }, context)

// 等待失败
setTimeout(() => {
  const task = queue.getTask(taskId)
  console.log('')
  console.log('Task status:', task?.status)
  console.log('Error:', task?.error?.message)
  console.log('')

  // 手动重试
  console.log('Manually retrying...')
  const retried = queue.retry(taskId)
  console.log('Retry initiated:', retried)
  console.log('Retry count:', task?.retryCount)
}, 2000)`,
    result: `Attempting upload...
[Error] Upload failed: Network timeout

Task status: failed
Error: Network timeout

Manually retrying...
Attempting upload...
[Error] Upload failed: Network timeout
Retry initiated: true
Retry count: 1`,
    isAsync: true
  }
}

// 9. Queue Statistics
export const QueueStatistics: Story = {
  args: {
    title: '9. 队列统计',
    description: '监控队列状态和任务统计信息。',
    code: `import { ActionQueue } from '@schema-component/engine'

const queue = new ActionQueue({
  concurrency: 2
})

// 创建不同结果的任务
const actions = [
  { name: 'task1', shouldFail: false, delay: 500 },
  { name: 'task2', shouldFail: false, delay: 1000 },
  { name: 'task3', shouldFail: true, delay: 300 },
  { name: 'task4', shouldFail: false, delay: 800 },
  { name: 'task5', shouldFail: true, delay: 400 }
]

const context = {
  modelName: 'Task',
  model: {
    actions: {}
  },
  viewStack: {},
  actionQueue: queue
}

// 为每个任务创建处理函数
actions.forEach(({ name, shouldFail, delay }) => {
  context.model.actions[name] = async () => {
    await new Promise(resolve => setTimeout(resolve, delay))
    if (shouldFail) throw new Error(\`\${name} failed\`)
    return { success: true }
  }
})

// 加入队列
console.log('Enqueueing 5 tasks...')
actions.forEach(({ name }) => {
  queue.enqueue(
    { type: 'server', name, label: name },
    {},
    context
  )
})

// 监控队列状态
const unsubscribe = queue.subscribeQueue((q) => {
  console.log('\\nQueue Statistics:')
  console.log('  Pending:', q.pending.length)
  console.log('  Running:', q.running.length)
  console.log('  Completed:', q.completed.length)
  console.log('  Failed:', q.failed.length)
  console.log('  Total:', q.pending.length + q.running.length +
               q.completed.length + q.failed.length)
})

// 最终统计
setTimeout(() => {
  console.log('\\nFinal Statistics:')
  console.log('  Success rate:',
    \`\${queue.completed.length}/\${actions.length}\`,
    \`(\${(queue.completed.length / actions.length * 100).toFixed(0)}%)\`)
  unsubscribe()
}, 3000)`,
    result: `Enqueueing 5 tasks...

Queue Statistics:
  Pending: 3
  Running: 2
  Completed: 0
  Failed: 0
  Total: 5

Queue Statistics:
  Pending: 2
  Running: 1
  Completed: 0
  Failed: 1
  Total: 4

Queue Statistics:
  Pending: 0
  Running: 1
  Completed: 2
  Failed: 1
  Total: 4

Queue Statistics:
  Pending: 0
  Running: 0
  Completed: 3
  Failed: 2
  Total: 5

Final Statistics:
  Success rate: 3/5 (60%)`,
    isAsync: true
  }
}

// 10. Timeout Handling
export const TimeoutHandling: Story = {
  args: {
    title: '10. 超时处理',
    description: '任务执行超过超时时间会自动失败。',
    code: `import { ActionQueue } from '@schema-component/engine'

// 设置 2 秒超时
const queue = new ActionQueue({
  timeout: 2000,
  defaultMaxRetries: 0
})

const slowAction = {
  type: 'server',
  name: 'slowProcess',
  label: 'Slow Process',
  onError: (error, ctx) => {
    console.log('[Error]', error.message)
  }
}

const context = {
  modelName: 'Task',
  model: {
    actions: {
      slowProcess: async (params) => {
        console.log(\`Starting task (will take \${params.duration}ms)...\`)
        await new Promise(resolve => setTimeout(resolve, params.duration))
        console.log('Task completed')
        return { done: true }
      }
    }
  },
  viewStack: {},
  actionQueue: queue
}

// 任务 1: 快速完成（1秒）
console.log('[Task 1] Expected: Success')
const task1 = queue.enqueue(slowAction, { duration: 1000 }, context)

// 任务 2: 超时（3秒 > 2秒超时）
setTimeout(() => {
  console.log('\\n[Task 2] Expected: Timeout')
  const task2 = queue.enqueue(slowAction, { duration: 3000 }, context)

  queue.subscribe(task2, (task) => {
    if (task.status === 'failed') {
      console.log('Status:', task.status)
      console.log('Reason: Exceeded timeout (2000ms)')
    }
  })
}, 1500)`,
    result: `[Task 1] Expected: Success
Starting task (will take 1000ms)...
Task completed

[Task 2] Expected: Timeout
Starting task (will take 3000ms)...
[Error] Action timeout
Status: failed
Reason: Exceeded timeout (2000ms)`,
    isAsync: true
  }
}

// 11. Clear Queue
export const ClearQueue: Story = {
  args: {
    title: '11. 清空队列',
    description: '清除队列中的所有任务。',
    code: `import { ActionQueue } from '@schema-component/engine'

const queue = new ActionQueue()

const action = {
  type: 'server',
  name: 'process',
  label: 'Process'
}

const context = {
  modelName: 'Task',
  model: {
    actions: {
      process: async () => {
        await new Promise(resolve => setTimeout(resolve, 100))
        return { done: true }
      }
    }
  },
  viewStack: {},
  actionQueue: queue
}

// 添加多个任务
console.log('Adding tasks to queue...')
for (let i = 1; i <= 5; i++) {
  queue.enqueue(action, { id: i }, context)
}

console.log('Queue state:')
console.log('  Pending:', queue.pending.length)
console.log('  Running:', queue.running.length)
console.log('  Total tasks:', queue.pending.length + queue.running.length)

// 清空队列
console.log('\\nClearing queue...')
queue.clear()

console.log('\\nQueue state after clear:')
console.log('  Pending:', queue.pending.length)
console.log('  Running:', queue.running.length)
console.log('  Completed:', queue.completed.length)
console.log('  Failed:', queue.failed.length)
console.log('  Total tasks:', 0)`,
    result: `Adding tasks to queue...
Queue state:
  Pending: 2
  Running: 3
  Total tasks: 5

Clearing queue...

Queue state after clear:
  Pending: 0
  Running: 0
  Completed: 0
  Failed: 0
  Total tasks: 0`
  }
}

// 12. Complete Example
export const CompleteExample: Story = {
  args: {
    title: '12. 完整示例',
    description: '综合示例：批量删除操作，包含确认、进度追踪和错误处理。',
    code: `import { ActionQueue } from '@schema-component/engine'

// 创建队列
const queue = new ActionQueue({
  concurrency: 3,
  defaultMaxRetries: 2,
  timeout: 5000
})

// 批量删除动作
const deleteAction = {
  type: 'server',
  name: 'delete',
  label: 'Delete',
  confirm: 'Are you sure?',
  onSuccess: (result, ctx) => {
    console.log(\`  ✓ Deleted: \${result.id}\`)
  },
  onError: (error, ctx) => {
    console.error(\`  ✗ Failed: \${error.message}\`)
  }
}

// 模拟数据
const users = [
  { id: 'usr_1', name: 'User 1' },
  { id: 'usr_2', name: 'User 2' },
  { id: 'usr_3', name: 'User 3' },
  { id: 'usr_4', name: 'User 4' },
  { id: 'usr_5', name: 'User 5' }
]

const context = {
  modelName: 'User',
  model: {
    actions: {
      delete: async (params) => {
        await new Promise(resolve => setTimeout(resolve, 500))
        // 模拟随机失败
        if (Math.random() < 0.2) {
          throw new Error(\`Cannot delete \${params.id}\`)
        }
        return { id: params.id, deleted: true }
      }
    }
  },
  viewStack: {},
  actionQueue: queue
}

// 批量删除
console.log(\`Deleting \${users.length} users...\\n\`)

const taskIds = users.map(user =>
  queue.enqueue(deleteAction, { id: user.id }, context)
)

// 追踪进度
let completed = 0
queue.subscribeQueue((q) => {
  const newCompleted = q.completed.length + q.failed.length
  if (newCompleted > completed) {
    completed = newCompleted
    const progress = (completed / users.length * 100).toFixed(0)
    console.log(\`Progress: \${completed}/\${users.length} (\${progress}%)\`)
  }

  // 全部完成
  if (completed === users.length) {
    console.log(\`\\nBatch delete completed:\`)
    console.log(\`  Success: \${q.completed.length}\`)
    console.log(\`  Failed: \${q.failed.length}\`)
  }
})`,
    result: `Deleting 5 users...

  ✓ Deleted: usr_1
Progress: 1/5 (20%)
  ✓ Deleted: usr_2
Progress: 2/5 (40%)
  ✗ Failed: Cannot delete usr_3
Progress: 3/5 (60%)
  ✓ Deleted: usr_4
Progress: 4/5 (80%)
  ✓ Deleted: usr_5
Progress: 5/5 (100%)

Batch delete completed:
  Success: 4
  Failed: 1`,
    isAsync: true
  }
}

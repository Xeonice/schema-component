import type { Meta, StoryObj } from '@storybook/react'
import React, { useState, useEffect } from 'react'

/**
 * ViewStack - 视图堆栈示例
 *
 * ViewStack 管理视图导航和层级，提供：
 * - Push/Replace 视图
 * - 历史记录管理
 * - 前进/后退导航
 * - 状态保存
 * - 响应式更新
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
  title: 'Engine/Render/ViewStack',
  component: CodeDemo,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'ViewStack 管理视图导航堆栈，类似浏览器历史记录。支持视图切换、前进后退、状态保存等功能。使用 MobX 提供响应式状态更新。'
      }
    }
  }
}

export default meta
type Story = StoryObj<typeof CodeDemo>

// 1. Basic Navigation
export const BasicNavigation: Story = {
  args: {
    title: '1. 基础导航',
    description: '创建 ViewStack 并推送第一个视图。',
    code: `import { ViewStack } from '@schema-component/engine'

// 创建视图堆栈
const viewStack = new ViewStack()

console.log('Initial state:')
console.log('  Current view:', viewStack.current)
console.log('  History length:', viewStack.history.length)
console.log('  Can go back:', viewStack.canGoBack)
console.log('')

// 推送列表视图
const listView = {
  type: 'list',
  title: 'User List',
  columns: [
    { field: 'name', title: 'Name' },
    { field: 'email', title: 'Email' }
  ]
}

viewStack.push(listView, [], { page: 1 })

console.log('After push:')
console.log('  Current view:', viewStack.current?.type)
console.log('  View title:', viewStack.current?.definition.title)
console.log('  History length:', viewStack.history.length)
console.log('  Can go back:', viewStack.canGoBack)`,
    result: `Initial state:
  Current view: null
  History length: 0
  Can go back: false

After push:
  Current view: list
  View title: User List
  History length: 1
  Can go back: false`
  }
}

// 2. Push Multiple Views
export const PushMultipleViews: Story = {
  args: {
    title: '2. 推送多个视图',
    description: '连续推送多个视图，构建导航层级。',
    code: `import { ViewStack } from '@schema-component/engine'

const viewStack = new ViewStack()

// 1. 列表视图
const listView = {
  type: 'list',
  title: 'Users'
}
viewStack.push(listView, [])
console.log('[1] Pushed list view')

// 2. 详情视图
const detailView = {
  type: 'detail',
  title: 'User Details'
}
viewStack.push(detailView, { id: 'usr_123', name: 'John' })
console.log('[2] Pushed detail view')

// 3. 编辑视图
const formView = {
  type: 'form',
  title: 'Edit User'
}
viewStack.push(formView, { id: 'usr_123', name: 'John' }, { mode: 'edit' })
console.log('[3] Pushed form view')

console.log('')
console.log('Navigation stack:')
viewStack.history.forEach((item, index) => {
  console.log(\`  \${index + 1}. \${item.type} - \${item.definition.title}\`)
})

console.log('')
console.log('Current view:', viewStack.current?.type)
console.log('History length:', viewStack.history.length)
console.log('Can go back:', viewStack.canGoBack)
console.log('Can go forward:', viewStack.canGoForward)`,
    result: `[1] Pushed list view
[2] Pushed detail view
[3] Pushed form view

Navigation stack:
  1. list - Users
  2. detail - User Details
  3. form - Edit User

Current view: form
History length: 3
Can go back: true
Can go forward: false`
  }
}

// 3. Go Back
export const GoBack: Story = {
  args: {
    title: '3. 后退导航',
    description: '使用 goBack() 返回上一个视图。',
    code: `import { ViewStack } from '@schema-component/engine'

const viewStack = new ViewStack()

// 构建导航栈
viewStack.push({ type: 'list', title: 'List' }, [])
viewStack.push({ type: 'detail', title: 'Detail' }, {})
viewStack.push({ type: 'form', title: 'Form' }, {})

console.log('Initial:')
console.log('  Current:', viewStack.current?.type)
console.log('  Can go back:', viewStack.canGoBack)
console.log('')

// 后退一步
const prev1 = viewStack.goBack()
console.log('After first goBack():')
console.log('  Current:', viewStack.current?.type)
console.log('  Previous:', prev1?.type)
console.log('  Can go back:', viewStack.canGoBack)
console.log('  Can go forward:', viewStack.canGoForward)
console.log('')

// 再后退一步
const prev2 = viewStack.goBack()
console.log('After second goBack():')
console.log('  Current:', viewStack.current?.type)
console.log('  Previous:', prev2?.type)
console.log('  Can go back:', viewStack.canGoBack)
console.log('  Can go forward:', viewStack.canGoForward)
console.log('')

// 尝试继续后退
const prev3 = viewStack.goBack()
console.log('After third goBack():')
console.log('  Result:', prev3)
console.log('  Current:', viewStack.current?.type)
console.log('  Can go back:', viewStack.canGoBack)`,
    result: `Initial:
  Current: form
  Can go back: true

After first goBack():
  Current: detail
  Previous: detail
  Can go back: true
  Can go forward: true

After second goBack():
  Current: list
  Previous: list
  Can go back: false
  Can go forward: true

After third goBack():
  Result: null
  Current: list
  Can go back: false`
  }
}

// 4. Go Forward
export const GoForward: Story = {
  args: {
    title: '4. 前进导航',
    description: '后退后可以使用 goForward() 前进。',
    code: `import { ViewStack } from '@schema-component/engine'

const viewStack = new ViewStack()

// 构建导航栈
viewStack.push({ type: 'list', title: 'List' }, [])
viewStack.push({ type: 'detail', title: 'Detail' }, {})
viewStack.push({ type: 'form', title: 'Form' }, {})

console.log('Navigation: List -> Detail -> Form')
console.log('Current:', viewStack.current?.type)
console.log('')

// 后退两步
viewStack.goBack()
viewStack.goBack()
console.log('After 2 goBack():')
console.log('  Current:', viewStack.current?.type)
console.log('  Can go forward:', viewStack.canGoForward)
console.log('')

// 前进一步
viewStack.goForward()
console.log('After goForward():')
console.log('  Current:', viewStack.current?.type)
console.log('  Can go back:', viewStack.canGoBack)
console.log('  Can go forward:', viewStack.canGoForward)
console.log('')

// 再前进一步
viewStack.goForward()
console.log('After another goForward():')
console.log('  Current:', viewStack.current?.type)
console.log('  Can go forward:', viewStack.canGoForward)`,
    result: `Navigation: List -> Detail -> Form
Current: form

After 2 goBack():
  Current: list
  Can go forward: true

After goForward():
  Current: detail
  Can go back: true
  Can go forward: true

After another goForward():
  Current: form
  Can go forward: false`
  }
}

// 5. Replace View
export const ReplaceView: Story = {
  args: {
    title: '5. 替换视图',
    description: '使用 replace() 替换当前视图，不增加历史记录。',
    code: `import { ViewStack } from '@schema-component/engine'

const viewStack = new ViewStack()

// 构建导航栈
viewStack.push({ type: 'list', title: 'List' }, [])
viewStack.push({ type: 'detail', title: 'Detail' }, {})

console.log('Initial stack:')
console.log('  1. list')
console.log('  2. detail (current)')
console.log('  History length:', viewStack.history.length)
console.log('')

// 替换当前视图
viewStack.replace({ type: 'form', title: 'Form' }, {}, { mode: 'edit' })

console.log('After replace():')
console.log('  1. list')
console.log('  2. form (current)')
console.log('  History length:', viewStack.history.length)
console.log('  Current:', viewStack.current?.type)
console.log('')

// 后退
viewStack.goBack()
console.log('After goBack():')
console.log('  Current:', viewStack.current?.type)
console.log('  (detail view is gone)')`,
    result: `Initial stack:
  1. list
  2. detail (current)
  History length: 2

After replace():
  1. list
  2. form (current)
  History length: 2
  Current: form

After goBack():
  Current: list
  (detail view is gone)`
  }
}

// 6. Go To Index
export const GoToIndex: Story = {
  args: {
    title: '6. 跳转到指定位置',
    description: '使用 goTo() 直接跳转到历史记录中的某个位置。',
    code: `import { ViewStack } from '@schema-component/engine'

const viewStack = new ViewStack()

// 构建导航栈
const views = [
  { type: 'list', title: 'List' },
  { type: 'detail', title: 'Detail' },
  { type: 'form', title: 'Form' },
  { type: 'preview', title: 'Preview' }
]

views.forEach(view => viewStack.push(view, {}))

console.log('Navigation history:')
viewStack.history.forEach((item, index) => {
  console.log(\`  [\${index}] \${item.type}\`)
})
console.log('')
console.log('Current (index 3):', viewStack.current?.type)
console.log('')

// 跳转到索引 1
viewStack.goTo(1)
console.log('After goTo(1):')
console.log('  Current:', viewStack.current?.type)
console.log('  Can go back:', viewStack.canGoBack)
console.log('  Can go forward:', viewStack.canGoForward)
console.log('')

// 跳转到索引 0
viewStack.goTo(0)
console.log('After goTo(0):')
console.log('  Current:', viewStack.current?.type)
console.log('  Can go back:', viewStack.canGoBack)
console.log('  Can go forward:', viewStack.canGoForward)`,
    result: `Navigation history:
  [0] list
  [1] detail
  [2] form
  [3] preview

Current (index 3): preview

After goTo(1):
  Current: detail
  Can go back: true
  Can go forward: true

After goTo(0):
  Current: list
  Can go back: false
  Can go forward: true`
  }
}

// 7. View Data and Params
export const ViewDataAndParams: Story = {
  args: {
    title: '7. 视图数据和参数',
    description: '每个视图可以携带自己的数据和参数。',
    code: `import { ViewStack } from '@schema-component/engine'

const viewStack = new ViewStack()

// 推送带数据的视图
const user = {
  id: 'usr_123',
  name: 'John Doe',
  email: 'john@example.com'
}

viewStack.push(
  { type: 'detail', title: 'User Details' },
  user,                          // 数据
  { mode: 'view', tab: 'info' }  // 参数
)

console.log('View data:')
console.log('  ID:', viewStack.current?.data.id)
console.log('  Name:', viewStack.current?.data.name)
console.log('  Email:', viewStack.current?.data.email)
console.log('')

console.log('View params:')
console.log('  Mode:', viewStack.current?.params?.mode)
console.log('  Tab:', viewStack.current?.params?.tab)
console.log('')

// 推送编辑视图
viewStack.push(
  { type: 'form', title: 'Edit User' },
  user,
  { mode: 'edit', returnUrl: '/users' }
)

console.log('Edit view params:')
console.log('  Mode:', viewStack.current?.params?.mode)
console.log('  Return URL:', viewStack.current?.params?.returnUrl)`,
    result: `View data:
  ID: usr_123
  Name: John Doe
  Email: john@example.com

View params:
  Mode: view
  Tab: info

Edit view params:
  Mode: edit
  Return URL: /users`
  }
}

// 8. Subscribe to Changes
export const SubscribeToChanges: Story = {
  args: {
    title: '8. 订阅视图变化',
    description: '使用 subscribe() 监听视图切换事件。',
    code: `import { ViewStack } from '@schema-component/engine'

const viewStack = new ViewStack()

// 订阅视图变化
const unsubscribe = viewStack.subscribe((current) => {
  if (current) {
    console.log(\`[View Changed] \${current.type}\`)
    console.log(\`  Title: \${current.definition.title}\`)
    console.log(\`  ID: \${current.id}\`)
    console.log(\`  Timestamp: \${new Date(current.timestamp).toLocaleTimeString()}\`)
  } else {
    console.log('[View Changed] No current view')
  }
})

console.log('Subscribing to view changes...')
console.log('')

// 触发变化
viewStack.push({ type: 'list', title: 'User List' }, [])

setTimeout(() => {
  viewStack.push({ type: 'detail', title: 'User Detail' }, {})
}, 1000)

setTimeout(() => {
  viewStack.goBack()
}, 2000)

setTimeout(() => {
  viewStack.clear()
  unsubscribe() // 清理订阅
}, 3000)`,
    result: `Subscribing to view changes...

[View Changed] list
  Title: User List
  ID: view_1234567890_abc123
  Timestamp: 10:30:45 AM
[View Changed] detail
  Title: User Detail
  ID: view_1234567891_def456
  Timestamp: 10:30:46 AM
[View Changed] list
  Title: User List
  ID: view_1234567890_abc123
  Timestamp: 10:30:45 AM
[View Changed] No current view`,
    isAsync: true
  }
}

// 9. Clear Stack
export const ClearStack: Story = {
  args: {
    title: '9. 清空堆栈',
    description: '使用 clear() 清空所有视图历史。',
    code: `import { ViewStack } from '@schema-component/engine'

const viewStack = new ViewStack()

// 构建导航栈
viewStack.push({ type: 'list', title: 'List' }, [])
viewStack.push({ type: 'detail', title: 'Detail' }, {})
viewStack.push({ type: 'form', title: 'Form' }, {})

console.log('Before clear:')
console.log('  Current:', viewStack.current?.type)
console.log('  History length:', viewStack.history.length)
console.log('  History:', viewStack.history.map(v => v.type).join(' -> '))
console.log('')

// 清空堆栈
viewStack.clear()

console.log('After clear:')
console.log('  Current:', viewStack.current)
console.log('  History length:', viewStack.history.length)
console.log('  Can go back:', viewStack.canGoBack)
console.log('  Can go forward:', viewStack.canGoForward)`,
    result: `Before clear:
  Current: form
  History length: 3
  History: list -> detail -> form

After clear:
  Current: null
  History length: 0
  Can go back: false
  Can go forward: false`
  }
}

// 10. History Truncation
export const HistoryTruncation: Story = {
  args: {
    title: '10. 历史记录截断',
    description: '从中间位置推送新视图会截断后续历史记录。',
    code: `import { ViewStack } from '@schema-component/engine'

const viewStack = new ViewStack()

// 构建完整导航栈
viewStack.push({ type: 'list', title: 'List' }, [])
viewStack.push({ type: 'detail', title: 'Detail' }, {})
viewStack.push({ type: 'form', title: 'Form' }, {})
viewStack.push({ type: 'preview', title: 'Preview' }, {})

console.log('Full history:')
console.log('  ', viewStack.history.map(v => v.type).join(' -> '))
console.log('  Current:', viewStack.current?.type)
console.log('')

// 后退两步
viewStack.goBack()
viewStack.goBack()

console.log('After going back 2 steps:')
console.log('  Current:', viewStack.current?.type)
console.log('  Can go forward:', viewStack.canGoForward)
console.log('')

// 从这里推送新视图
viewStack.push({ type: 'edit', title: 'Edit' }, {})

console.log('After pushing new view:')
console.log('  ', viewStack.history.map(v => v.type).join(' -> '))
console.log('  Current:', viewStack.current?.type)
console.log('  Can go forward:', viewStack.canGoForward)
console.log('  (form and preview are removed)')`,
    result: `Full history:
   list -> detail -> form -> preview
  Current: preview

After going back 2 steps:
  Current: detail
  Can go forward: true

After pushing new view:
   list -> detail -> edit
  Current: edit
  Can go forward: false
  (form and preview are removed)`
  }
}

// 11. Typical Navigation Flow
export const TypicalNavigationFlow: Story = {
  args: {
    title: '11. 典型导航流程',
    description: '模拟真实应用中的导航场景：列表 -> 详情 -> 编辑 -> 保存后返回。',
    code: `import { ViewStack } from '@schema-component/engine'

const viewStack = new ViewStack()

// 场景：用户管理
console.log('=== User Management Navigation ===')
console.log('')

// 1. 显示用户列表
console.log('[1] Show user list')
viewStack.push(
  { type: 'list', title: 'Users' },
  [],
  { page: 1, pageSize: 10 }
)
console.log('  Current:', viewStack.current?.type)
console.log('')

// 2. 点击用户，查看详情
console.log('[2] Click user -> Show detail')
const user = { id: 'usr_123', name: 'John Doe' }
viewStack.push(
  { type: 'detail', title: 'User Details' },
  user
)
console.log('  Current:', viewStack.current?.type)
console.log('  History:', viewStack.history.length, 'views')
console.log('')

// 3. 点击编辑按钮
console.log('[3] Click edit -> Show form')
viewStack.push(
  { type: 'form', title: 'Edit User' },
  user,
  { mode: 'edit' }
)
console.log('  Current:', viewStack.current?.type)
console.log('  Mode:', viewStack.current?.params?.mode)
console.log('')

// 4. 保存成功，返回详情页
console.log('[4] Save success -> Go back to detail')
viewStack.goBack()
console.log('  Current:', viewStack.current?.type)
console.log('  Can go back:', viewStack.canGoBack)
console.log('')

// 5. 返回列表
console.log('[5] Go back to list')
viewStack.goBack()
console.log('  Current:', viewStack.current?.type)
console.log('  Can go back:', viewStack.canGoBack)`,
    result: `=== User Management Navigation ===

[1] Show user list
  Current: list

[2] Click user -> Show detail
  Current: detail
  History: 2 views

[3] Click edit -> Show form
  Current: form
  Mode: edit

[4] Save success -> Go back to detail
  Current: detail
  Can go back: true

[5] Go back to list
  Current: list
  Can go back: false`
  }
}

// 12. Complete Example with MobX
export const CompleteExample: Story = {
  args: {
    title: '12. 完整示例（MobX 集成）',
    description: '展示 ViewStack 与 MobX 的响应式集成，实现自动 UI 更新。',
    code: `import { ViewStack } from '@schema-component/engine'
import { observer } from 'mobx-react-lite'

// 创建 ViewStack
const viewStack = new ViewStack()

// React 组件（使用 MobX observer）
const ViewNavigator = observer(() => {
  const current = viewStack.current

  return (
    <div>
      <h3>Current View: {current?.type || 'None'}</h3>
      {current && (
        <div>
          <p>Title: {current.definition.title}</p>
          <p>ID: {current.id}</p>
        </div>
      )}

      <div>
        <button
          disabled={!viewStack.canGoBack}
          onClick={() => viewStack.goBack()}
        >
          Back
        </button>
        <button
          disabled={!viewStack.canGoForward}
          onClick={() => viewStack.goForward()}
        >
          Forward
        </button>
      </div>

      <div>
        <p>History: {viewStack.history.length} views</p>
        {viewStack.history.map((view, index) => (
          <div key={view.id}>
            {index}. {view.type}
            {view === current && ' (current)'}
          </div>
        ))}
      </div>
    </div>
  )
})

// 使用示例
function App() {
  const handleShowList = () => {
    viewStack.push({ type: 'list', title: 'Users' }, [])
  }

  const handleShowDetail = (user) => {
    viewStack.push({ type: 'detail', title: 'Detail' }, user)
  }

  return (
    <div>
      <ViewNavigator />
      <button onClick={handleShowList}>Show List</button>
    </div>
  )
}

console.log('ViewStack with MobX observer')
console.log('- Automatic UI updates on navigation')
console.log('- Reactive computed properties')
console.log('- Type-safe navigation')`,
    result: `ViewStack with MobX observer
- Automatic UI updates on navigation
- Reactive computed properties
- Type-safe navigation

Component renders automatically when:
  ✓ viewStack.push() is called
  ✓ viewStack.goBack() is called
  ✓ viewStack.goForward() is called
  ✓ viewStack.replace() is called
  ✓ viewStack.clear() is called`
  }
}

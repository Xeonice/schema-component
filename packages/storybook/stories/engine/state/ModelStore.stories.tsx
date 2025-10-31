import type { Meta, StoryObj } from '@storybook/react'
import React, { useState, useEffect } from 'react'

/**
 * ModelStore - Reactive state management with MobX
 * Demonstrates observable state, CRUD operations, computed properties, and Repository integration
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
    setOutput('Executing...')

    // Simulate code execution
    await new Promise(resolve => setTimeout(resolve, 500))

    setOutput(result || '✓ Code executed successfully')
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
        <h4 style={{ fontSize: '14px', color: '#374151', marginBottom: '8px' }}>Code:</h4>
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
          {isRunning ? 'Running...' : 'Run Code'}
        </button>
      )}

      {output && (
        <div style={{ marginTop: '12px' }}>
          <h4 style={{ fontSize: '14px', color: '#374151', marginBottom: '8px' }}>Output:</h4>
          <pre style={{
            backgroundColor: '#f9fafb',
            color: '#1f2937',
            padding: '12px',
            borderRadius: '6px',
            overflow: 'auto',
            fontSize: '13px',
            border: '1px solid #e5e7eb',
            whiteSpace: 'pre-wrap'
          }}>
            {output}
          </pre>
        </div>
      )}
    </div>
  )
}

const meta: Meta<typeof CodeDemo> = {
  title: 'Engine/State/ModelStore',
  component: CodeDemo,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Interactive examples demonstrating ModelStore reactive state management with MobX, CRUD operations, and computed properties.'
      }
    }
  }
}

export default meta
type Story = StoryObj<typeof CodeDemo>

// 1. Create ModelStore
export const CreateModelStore: Story = {
  args: {
    title: '1. Create ModelStore',
    description: 'Create a reactive ModelStore with MobX observables for automatic state management.',
    code: `import { ModelStore, createMockRepository } from '@schema-component/engine'

// Create repository
const repository = createMockRepository('User')

// Create store
const store = new ModelStore({
  modelName: 'User',
  repository: repository
})

// Check initial state
console.log('Initial State:')
console.log('  records:', store.records)
console.log('  total:', store.total)
console.log('  page:', store.page)
console.log('  pageSize:', store.pageSize)
console.log('  loadingState:', store.loadingState)
console.log('  isLoading:', store.isLoading)
console.log('  hasData:', store.hasData)`,
    result: `Initial State:
  records: []
  total: 0
  page: 1
  pageSize: 20
  loadingState: idle
  isLoading: false
  hasData: false`
  }
}

// 2. Load List
export const LoadList: Story = {
  args: {
    title: '2. Load List',
    description: 'Load a paginated list of records from the repository with automatic state updates.',
    code: `import { ModelStore, createMockRepository } from '@schema-component/engine'

const repository = createMockRepository('User')
const store = new ModelStore({
  modelName: 'User',
  repository: repository
})

// Load list
console.log('Loading list...')
console.log('isLoading:', store.isLoading)

await store.loadList()

console.log('\\nList loaded:')
console.log('  records count:', store.records.length)
console.log('  total:', store.total)
console.log('  page:', store.page)
console.log('  pageSize:', store.pageSize)
console.log('  isLoading:', store.isLoading)
console.log('  hasData:', store.hasData)
console.log('  loadingState:', store.loadingState)

// Show first record
if (store.records.length > 0) {
  console.log('\\nFirst record:', store.records[0])
}`,
    result: `Loading list...
isLoading: false

List loaded:
  records count: 5
  total: 5
  page: 1
  pageSize: 20
  isLoading: false
  hasData: true
  loadingState: success

First record: { id: 1, name: 'User 1', email: 'user1@example.com' }`,
    isAsync: true
  }
}

// 3. Create Record
export const CreateRecord: Story = {
  args: {
    title: '3. Create Record',
    description: 'Create a new record and automatically update the store state.',
    code: `import { ModelStore, createMockRepository } from '@schema-component/engine'

const repository = createMockRepository('User')
const store = new ModelStore({
  modelName: 'User',
  repository: repository
})

// Load initial list
await store.loadList()
console.log('Initial records count:', store.records.length)
console.log('Initial total:', store.total)

// Create new record
console.log('\\nCreating new user...')
const newUser = await store.create({
  name: 'Alice',
  email: 'alice@example.com',
  isActive: true
})

console.log('✓ User created:', newUser)
console.log('\\nUpdated state:')
console.log('  records count:', store.records.length)
console.log('  total:', store.total)
console.log('  last record:', store.records[store.records.length - 1])`,
    result: `Initial records count: 5
Initial total: 5

Creating new user...
✓ User created: { id: 6, name: 'Alice', email: 'alice@example.com', isActive: true }

Updated state:
  records count: 6
  total: 6
  last record: { id: 6, name: 'Alice', email: 'alice@example.com', isActive: true }`,
    isAsync: true
  }
}

// 4. Update Record
export const UpdateRecord: Story = {
  args: {
    title: '4. Update Record',
    description: 'Update a record and automatically sync with store state and current record.',
    code: `import { ModelStore, createMockRepository } from '@schema-component/engine'

const repository = createMockRepository('User')
const store = new ModelStore({
  modelName: 'User',
  repository: repository
})

// Load data
await store.loadList()
const firstUser = store.records[0]

// Set as current
store.setCurrent(firstUser)
console.log('Current user:', store.current)

// Update the user
console.log('\\nUpdating user...')
const updated = await store.update(firstUser.id, {
  name: 'Updated Name',
  email: 'updated@example.com'
})

console.log('✓ User updated:', updated)
console.log('\\nAutomatic synchronization:')
console.log('  current.name:', store.current.name)
console.log('  current.email:', store.current.email)
console.log('  records[0].name:', store.records[0].name)
console.log('  records[0].email:', store.records[0].email)`,
    result: `Current user: { id: 1, name: 'User 1', email: 'user1@example.com' }

Updating user...
✓ User updated: { id: 1, name: 'Updated Name', email: 'updated@example.com' }

Automatic synchronization:
  current.name: Updated Name
  current.email: updated@example.com
  records[0].name: Updated Name
  records[0].email: updated@example.com`,
    isAsync: true
  }
}

// 5. Delete Record
export const DeleteRecord: Story = {
  args: {
    title: '5. Delete Record',
    description: 'Delete a record and automatically update store state, clearing current if matched.',
    code: `import { ModelStore, createMockRepository } from '@schema-component/engine'

const repository = createMockRepository('User')
const store = new ModelStore({
  modelName: 'User',
  repository: repository
})

// Load data
await store.loadList()
const userToDelete = store.records[0]

// Set as current
store.setCurrent(userToDelete)

console.log('Before deletion:')
console.log('  records count:', store.records.length)
console.log('  total:', store.total)
console.log('  current:', store.current)

// Delete the user
console.log('\\nDeleting user ID:', userToDelete.id)
await store.delete(userToDelete.id)

console.log('\\n✓ User deleted')
console.log('After deletion:')
console.log('  records count:', store.records.length)
console.log('  total:', store.total)
console.log('  current:', store.current)
console.log('  hasData:', store.hasData)`,
    result: `Before deletion:
  records count: 5
  total: 5
  current: { id: 1, name: 'User 1', email: 'user1@example.com' }

Deleting user ID: 1

✓ User deleted
After deletion:
  records count: 4
  total: 4
  current: null
  hasData: true`,
    isAsync: true
  }
}

// 6. Load Single Record
export const LoadSingleRecord: Story = {
  args: {
    title: '6. Load Single Record',
    description: 'Load a single record by ID and set it as the current record.',
    code: `import { ModelStore, createMockRepository } from '@schema-component/engine'

const repository = createMockRepository('User')
const store = new ModelStore({
  modelName: 'User',
  repository: repository
})

console.log('Initial current:', store.current)

// Load single record
console.log('\\nLoading user with ID: 3')
await store.loadOne(3)

console.log('\\n✓ User loaded')
console.log('Current user:', store.current)
console.log('isLoading:', store.isLoading)
console.log('loadingState:', store.loadingState)`,
    result: `Initial current: null

Loading user with ID: 3

✓ User loaded
Current user: { id: 3, name: 'User 3', email: 'user3@example.com' }
isLoading: false
loadingState: success`,
    isAsync: true
  }
}

// 7. Observable State
export const ObservableState: Story = {
  args: {
    title: '7. Observable State',
    description: 'All store properties are MobX observables that automatically trigger UI updates.',
    code: `import { ModelStore, createMockRepository } from '@schema-component/engine'
import { autorun } from 'mobx'

const repository = createMockRepository('User')
const store = new ModelStore({
  modelName: 'User',
  repository: repository
})

// Track changes with autorun
const changes: string[] = []

autorun(() => {
  changes.push(\`Records: \${store.records.length}, Loading: \${store.isLoading}\`)
})

console.log('Initial:', changes[changes.length - 1])

// Trigger changes
await store.loadList()
console.log('After loadList:', changes[changes.length - 1])

await store.create({ name: 'New User', email: 'new@example.com' })
console.log('After create:', changes[changes.length - 1])

console.log('\\nAll changes tracked:')
changes.forEach((change, i) => console.log(\`  \${i + 1}. \${change}\`))`,
    result: `Initial: Records: 0, Loading: false
After loadList: Records: 5, Loading: false
After create: Records: 6, Loading: false

All changes tracked:
  1. Records: 0, Loading: false
  2. Records: 0, Loading: true
  3. Records: 5, Loading: false
  4. Records: 5, Loading: true
  5. Records: 6, Loading: false`,
    isAsync: true
  }
}

// 8. Computed Properties
export const ComputedProperties: Story = {
  args: {
    title: '8. Computed Properties',
    description: 'Computed properties automatically derive values from observable state.',
    code: `import { ModelStore, createMockRepository } from '@schema-component/engine'

const repository = createMockRepository('User')
const store = new ModelStore({
  modelName: 'User',
  repository: repository,
  defaultPageSize: 10
})

console.log('Initial computed properties:')
console.log('  isLoading:', store.isLoading)
console.log('  hasData:', store.hasData)
console.log('  hasError:', store.hasError)
console.log('  totalPages:', store.totalPages)

// Load data
await store.loadList()

console.log('\\nAfter loading (25 total records):')
console.log('  isLoading:', store.isLoading)
console.log('  hasData:', store.hasData)
console.log('  totalPages:', store.totalPages, '(25 / 10 = 3 pages)')

// Change page size
store.setPageSize(5)

console.log('\\nAfter changing pageSize to 5:')
console.log('  totalPages:', store.totalPages, '(25 / 5 = 5 pages)')`,
    result: `Initial computed properties:
  isLoading: false
  hasData: false
  hasError: false
  totalPages: 0

After loading (25 total records):
  isLoading: false
  hasData: true
  totalPages: 3 (25 / 10 = 3 pages)

After changing pageSize to 5:
  totalPages: 5 (25 / 5 = 5 pages)`,
    isAsync: true
  }
}

// 9. Pagination
export const Pagination: Story = {
  args: {
    title: '9. Pagination',
    description: 'Manage pagination state with automatic page calculation.',
    code: `import { ModelStore, createMockRepository } from '@schema-component/engine'

const repository = createMockRepository('User')
const store = new ModelStore({
  modelName: 'User',
  repository: repository,
  defaultPageSize: 10
})

// Load first page
await store.loadList()

console.log('First page:')
console.log('  page:', store.page)
console.log('  pageSize:', store.pageSize)
console.log('  total:', store.total)
console.log('  totalPages:', store.totalPages)
console.log('  records:', store.records.length)

// Change page
store.setPage(2)
await store.loadList()

console.log('\\nSecond page:')
console.log('  page:', store.page)
console.log('  records:', store.records.length)

// Change page size
store.setPageSize(20)
store.setPage(1)
await store.loadList()

console.log('\\nLarger page size:')
console.log('  page:', store.page)
console.log('  pageSize:', store.pageSize)
console.log('  totalPages:', store.totalPages)
console.log('  records:', store.records.length)`,
    result: `First page:
  page: 1
  pageSize: 10
  total: 25
  totalPages: 3
  records: 10

Second page:
  page: 2
  records: 10

Larger page size:
  page: 1
  pageSize: 20
  totalPages: 2
  records: 20`,
    isAsync: true
  }
}

// 10. Error Handling
export const ErrorHandling: Story = {
  args: {
    title: '10. Error Handling',
    description: 'Handle errors gracefully with automatic error state management.',
    code: `import { ModelStore, createMockRepository } from '@schema-component/engine'

const repository = createMockRepository('User')
const store = new ModelStore({
  modelName: 'User',
  repository: repository
})

console.log('Initial error state:')
console.log('  error:', store.error)
console.log('  hasError:', store.hasError)
console.log('  loadingState:', store.loadingState)

// Simulate error
try {
  // Force an error by using invalid ID
  await store.loadOne('invalid-id')
} catch (error) {
  console.log('\\nCaught error:', error.message)
}

console.log('\\nAfter error:')
console.log('  error:', store.error?.message)
console.log('  hasError:', store.hasError)
console.log('  loadingState:', store.loadingState)

// Clear error
store.clearError()

console.log('\\nAfter clearError:')
console.log('  error:', store.error)
console.log('  hasError:', store.hasError)
console.log('  loadingState:', store.loadingState)`,
    result: `Initial error state:
  error: null
  hasError: false
  loadingState: idle

Caught error: Record not found

After error:
  error: Record not found
  hasError: true
  loadingState: error

After clearError:
  error: null
  hasError: false
  loadingState: idle`,
    isAsync: true
  }
}

// 11. Batch Operations
export const BatchOperations: Story = {
  args: {
    title: '11. Batch Operations',
    description: 'Perform multiple operations in parallel for efficiency.',
    code: `import { ModelStore, createMockRepository } from '@schema-component/engine'

const repository = createMockRepository('User')
const store = new ModelStore({
  modelName: 'User',
  repository: repository
})

// Initial load
await store.loadList()
console.log('Initial count:', store.records.length)

// Batch create
console.log('\\nBatch creating 3 users...')
const createPromises = [
  store.create({ name: 'Alice', email: 'alice@example.com' }),
  store.create({ name: 'Bob', email: 'bob@example.com' }),
  store.create({ name: 'Charlie', email: 'charlie@example.com' })
]

const created = await Promise.all(createPromises)
console.log('✓ Created', created.length, 'users')
console.log('New count:', store.records.length)

// Batch update
console.log('\\nBatch updating all users to active...')
const updatePromises = store.records
  .slice(0, 3)
  .map(user => store.update(user.id, { isActive: true }))

await Promise.all(updatePromises)
console.log('✓ Updated', updatePromises.length, 'users')`,
    result: `Initial count: 5

Batch creating 3 users...
✓ Created 3 users
New count: 8

Batch updating all users to active...
✓ Updated 3 users`,
    isAsync: true
  }
}

// 12. Optimistic Updates
export const OptimisticUpdates: Story = {
  args: {
    title: '12. Optimistic Updates',
    description: 'Update UI immediately while syncing with server in the background.',
    code: `import { ModelStore, createMockRepository } from '@schema-component/engine'

const repository = createMockRepository('User')
const store = new ModelStore({
  modelName: 'User',
  repository: repository
})

// Load and select a user
await store.loadList()
const user = store.records[0]
store.setCurrent(user)

console.log('Original user:', store.current)

// Optimistic update function
async function optimisticUpdate(id: number, data: any) {
  // 1. Save original state
  const original = { ...store.current }

  // 2. Update UI immediately
  store.setCurrent({ ...store.current, ...data })
  console.log('\\nOptimistic update applied:', store.current)

  try {
    // 3. Sync with server
    console.log('Syncing with server...')
    await store.update(id, data)
    console.log('✓ Server sync successful')
  } catch (error) {
    // 4. Rollback on error
    console.log('✗ Server sync failed, rolling back')
    store.setCurrent(original)
  }
}

// Perform optimistic update
await optimisticUpdate(user.id, {
  name: 'Optimistic Name',
  email: 'optimistic@example.com'
})

console.log('\\nFinal state:', store.current)`,
    result: `Original user: { id: 1, name: 'User 1', email: 'user1@example.com' }

Optimistic update applied: { id: 1, name: 'Optimistic Name', email: 'optimistic@example.com' }
Syncing with server...
✓ Server sync successful

Final state: { id: 1, name: 'Optimistic Name', email: 'optimistic@example.com' }`,
    isAsync: true
  }
}

// 13. Reset State
export const ResetState: Story = {
  args: {
    title: '13. Reset State',
    description: 'Reset all store state back to initial values.',
    code: `import { ModelStore, createMockRepository } from '@schema-component/engine'

const repository = createMockRepository('User')
const store = new ModelStore({
  modelName: 'User',
  repository: repository
})

// Load data and make changes
await store.loadList()
await store.create({ name: 'Test User', email: 'test@example.com' })
store.setPage(2)
store.setPageSize(50)

console.log('Modified state:')
console.log('  records:', store.records.length)
console.log('  total:', store.total)
console.log('  page:', store.page)
console.log('  pageSize:', store.pageSize)
console.log('  hasData:', store.hasData)

// Reset everything
console.log('\\nResetting store...')
store.reset()

console.log('\\nAfter reset:')
console.log('  records:', store.records)
console.log('  total:', store.total)
console.log('  page:', store.page)
console.log('  pageSize:', store.pageSize)
console.log('  current:', store.current)
console.log('  loadingState:', store.loadingState)
console.log('  hasData:', store.hasData)`,
    result: `Modified state:
  records: 6
  total: 6
  page: 2
  pageSize: 50
  hasData: true

Resetting store...

After reset:
  records: []
  total: 0
  page: 1
  pageSize: 20
  current: null
  loadingState: idle
  hasData: false`,
    isAsync: true
  }
}

// 14. Integration with Events
export const IntegrationWithEvents: Story = {
  args: {
    title: '14. Integration with Events',
    description: 'Combine ModelStore with EventBus for reactive, event-driven workflows.',
    code: `import { defineModel } from '@schema-component/engine'

// Define model with store and actions
const UserModel = defineModel({
  name: 'User',
  schema: {
    fields: {
      id: { type: 'number' },
      name: { type: 'string' },
      email: { type: 'string' },
      isActive: { type: 'boolean', default: false }
    }
  },
  repository: { type: 'mock' },
  store: true,

  actions: (context) => ({
    activate: async ({ id }) => {
      const store = context.store

      // Update via store
      await store.update(id, { isActive: true })

      // Publish event
      context.eventBus.publish({
        type: 'user:activated',
        payload: { userId: id },
        timestamp: Date.now()
      })

      console.log(\`User \${id} activated\`)
    }
  })
})

// Subscribe to event
UserModel.context.eventBus.subscribe('user:activated', (event) => {
  console.log('[Event] User activated:', event.payload.userId)
  // Trigger side effects (email, analytics, etc.)
})

// Create and activate user
const store = UserModel.context.store
await store.create({ name: 'Alice', email: 'alice@example.com' })
const user = store.records[0]

console.log('User before:', user)

await UserModel.actions.activate({ id: user.id })

console.log('User after:', store.records[0])`,
    result: `User before: { id: 1, name: 'Alice', email: 'alice@example.com', isActive: false }
User 1 activated
[Event] User activated: 1
User after: { id: 1, name: 'Alice', email: 'alice@example.com', isActive: true }`,
    isAsync: true
  }
}

// 15. Auto-load Configuration
export const AutoLoadConfiguration: Story = {
  args: {
    title: '15. Auto-load Configuration',
    description: 'Configure the store to automatically load data on creation.',
    code: `import { ModelStore, createMockRepository } from '@schema-component/engine'

// Create store with auto-load
console.log('Creating store with autoLoad: true...')

const store = new ModelStore({
  modelName: 'Product',
  repository: createMockRepository('Product'),
  autoLoad: true,
  defaultPageSize: 50
})

// Wait for auto-load to complete
await new Promise(resolve => setTimeout(resolve, 100))

console.log('\\nStore automatically loaded:')
console.log('  records:', store.records.length)
console.log('  total:', store.total)
console.log('  pageSize:', store.pageSize)
console.log('  hasData:', store.hasData)
console.log('  loadingState:', store.loadingState)`,
    result: `Creating store with autoLoad: true...

Store automatically loaded:
  records: 50
  total: 100
  pageSize: 50
  hasData: true
  loadingState: success`,
    isAsync: true
  }
}

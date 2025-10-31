import type { Meta, StoryObj } from '@storybook/react'
import React, { useState, useEffect } from 'react'

/**
 * EventBus - Event-driven architecture examples
 * Demonstrates pub/sub patterns, event handling, and decoupled communication
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
  title: 'Engine/Event/EventBus',
  component: CodeDemo,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Interactive examples demonstrating the EventBus pub/sub pattern and event-driven architecture.'
      }
    }
  }
}

export default meta
type Story = StoryObj<typeof CodeDemo>

// 1. Basic Subscribe and Publish
export const BasicSubscribeAndPublish: Story = {
  args: {
    title: '1. Basic Subscribe and Publish',
    description: 'The fundamental pub/sub pattern - subscribe to an event and publish it.',
    code: `import { createEventBus } from '@schema-component/engine'

// Create event bus
const eventBus = createEventBus()

// Subscribe to event
eventBus.subscribe('greeting', (event) => {
  console.log('Received:', event.payload.message)
})

// Publish event
eventBus.publish({
  type: 'greeting',
  payload: { message: 'Hello, World!' },
  timestamp: Date.now()
})`,
    result: `Received: Hello, World!`
  }
}

// 2. Multiple Subscribers
export const MultipleSubscribers: Story = {
  args: {
    title: '2. Multiple Subscribers',
    description: 'Multiple handlers can subscribe to the same event, enabling decoupled side effects.',
    code: `import { createEventBus } from '@schema-component/engine'

const eventBus = createEventBus()

// First subscriber - logging
eventBus.subscribe('user:login', (event) => {
  console.log('[Logger] User logged in:', event.payload.username)
})

// Second subscriber - analytics
eventBus.subscribe('user:login', (event) => {
  console.log('[Analytics] Track login:', event.payload.username)
})

// Third subscriber - notifications
eventBus.subscribe('user:login', (event) => {
  console.log('[Notification] Welcome back,', event.payload.username)
})

// Publish event - all subscribers receive it
eventBus.publish({
  type: 'user:login',
  payload: { username: 'alice' },
  timestamp: Date.now()
})`,
    result: `[Logger] User logged in: alice
[Analytics] Track login: alice
[Notification] Welcome back, alice`
  }
}

// 3. Event with Payload
export const EventWithPayload: Story = {
  args: {
    title: '3. Event with Payload',
    description: 'Events can carry complex data in their payload for rich information exchange.',
    code: `import { createEventBus } from '@schema-component/engine'

const eventBus = createEventBus()

// Subscribe with typed payload
eventBus.subscribe('order:created', (event) => {
  const { orderId, items, total } = event.payload
  console.log(\`Order #\${orderId} created\`)
  console.log(\`Items: \${items.length}\`)
  console.log(\`Total: $\${total}\`)
})

// Publish event with rich payload
eventBus.publish({
  type: 'order:created',
  payload: {
    orderId: 12345,
    customerId: 101,
    items: [
      { id: 1, name: 'Laptop', price: 1299.99 },
      { id: 2, name: 'Mouse', price: 29.99 }
    ],
    total: 1329.98,
    status: 'pending'
  },
  timestamp: Date.now()
})`,
    result: `Order #12345 created
Items: 2
Total: $1329.98`
  }
}

// 4. Unsubscribe
export const Unsubscribe: Story = {
  args: {
    title: '4. Unsubscribe',
    description: 'Clean up event handlers to prevent memory leaks and unwanted side effects.',
    code: `import { createEventBus } from '@schema-component/engine'

const eventBus = createEventBus()

// Subscribe and get unsubscribe function
const unsubscribe = eventBus.subscribe('notification', (event) => {
  console.log('Notification:', event.payload.message)
})

// First publish - handler receives it
eventBus.publish({
  type: 'notification',
  payload: { message: 'First notification' },
  timestamp: Date.now()
})

// Unsubscribe
unsubscribe()
console.log('Handler unsubscribed')

// Second publish - handler does NOT receive it
eventBus.publish({
  type: 'notification',
  payload: { message: 'Second notification' },
  timestamp: Date.now()
})

console.log('Second event published (no handler to receive it)')`,
    result: `Notification: First notification
Handler unsubscribed
Second event published (no handler to receive it)`
  }
}

// 5. Subscribe Once
export const SubscribeOnce: Story = {
  args: {
    title: '5. Subscribe Once',
    description: 'Subscribe to an event that should only trigger once, useful for initialization.',
    code: `import { createEventBus } from '@schema-component/engine'

const eventBus = createEventBus()

// Subscribe once
eventBus.subscribeOnce('app:ready', (event) => {
  console.log('App initialized at:', new Date(event.timestamp).toISOString())
  console.log('Config:', event.payload.config)
})

// First publish - handler receives it
eventBus.publish({
  type: 'app:ready',
  payload: { config: { version: '1.0.0' } },
  timestamp: Date.now()
})

// Second publish - handler does NOT receive it
eventBus.publish({
  type: 'app:ready',
  payload: { config: { version: '1.0.1' } },
  timestamp: Date.now()
})

console.log('Second event published but handler only fired once')`,
    result: `App initialized at: 2025-10-31T12:00:00.000Z
Config: { version: '1.0.0' }
Second event published but handler only fired once`
  }
}

// 6. Model Lifecycle Events
export const ModelLifecycleEvents: Story = {
  args: {
    title: '6. Model Lifecycle Events',
    description: 'Use predefined EventType enum for model CRUD operations.',
    code: `import { createEventBus, EventType } from '@schema-component/engine'

const eventBus = createEventBus()

// Subscribe to model lifecycle events
eventBus.subscribe(EventType.MODEL_AFTER_CREATE, (event) => {
  console.log('[Lifecycle] Model created:', event.payload)
})

eventBus.subscribe(EventType.MODEL_AFTER_UPDATE, (event) => {
  console.log('[Lifecycle] Model updated:', event.payload)
})

eventBus.subscribe(EventType.MODEL_AFTER_DELETE, (event) => {
  console.log('[Lifecycle] Model deleted:', event.payload)
})

// Publish lifecycle events
eventBus.publish({
  type: EventType.MODEL_AFTER_CREATE,
  payload: { id: 1, name: 'User 1' },
  timestamp: Date.now()
})

eventBus.publish({
  type: EventType.MODEL_AFTER_UPDATE,
  payload: { id: 1, name: 'Updated User 1' },
  timestamp: Date.now()
})

eventBus.publish({
  type: EventType.MODEL_AFTER_DELETE,
  payload: { id: 1 },
  timestamp: Date.now()
})`,
    result: `[Lifecycle] Model created: { id: 1, name: 'User 1' }
[Lifecycle] Model updated: { id: 1, name: 'Updated User 1' }
[Lifecycle] Model deleted: { id: 1 }`
  }
}

// 7. Custom Events
export const CustomEvents: Story = {
  args: {
    title: '7. Custom Events',
    description: 'Create domain-specific custom events for your application logic.',
    code: `import { createEventBus } from '@schema-component/engine'

const eventBus = createEventBus()

// Custom business events
eventBus.subscribe('order:shipped', (event) => {
  const { orderId, trackingNumber } = event.payload
  console.log(\`Order \${orderId} shipped\`)
  console.log(\`Tracking: \${trackingNumber}\`)
})

eventBus.subscribe('payment:received', (event) => {
  const { orderId, amount, method } = event.payload
  console.log(\`Payment received: $\${amount}\`)
  console.log(\`Method: \${method}\`)
})

eventBus.subscribe('inventory:low', (event) => {
  const { productId, currentStock, threshold } = event.payload
  console.log(\`⚠️  Low inventory alert!\`)
  console.log(\`Product: \${productId}\`)
  console.log(\`Stock: \${currentStock}/\${threshold}\`)
})

// Publish custom events
eventBus.publish({
  type: 'order:shipped',
  payload: { orderId: 123, trackingNumber: 'TRACK123' },
  timestamp: Date.now()
})

eventBus.publish({
  type: 'payment:received',
  payload: { orderId: 123, amount: 99.99, method: 'credit_card' },
  timestamp: Date.now()
})

eventBus.publish({
  type: 'inventory:low',
  payload: { productId: 'PROD-456', currentStock: 5, threshold: 10 },
  timestamp: Date.now()
})`,
    result: `Order 123 shipped
Tracking: TRACK123
Payment received: $99.99
Method: credit_card
⚠️  Low inventory alert!
Product: PROD-456
Stock: 5/10`
  }
}

// 8. Async Event Handlers
export const AsyncEventHandlers: Story = {
  args: {
    title: '8. Async Event Handlers',
    description: 'Event handlers can be async functions for operations like API calls or database updates.',
    code: `import { createEventBus } from '@schema-component/engine'

const eventBus = createEventBus()

// Async handler simulating API call
eventBus.subscribe('user:registered', async (event) => {
  console.log('Sending welcome email...')
  await new Promise(resolve => setTimeout(resolve, 100))
  console.log(\`✓ Email sent to \${event.payload.email}\`)
})

// Async handler simulating database update
eventBus.subscribe('user:registered', async (event) => {
  console.log('Creating user profile...')
  await new Promise(resolve => setTimeout(resolve, 150))
  console.log(\`✓ Profile created for \${event.payload.username}\`)
})

// Async handler simulating analytics tracking
eventBus.subscribe('user:registered', async (event) => {
  console.log('Tracking registration...')
  await new Promise(resolve => setTimeout(resolve, 50))
  console.log('✓ Analytics tracked')
})

// Publish event
eventBus.publish({
  type: 'user:registered',
  payload: {
    username: 'bob',
    email: 'bob@example.com'
  },
  timestamp: Date.now()
})

console.log('Event published (handlers running asynchronously)')`,
    result: `Event published (handlers running asynchronously)
Sending welcome email...
Creating user profile...
Tracking registration...
✓ Analytics tracked
✓ Email sent to bob@example.com
✓ Profile created for bob`,
    isAsync: true
  }
}

// 9. Event Metadata
export const EventMetadata: Story = {
  args: {
    title: '9. Event Metadata',
    description: 'Include metadata for debugging, tracking, and contextual information.',
    code: `import { createEventBus } from '@schema-component/engine'

const eventBus = createEventBus()

eventBus.subscribe('api:request', (event) => {
  console.log('API Request:')
  console.log('  Method:', event.payload.method)
  console.log('  URL:', event.payload.url)
  console.log('  Source:', event.source)
  console.log('  User:', event.metadata?.userId)
  console.log('  Request ID:', event.metadata?.requestId)
})

// Publish with metadata
eventBus.publish({
  type: 'api:request',
  payload: {
    method: 'POST',
    url: '/api/users',
    body: { name: 'Alice' }
  },
  timestamp: Date.now(),
  source: 'UserController',
  metadata: {
    userId: 101,
    requestId: 'req_abc123',
    environment: 'production'
  }
})`,
    result: `API Request:
  Method: POST
  URL: /api/users
  Source: UserController
  User: 101
  Request ID: req_abc123`
  }
}

// 10. Checking Listeners
export const CheckingListeners: Story = {
  args: {
    title: '10. Checking Listeners',
    description: 'Monitor subscription status for debugging and optimization.',
    code: `import { createEventBus } from '@schema-component/engine'

const eventBus = createEventBus()

console.log('Initial state:')
console.log('Has listeners:', eventBus.hasListeners('data:changed'))
console.log('Listener count:', eventBus.listenerCount('data:changed'))

// Add first subscriber
eventBus.subscribe('data:changed', () => {
  console.log('Handler 1')
})

console.log('\\nAfter first subscription:')
console.log('Has listeners:', eventBus.hasListeners('data:changed'))
console.log('Listener count:', eventBus.listenerCount('data:changed'))

// Add second subscriber
eventBus.subscribe('data:changed', () => {
  console.log('Handler 2')
})

console.log('\\nAfter second subscription:')
console.log('Has listeners:', eventBus.hasListeners('data:changed'))
console.log('Listener count:', eventBus.listenerCount('data:changed'))

// Clear all listeners
eventBus.unsubscribe('data:changed')

console.log('\\nAfter unsubscribe:')
console.log('Has listeners:', eventBus.hasListeners('data:changed'))
console.log('Listener count:', eventBus.listenerCount('data:changed'))`,
    result: `Initial state:
Has listeners: false
Listener count: 0

After first subscription:
Has listeners: true
Listener count: 1

After second subscription:
Has listeners: true
Listener count: 2

After unsubscribe:
Has listeners: false
Listener count: 0`
  }
}

// 11. Complete Event-Driven Workflow
export const CompleteWorkflow: Story = {
  args: {
    title: '11. Complete Event-Driven Workflow',
    description: 'A real-world example showing how events orchestrate a complex order processing flow.',
    code: `import { createEventBus, EventType } from '@schema-component/engine'

const eventBus = createEventBus()

// Email service
eventBus.subscribe('order:created', async (event) => {
  console.log('📧 Sending order confirmation email...')
  await new Promise(resolve => setTimeout(resolve, 50))
  console.log('✓ Email sent')
})

// Inventory service
eventBus.subscribe('order:created', async (event) => {
  console.log('📦 Reserving inventory...')
  await new Promise(resolve => setTimeout(resolve, 50))
  console.log('✓ Inventory reserved')

  // Trigger next event
  eventBus.publish({
    type: 'inventory:reserved',
    payload: event.payload,
    timestamp: Date.now()
  })
})

// Payment service
eventBus.subscribe('inventory:reserved', async (event) => {
  console.log('💳 Processing payment...')
  await new Promise(resolve => setTimeout(resolve, 50))
  console.log('✓ Payment processed')

  // Trigger next event
  eventBus.publish({
    type: 'payment:completed',
    payload: event.payload,
    timestamp: Date.now()
  })
})

// Shipping service
eventBus.subscribe('payment:completed', async (event) => {
  console.log('🚚 Creating shipping label...')
  await new Promise(resolve => setTimeout(resolve, 50))
  console.log('✓ Ready to ship')
})

// Analytics service (listens to everything)
eventBus.subscribe('order:created', (e) => console.log('[Analytics] Order created'))
eventBus.subscribe('inventory:reserved', (e) => console.log('[Analytics] Inventory reserved'))
eventBus.subscribe('payment:completed', (e) => console.log('[Analytics] Payment completed'))

// Start the workflow
console.log('Starting order workflow...\\n')
eventBus.publish({
  type: 'order:created',
  payload: { orderId: 12345, total: 99.99 },
  timestamp: Date.now()
})`,
    result: `Starting order workflow...

📧 Sending order confirmation email...
📦 Reserving inventory...
[Analytics] Order created
✓ Email sent
✓ Inventory reserved
[Analytics] Inventory reserved
💳 Processing payment...
✓ Payment processed
[Analytics] Payment completed
🚚 Creating shipping label...
✓ Ready to ship`,
    isAsync: true
  }
}

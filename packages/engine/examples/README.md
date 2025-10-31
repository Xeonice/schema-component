# @schema-component/engine Examples

This directory contains example code demonstrating how to use the @schema-component/engine package.

## Examples

### 1. Basic Usage (`basic-usage.ts`)

Demonstrates the fundamental features of the engine:
- Defining models with schemas, actions, views, and hooks
- Registering models with ModelRegistry
- Creating stores for state management
- Performing CRUD operations (Create, Read, Update, Delete)
- Using model actions
- Using lifecycle hooks

**Run:**
```bash
ts-node examples/basic-usage.ts
```

### 2. Event-Driven Architecture (`event-driven.ts`)

Shows how to build event-driven applications:
- Using EventBus for pub/sub messaging
- Listening to model lifecycle events (afterCreate, afterUpdate)
- Creating and publishing custom events
- Decoupling business logic with event handlers
- Building reactive workflows

**Run:**
```bash
ts-node examples/event-driven.ts
```

## Concepts Covered

### Model Definition
```typescript
const UserModel = defineModel({
  name: 'User',
  schema: {
    fields: {
      id: { type: 'number' },
      name: { type: 'string' },
      email: { type: 'string' }
    }
  },
  apis: {},
  actions: {
    sendEmail: async function(userId, subject, body) {
      // Business logic here
    }
  },
  views: {
    list: { type: 'list', title: 'Users' },
    detail: { type: 'detail', title: 'User Detail' }
  },
  hooks: {
    beforeCreate: async (data) => data,
    afterCreate: async (result) => result
  }
})
```

### State Management
```typescript
const repository = createMockRepository('User')
const userStore = createModelStore({
  modelName: 'User',
  repository
})

// CRUD operations
await userStore.create({ name: 'Alice' })
await userStore.loadList({})
await userStore.loadOne(id)
await userStore.update(id, { name: 'Bob' })
await userStore.delete(id)

// Reactive state
console.log(userStore.records) // Observable array
console.log(userStore.isLoading) // Computed property
console.log(userStore.hasData) // Computed property
```

### Event System
```typescript
const eventBus = createEventBus()

// Subscribe to events
eventBus.subscribe(EventType.MODEL_AFTER_CREATE, (event) => {
  console.log('Model created:', event.payload)
})

// Publish events
eventBus.publish({
  type: EventType.MODEL_AFTER_CREATE,
  payload: { id: 1, name: 'Alice' },
  timestamp: Date.now()
})

// Custom events
eventBus.subscribe('order:shipped', (event) => {
  console.log('Order shipped:', event.payload)
})

eventBus.publish({
  type: 'order:shipped',
  payload: { orderId: 123, trackingNumber: 'TRACK-123' },
  timestamp: Date.now()
})
```

## Architecture

The engine follows a layered architecture:

1. **Core Layer**: Model definition, schema, and registry
2. **Repository Layer**: Data access abstraction (mock, HTTP, etc.)
3. **State Layer**: MobX-based reactive state management
4. **Event Layer**: Event-driven architecture with EventBus
5. **Render Layer**: View stack, action queue, and rendering abstraction

Each layer is independent and can be used separately or together to build complex applications.

## Next Steps

- Check the [Integration Tests](../tests/integration/) for more complex scenarios
- Read the [Implementation Plan](../docs/IMPLEMENTATION_PLAN.md) for architecture details
- Explore the [API Documentation](../src/) to understand all available features

/**
 * CRUD Flow Integration Test
 * 测试 Model, State, Event 系统的集成
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { defineModel } from '../../src/core/defineModel'
import { ModelRegistry } from '../../src/core/ModelRegistry'
import { createModelStore } from '../../src/state/ModelStore'
import { createMockRepository } from '../../src/repository/mock'
import { EventBus, createEventBus } from '../../src/event/EventBus'
import { EventType } from '../../src/event/types'
import { RenderEngine } from '../../src/render/RenderEngine'
import type { IModel } from '../../src/core/types'

describe('CRUD Flow Integration Test', () => {
  let eventBus: EventBus
  let renderEngine: RenderEngine

  beforeEach(() => {
    // Clear model registry
    ModelRegistry.getInstance().clear()

    // Reset RenderEngine singleton
    ;(RenderEngine as any).instance = undefined

    // Create new instances
    eventBus = createEventBus()
    renderEngine = RenderEngine.getInstance()
  })

  it('should integrate Model, State, and Event systems', async () => {
    const events: any[] = []

    // Subscribe to events
    eventBus.subscribe(EventType.MODEL_AFTER_CREATE, (event) => {
      events.push({ type: 'create', data: event.payload })
    })

    eventBus.subscribe(EventType.STATE_CHANGED, (event) => {
      events.push({ type: 'state', data: event.payload })
    })

    // Define User Model
    const UserModel: IModel = defineModel({
      name: 'User',
      schema: {
        fields: {
          id: { type: 'number' },
          name: { type: 'string' },
          email: { type: 'string' }
        }
      },
      apis: {},
      actions: {},
      views: {},
      hooks: {
        afterCreate: async (result) => {
          // Publish event after creating
          eventBus.publish({
            type: EventType.MODEL_AFTER_CREATE,
            payload: result,
            timestamp: Date.now()
          })
          return result
        }
      }
    })

    // Register Model
    ModelRegistry.getInstance().register(UserModel)

    // Create repository and store
    const repository = createMockRepository('User')
    const userStore = createModelStore({
      modelName: 'User',
      repository
    })

    // Test State Management - Create
    const newUser = { name: 'Alice', email: 'alice@test.com' }
    const created = await userStore.create(newUser)

    // Call hook manually to trigger event
    if (UserModel.hooks.afterCreate) {
      await UserModel.hooks.afterCreate(created)
    }

    expect(created.id).toBeDefined()
    expect((created as any).name).toBe('Alice')
    expect(userStore.records).toHaveLength(1)

    // Test State Management - Load list
    await userStore.loadList({})
    expect(userStore.records.length).toBeGreaterThanOrEqual(1)

    // Test State Management - Update
    const updated = await userStore.update((created as any).id, { name: 'Alice Updated' })
    expect((updated as any).name).toBe('Alice Updated')
    expect(userStore.records.find((u: any) => u.id === (created as any).id)?.name).toBe('Alice Updated')

    // Test State Management - Delete
    await userStore.delete((created as any).id)
    expect(userStore.records.find((u: any) => u.id === (created as any).id)).toBeUndefined()

    // Verify events were emitted
    expect(events.length).toBeGreaterThan(0)
    const createEvent = events.find(e => e.type === 'create')
    expect(createEvent).toBeDefined()
    expect(createEvent.data.id).toBeDefined()
  })

  it('should integrate Render system with Model and State', () => {
    // Define Model
    const ProductModel: IModel = defineModel({
      name: 'Product',
      schema: {
        fields: {
          id: { type: 'number' },
          title: { type: 'string' },
          price: { type: 'number' }
        }
      },
      apis: {},
      actions: {},
      views: {
        list: {
          type: 'list',
          title: 'Products',
          fields: ['id', 'title', 'price']
        }
      },
      hooks: {}
    })

    ModelRegistry.getInstance().register(ProductModel)

    // Verify Model is registered
    const retrieved = ModelRegistry.getInstance().get('Product')
    expect(retrieved).toBeDefined()
    expect(retrieved?.name).toBe('Product')
    expect(retrieved?.views.list).toBeDefined()
    expect(retrieved?.views.list.type).toBe('list')

    // Verify RenderEngine is available
    expect(renderEngine.viewStack).toBeDefined()
    expect(renderEngine.actionQueue).toBeDefined()

    // Create context
    const context = renderEngine.createContext({
      modelName: 'Product',
      model: ProductModel
    })

    expect(context.modelName).toBe('Product')
    expect(context.viewStack).toBe(renderEngine.viewStack)
    expect(context.actionQueue).toBe(renderEngine.actionQueue)
  })

  it('should demonstrate full application flow', async () => {
    // 1. Define Model
    const TaskModel: IModel = defineModel({
      name: 'Task',
      schema: {
        fields: {
          id: { type: 'number' },
          title: { type: 'string' },
          completed: { type: 'boolean' }
        }
      },
      apis: {},
      actions: {},
      views: {
        list: { type: 'list', title: 'Tasks' },
        form: { type: 'form', title: 'New Task' }
      },
      hooks: {}
    })

    // 2. Register
    ModelRegistry.getInstance().register(TaskModel)

    // 3. Use State
    const repository = createMockRepository('Task')
    const taskStore = createModelStore({
      modelName: 'Task',
      repository
    })

    // Create some initial data
    await taskStore.create({ title: 'Task 1', completed: false })
    await taskStore.create({ title: 'Task 2', completed: true })

    // Load and verify
    await taskStore.loadList({})
    expect(taskStore.records.length).toBeGreaterThanOrEqual(2)

    // 4. Use Events
    const actionEvents: any[] = []
    eventBus.subscribe(EventType.ACTION_EXECUTED, (event) => {
      actionEvents.push(event.payload)
    })

    eventBus.publish({
      type: EventType.ACTION_EXECUTED,
      payload: { action: 'toggleComplete', taskId: 1 },
      timestamp: Date.now()
    })

    expect(actionEvents).toHaveLength(1)
    expect(actionEvents[0].action).toBe('toggleComplete')

    // 5. Use Render (ViewStack)
    const view = TaskModel.views.list
    renderEngine.viewStack.push(view, taskStore.records)

    expect(renderEngine.viewStack.current).toBeDefined()
    expect(renderEngine.viewStack.current?.type).toBe('list')
    expect(renderEngine.viewStack.canGoBack).toBe(false)

    // Push another view
    renderEngine.viewStack.push(TaskModel.views.form)
    expect(renderEngine.viewStack.canGoBack).toBe(true)

    // Go back
    renderEngine.viewStack.goBack()
    expect(renderEngine.viewStack.current?.type).toBe('list')
  })
})

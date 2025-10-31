/**
 * Full Engine Integration Test
 * 测试完整的 Engine 系统集成,包括所有层级的协同工作
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
import type { ServerActionDefinition } from '../../src/render/actionTypes'

describe('Full Engine Integration Test', () => {
  let eventBus: EventBus
  let renderEngine: RenderEngine

  beforeEach(() => {
    // Reset all singletons and state
    ModelRegistry.getInstance().clear()
    ;(RenderEngine as any).instance = undefined

    eventBus = createEventBus()
    renderEngine = RenderEngine.getInstance()
  })

  it('should support complete blog application flow', async () => {
    /**
     * Scenario: Blog Post Management Application
     * - Define BlogPost model with schema, APIs, actions, views
     * - Use state management for CRUD operations
     * - Use events for lifecycle hooks
     * - Use render system for views and actions
     */

    const events: Array<{ type: string; data: any }> = []

    // Track all model lifecycle events
    eventBus.subscribe(EventType.MODEL_AFTER_CREATE, (event) => {
      events.push({ type: 'after_create', data: event.payload })
    })

    eventBus.subscribe(EventType.MODEL_AFTER_UPDATE, (event) => {
      events.push({ type: 'after_update', data: event.payload })
    })

    eventBus.subscribe(EventType.MODEL_AFTER_DELETE, (event) => {
      events.push({ type: 'after_delete', data: event.payload })
    })

    // Define BlogPost Model
    const BlogPostModel: IModel = defineModel({
      name: 'BlogPost',
      schema: {
        fields: {
          id: { type: 'number' },
          title: { type: 'string' },
          content: { type: 'string' },
          author: { type: 'string' },
          published: { type: 'boolean' },
          createdAt: { type: 'number' }
        }
      },
      apis: {},
      actions: {
        publish: async function(postId: number) {
          // Simulate publishing logic
          return { id: postId, published: true }
        },
        unpublish: async function(postId: number) {
          return { id: postId, published: false }
        }
      },
      views: {
        list: {
          type: 'list',
          title: 'Blog Posts',
          fields: ['id', 'title', 'author', 'published']
        },
        detail: {
          type: 'detail',
          title: 'Post Detail'
        },
        form: {
          type: 'form',
          title: 'Edit Post'
        }
      },
      hooks: {
        beforeCreate: async (data) => {
          // Add timestamp
          return { ...data, createdAt: Date.now() }
        },
        afterCreate: async (result) => {
          eventBus.publish({
            type: EventType.MODEL_AFTER_CREATE,
            payload: result,
            timestamp: Date.now()
          })
          return result
        },
        afterUpdate: async (result) => {
          eventBus.publish({
            type: EventType.MODEL_AFTER_UPDATE,
            payload: result,
            timestamp: Date.now()
          })
          return result
        },
        afterDelete: async (id) => {
          eventBus.publish({
            type: EventType.MODEL_AFTER_DELETE,
            payload: { id },
            timestamp: Date.now()
          })
        }
      }
    })

    // 1. Register Model
    ModelRegistry.getInstance().register(BlogPostModel)
    const retrieved = ModelRegistry.getInstance().get('BlogPost')
    expect(retrieved).toBe(BlogPostModel)

    // 2. Create Store
    const repository = createMockRepository('BlogPost')
    const postStore = createModelStore({
      modelName: 'BlogPost',
      repository
    })

    expect(postStore.records).toHaveLength(0)
    expect(postStore.isLoading).toBe(false)

    // 3. Create Posts with hooks
    const post1Data = {
      title: 'First Post',
      content: 'Hello World',
      author: 'Alice',
      published: false
    }

    // Apply beforeCreate hook
    let processedData = post1Data
    if (BlogPostModel.hooks.beforeCreate) {
      processedData = await BlogPostModel.hooks.beforeCreate(post1Data)
    }

    const post1 = await postStore.create(processedData)

    // Call afterCreate hook
    if (BlogPostModel.hooks.afterCreate) {
      await BlogPostModel.hooks.afterCreate(post1)
    }

    expect(post1.id).toBeDefined()
    expect((post1 as any).title).toBe('First Post')
    expect((post1 as any).createdAt).toBeDefined() // Added by beforeCreate hook
    expect(postStore.records).toHaveLength(1)
    expect(postStore.total).toBe(1)

    // Create another post
    const post2Data = await BlogPostModel.hooks.beforeCreate?.({
      title: 'Second Post',
      content: 'Another post',
      author: 'Bob',
      published: true
    })
    const post2 = await postStore.create(post2Data!)
    await BlogPostModel.hooks.afterCreate?.(post2)

    expect(postStore.records).toHaveLength(2)

    // 4. Load List
    await postStore.loadList({})
    expect(postStore.records.length).toBeGreaterThanOrEqual(2)
    expect(postStore.hasData).toBe(true)

    // 5. Use Actions
    const publishResult = await BlogPostModel.actions.publish((post1 as any).id)
    expect(publishResult.published).toBe(true)

    // 6. Update Post with hooks
    const updatedPost = await postStore.update((post1 as any).id, {
      title: 'First Post - Updated'
    })
    await BlogPostModel.hooks.afterUpdate?.(updatedPost)

    expect((updatedPost as any).title).toBe('First Post - Updated')

    // 7. Render Views
    const listView = BlogPostModel.views.list
    renderEngine.viewStack.push(listView, postStore.records)

    expect(renderEngine.viewStack.current).toBeDefined()
    expect(renderEngine.viewStack.current?.type).toBe('list')
    expect(renderEngine.viewStack.current?.data).toBe(postStore.records)

    // Navigate to detail view
    const detailView = BlogPostModel.views.detail
    renderEngine.viewStack.push(detailView, post1)

    expect(renderEngine.viewStack.canGoBack).toBe(true)
    expect(renderEngine.viewStack.current?.type).toBe('detail')

    // Navigate to form view
    renderEngine.viewStack.push(BlogPostModel.views.form, post1)
    expect(renderEngine.viewStack.history).toHaveLength(3)

    // Go back
    renderEngine.viewStack.goBack()
    expect(renderEngine.viewStack.current?.type).toBe('detail')

    // 8. Test ActionQueue (async operations)
    const context = renderEngine.createContext({
      modelName: 'BlogPost',
      model: BlogPostModel
    })

    const publishAction: ServerActionDefinition = {
      type: 'server',
      name: 'publish',
      label: 'Publish Post'
    }

    const taskId = await renderEngine.executeServerAction(
      publishAction,
      { id: (post2 as any).id },
      context
    )

    expect(taskId).toBeDefined()

    const task = renderEngine.actionQueue.getTask(taskId)
    expect(task).toBeDefined()
    expect(task?.action.name).toBe('publish')

    // Wait for task to complete
    await new Promise(resolve => setTimeout(resolve, 100))

    const completedTask = renderEngine.actionQueue.getTask(taskId)
    expect(completedTask?.status).toBe('success')

    // 9. Delete Post with hooks
    await postStore.delete((post2 as any).id)
    await BlogPostModel.hooks.afterDelete?.((post2 as any).id)

    expect(postStore.records.find((p: any) => p.id === (post2 as any).id)).toBeUndefined()
    expect(postStore.records.length).toBeLessThan(2)

    // 10. Verify Events
    expect(events.length).toBeGreaterThan(0)

    const createEvents = events.filter(e => e.type === 'after_create')
    expect(createEvents).toHaveLength(2) // post1 and post2

    const updateEvents = events.filter(e => e.type === 'after_update')
    expect(updateEvents).toHaveLength(1) // post1 update

    const deleteEvents = events.filter(e => e.type === 'after_delete')
    expect(deleteEvents).toHaveLength(1) // post2 delete

    // 11. Test pagination
    postStore.setPage(2)
    postStore.setPageSize(10)
    expect(postStore.page).toBe(2)
    expect(postStore.pageSize).toBe(10)

    // 12. Test error handling
    postStore.clearError()
    expect(postStore.error).toBeNull()
    expect(postStore.hasError).toBe(false)
  })

  it('should support model registration and retrieval', () => {
    const Model1: IModel = defineModel({
      name: 'Model1',
      schema: { fields: {} },
      apis: {},
      actions: {},
      views: {},
      hooks: {}
    })

    const Model2: IModel = defineModel({
      name: 'Model2',
      schema: { fields: {} },
      apis: {},
      actions: {},
      views: {},
      hooks: {}
    })

    ModelRegistry.getInstance().register(Model1)
    ModelRegistry.getInstance().register(Model2)

    expect(ModelRegistry.getInstance().has('Model1')).toBe(true)
    expect(ModelRegistry.getInstance().has('Model2')).toBe(true)

    const allModels = ModelRegistry.getInstance().getAll()
    expect(allModels).toHaveLength(2)
    expect(allModels.map(m => m.name)).toContain('Model1')
    expect(allModels.map(m => m.name)).toContain('Model2')

    // Test unregister
    ModelRegistry.getInstance().unregister('Model1')
    expect(ModelRegistry.getInstance().has('Model1')).toBe(false)
    expect(ModelRegistry.getInstance().has('Model2')).toBe(true)
  })

  it('should handle concurrent operations in ActionQueue', async () => {
    const TestModel: IModel = defineModel({
      name: 'Test',
      schema: { fields: {} },
      apis: {},
      actions: {
        slowAction: async (data: any) => {
          await new Promise(resolve => setTimeout(resolve, 50))
          return { success: true, data }
        }
      },
      views: {},
      hooks: {}
    })

    ModelRegistry.getInstance().register(TestModel)

    const context = renderEngine.createContext({
      modelName: 'Test',
      model: TestModel
    })

    const action: ServerActionDefinition = {
      type: 'server',
      name: 'slowAction',
      label: 'Slow Action'
    }

    // Enqueue multiple actions
    const taskId1 = await renderEngine.executeServerAction(action, { id: 1 }, context)
    const taskId2 = await renderEngine.executeServerAction(action, { id: 2 }, context)
    const taskId3 = await renderEngine.executeServerAction(action, { id: 3 }, context)

    expect(taskId1).toBeDefined()
    expect(taskId2).toBeDefined()
    expect(taskId3).toBeDefined()

    // Check queue state
    const pending = renderEngine.actionQueue.pending
    const running = renderEngine.actionQueue.running
    expect(pending.length + running.length).toBeGreaterThan(0)

    // Wait for all to complete
    await new Promise(resolve => setTimeout(resolve, 200))

    expect(renderEngine.actionQueue.completed.length).toBe(3)
    expect(renderEngine.actionQueue.pending.length).toBe(0)
    expect(renderEngine.actionQueue.running.length).toBe(0)
  })
})

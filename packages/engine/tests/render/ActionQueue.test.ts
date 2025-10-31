import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ActionQueue } from '../../src/render/ActionQueue'
import type { ServerActionDefinition } from '../../src/render/actionTypes'
import type { RenderContext } from '../../src/render/types'

// Mock context
const createMockContext = (actionFn: any): RenderContext => ({
  modelName: 'User',
  model: {
    name: 'User',
    schema: {},
    apis: {},
    actions: {
      testAction: actionFn
    },
    views: {},
    hooks: {}
  } as any,
  viewStack: {} as any,
  actionQueue: {} as any
})

describe('ActionQueue', () => {
  let actionQueue: ActionQueue

  beforeEach(() => {
    actionQueue = new ActionQueue({
      concurrency: 2,
      defaultMaxRetries: 1,
      timeout: 1000
    })
  })

  it('should initialize with correct config', () => {
    expect(actionQueue.pending).toEqual([])
    expect(actionQueue.running).toEqual([])
    expect(actionQueue.completed).toEqual([])
    expect(actionQueue.failed).toEqual([])
  })

  it('should enqueue and execute action', async () => {
    const mockActionFn = vi.fn().mockResolvedValue({ success: true })
    const context = createMockContext(mockActionFn)

    const action: ServerActionDefinition = {
      type: 'server',
      name: 'testAction',
      label: 'Test'
    }

    const taskId = actionQueue.enqueue(action, { foo: 'bar' }, context)

    expect(taskId).toBeTruthy()

    // Wait for task to complete
    await new Promise(resolve => setTimeout(resolve, 100))

    expect(mockActionFn).toHaveBeenCalledWith({ foo: 'bar' })
    expect(actionQueue.completed).toHaveLength(1)
    expect(actionQueue.completed[0].result).toEqual({ success: true })
  })

  it('should handle action failure', async () => {
    const error = new Error('Test error')
    const mockActionFn = vi.fn().mockRejectedValue(error)
    const context = createMockContext(mockActionFn)

    const action: ServerActionDefinition = {
      type: 'server',
      name: 'testAction',
      label: 'Test'
    }

    actionQueue.enqueue(action, {}, context)

    // Wait for task to fail (including retry)
    await new Promise(resolve => setTimeout(resolve, 200))

    expect(actionQueue.failed).toHaveLength(1)
    expect(actionQueue.failed[0].error).toBe(error)
  })

  it('should respect concurrency limit', async () => {
    const mockActionFn = vi.fn().mockImplementation(() =>
      new Promise(resolve => setTimeout(() => resolve({ success: true }), 100))
    )
    const context = createMockContext(mockActionFn)

    const action: ServerActionDefinition = {
      type: 'server',
      name: 'testAction',
      label: 'Test'
    }

    // Enqueue 4 tasks (concurrency is 2)
    actionQueue.enqueue(action, {}, context)
    actionQueue.enqueue(action, {}, context)
    actionQueue.enqueue(action, {}, context)
    actionQueue.enqueue(action, {}, context)

    await new Promise(resolve => setTimeout(resolve, 50))

    // Only 2 should be running
    expect(actionQueue.running.length).toBeLessThanOrEqual(2)
    expect(actionQueue.pending.length).toBeGreaterThanOrEqual(2)
  })

  it('should cancel pending task', async () => {
    // Use slow action to keep tasks in queue
    const mockActionFn = vi.fn().mockImplementation(() =>
      new Promise(resolve => setTimeout(() => resolve({ success: true }), 200))
    )
    const context = createMockContext(mockActionFn)

    const action: ServerActionDefinition = {
      type: 'server',
      name: 'testAction',
      label: 'Test'
    }

    // Fill queue to prevent immediate execution (concurrency is 2)
    const taskId1 = actionQueue.enqueue(action, {}, context)
    const taskId2 = actionQueue.enqueue(action, {}, context)
    const taskId3 = actionQueue.enqueue(action, {}, context)
    const taskId4 = actionQueue.enqueue(action, {}, context)

    await new Promise(resolve => setTimeout(resolve, 20))

    // taskId3 or taskId4 should be pending
    const task = actionQueue.getTask(taskId4)
    const cancelled = actionQueue.cancel(taskId4)
    expect(cancelled).toBe(true)

    expect(task?.status).toBe('cancelled')
  })

  it('should retry failed task', async () => {
    let callCount = 0
    const mockActionFn = vi.fn().mockImplementation(() => {
      callCount++
      // Fail on first call, succeed on second
      if (callCount === 1) {
        return Promise.reject(new Error('First attempt failed'))
      }
      return Promise.resolve({ success: true })
    })
    const context = createMockContext(mockActionFn)

    const action: ServerActionDefinition = {
      type: 'server',
      name: 'testAction',
      label: 'Test'
    }

    const taskId = actionQueue.enqueue(action, {}, context, { maxRetries: 0 })

    // Wait for initial failure (no auto-retry since maxRetries=0)
    await new Promise(resolve => setTimeout(resolve, 100))

    const task = actionQueue.getTask(taskId)
    expect(task?.status).toBe('failed')

    // Manually retry the task
    const retried = actionQueue.retry(taskId)
    expect(retried).toBe(true)

    // Wait for retry to complete
    await new Promise(resolve => setTimeout(resolve, 100))

    expect(actionQueue.completed).toHaveLength(1)
    expect(mockActionFn).toHaveBeenCalledTimes(2) // 1 initial + 1 manual retry
  })

  it('should call onSuccess callback', async () => {
    const onSuccess = vi.fn()
    const mockActionFn = vi.fn().mockResolvedValue({ data: 'test' })
    const context = createMockContext(mockActionFn)

    const action: ServerActionDefinition = {
      type: 'server',
      name: 'testAction',
      label: 'Test',
      onSuccess
    }

    actionQueue.enqueue(action, {}, context)

    await new Promise(resolve => setTimeout(resolve, 100))

    expect(onSuccess).toHaveBeenCalledWith({ data: 'test' }, expect.any(Object))
  })

  it('should call onError callback', async () => {
    const onError = vi.fn()
    const error = new Error('Test error')
    const mockActionFn = vi.fn().mockRejectedValue(error)
    const context = createMockContext(mockActionFn)

    const action: ServerActionDefinition = {
      type: 'server',
      name: 'testAction',
      label: 'Test',
      onError
    }

    actionQueue.enqueue(action, {}, context, { maxRetries: 0 })

    await new Promise(resolve => setTimeout(resolve, 100))

    expect(onError).toHaveBeenCalledWith(error, expect.any(Object))
  })

  it('should subscribe to task updates', async () => {
    const mockActionFn = vi.fn().mockResolvedValue({ success: true })
    const context = createMockContext(mockActionFn)

    const action: ServerActionDefinition = {
      type: 'server',
      name: 'testAction',
      label: 'Test'
    }

    const updates: string[] = []

    // Subscribe before enqueuing
    const taskId = actionQueue.enqueue(action, {}, context)

    actionQueue.subscribe(taskId, task => {
      updates.push(task.status)
    })

    await new Promise(resolve => setTimeout(resolve, 100))

    // At minimum should have 'success' status
    expect(updates.length).toBeGreaterThan(0)
    expect(updates).toContain('success')
  })

  it('should subscribe to queue updates', async () => {
    const mockActionFn = vi.fn().mockResolvedValue({ success: true })
    const context = createMockContext(mockActionFn)

    const action: ServerActionDefinition = {
      type: 'server',
      name: 'testAction',
      label: 'Test'
    }

    let notificationCount = 0
    actionQueue.subscribeQueue(() => {
      notificationCount++
    })

    actionQueue.enqueue(action, {}, context)

    await new Promise(resolve => setTimeout(resolve, 100))

    expect(notificationCount).toBeGreaterThan(0)
  })

  it('should clear all tasks', async () => {
    const mockActionFn = vi.fn().mockResolvedValue({ success: true })
    const context = createMockContext(mockActionFn)

    const action: ServerActionDefinition = {
      type: 'server',
      name: 'testAction',
      label: 'Test'
    }

    actionQueue.enqueue(action, {}, context)
    actionQueue.enqueue(action, {}, context)

    actionQueue.clear()

    expect(actionQueue.pending).toHaveLength(0)
    expect(actionQueue.running).toHaveLength(0)
    expect(actionQueue.completed).toHaveLength(0)
  })

  it('should timeout long-running actions', async () => {
    const mockActionFn = vi.fn().mockImplementation(() =>
      new Promise(resolve => setTimeout(resolve, 5000))
    )
    const context = createMockContext(mockActionFn)

    const action: ServerActionDefinition = {
      type: 'server',
      name: 'testAction',
      label: 'Test'
    }

    actionQueue.enqueue(action, {}, context, { maxRetries: 0 })

    // Wait longer than timeout (1000ms from config)
    await new Promise(resolve => setTimeout(resolve, 1200))

    expect(actionQueue.failed.length).toBeGreaterThan(0)
    expect(actionQueue.failed[0].error?.message).toBe('Action timeout')
  })
})

/**
 * ModelExecutor 测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { defineModel } from '../../src/core/defineModel'
import { ModelExecutor, executeAction, executeMethod, callApi } from '../../src/core/ModelExecutor'
import { EventType } from '../../src/event/types'

describe('ModelExecutor', () => {
  describe('executeAction', () => {
    it('should execute action successfully', async () => {
      const model = defineModel({
        name: 'User',
        schema: {},
        actions: {
          activate: async ({ id }: { id: string }) => {
            return { id, isActive: true }
          }
        }
      })

      const result = await ModelExecutor.executeAction(model, 'activate', { id: '123' })

      expect(result).toEqual({ id: '123', isActive: true })
    })

    it('should throw error if action not found', async () => {
      const model = defineModel({
        name: 'User',
        schema: {},
        actions: {}
      })

      await expect(
        ModelExecutor.executeAction(model, 'nonExistent', {})
      ).rejects.toThrow('Action "nonExistent" not found')
    })

    it('should throw error if action is not a function', async () => {
      const model = defineModel({
        name: 'User',
        schema: {},
        actions: {
          invalid: 'not a function' as any
        }
      })

      await expect(
        ModelExecutor.executeAction(model, 'invalid', {})
      ).rejects.toThrow('Action "invalid" is not a function')
    })

    it('should publish action events', async () => {
      const beforeHandler = vi.fn()
      const afterHandler = vi.fn()

      const model = defineModel({
        name: 'User',
        schema: {},
        actions: {
          activate: async ({ id }: { id: string }) => {
            return { id, isActive: true }
          }
        }
      })

      model.context.eventBus.subscribe(EventType.ACTION_BEFORE_EXECUTE, beforeHandler)
      model.context.eventBus.subscribe(EventType.ACTION_EXECUTED, afterHandler)

      await ModelExecutor.executeAction(model, 'activate', { id: '123' })

      expect(beforeHandler).toHaveBeenCalled()
      expect(afterHandler).toHaveBeenCalled()
    })

    it('should publish action failed event on error', async () => {
      const failedHandler = vi.fn()

      const model = defineModel({
        name: 'User',
        schema: {},
        actions: {
          failing: async () => {
            throw new Error('Test error')
          }
        }
      })

      model.context.eventBus.subscribe(EventType.ACTION_FAILED, failedHandler)

      await expect(
        ModelExecutor.executeAction(model, 'failing', {})
      ).rejects.toThrow('Test error')

      expect(failedHandler).toHaveBeenCalled()
    })
  })

  describe('executeMethod', () => {
    it('should execute method successfully', async () => {
      const model = defineModel({
        name: 'User',
        schema: {},
        methods: {
          greet: async (name: string) => {
            return `Hello, ${name}!`
          }
        }
      })

      const result = await ModelExecutor.executeMethod(model, 'greet', 'World')

      expect(result).toBe('Hello, World!')
    })

    it('should throw error if method not found', async () => {
      const model = defineModel({
        name: 'User',
        schema: {},
        methods: {}
      })

      await expect(
        ModelExecutor.executeMethod(model, 'nonExistent')
      ).rejects.toThrow('Method "nonExistent" not found')
    })

    it('should throw error if method is not a function', async () => {
      const model = defineModel({
        name: 'User',
        schema: {},
        methods: {
          invalid: 'not a function' as any
        }
      })

      await expect(
        ModelExecutor.executeMethod(model, 'invalid')
      ).rejects.toThrow('Method "invalid" is not a function')
    })

    it('should publish failed event on error', async () => {
      const failedHandler = vi.fn()

      const model = defineModel({
        name: 'User',
        schema: {},
        methods: {
          failing: async () => {
            throw new Error('Method error')
          }
        }
      })

      model.context.eventBus.subscribe('model:method:failed', failedHandler)

      await expect(
        ModelExecutor.executeMethod(model, 'failing')
      ).rejects.toThrow('Method error')

      expect(failedHandler).toHaveBeenCalled()
    })
  })

  describe('callApi', () => {
    it('should call API successfully', async () => {
      const model = defineModel({
        name: 'User',
        schema: {},
        apis: {
          getList: async (params: any) => {
            return { data: ['user1', 'user2'], total: 2 }
          }
        }
      })

      const result = await ModelExecutor.callApi(model, 'getList', { page: 1 })

      expect(result).toEqual({ data: ['user1', 'user2'], total: 2 })
    })

    it('should throw error if API not found', async () => {
      const model = defineModel({
        name: 'User',
        schema: {},
        apis: {}
      })

      await expect(
        ModelExecutor.callApi(model, 'nonExistent')
      ).rejects.toThrow('API "nonExistent" not found')
    })

    it('should throw error if API is not a function', async () => {
      const model = defineModel({
        name: 'User',
        schema: {},
        apis: {
          invalid: 'not a function' as any
        }
      })

      await expect(
        ModelExecutor.callApi(model, 'invalid')
      ).rejects.toThrow('API "invalid" is not a function')
    })

    it('should publish failed event on error', async () => {
      const failedHandler = vi.fn()

      const model = defineModel({
        name: 'User',
        schema: {},
        apis: {
          failing: async () => {
            throw new Error('API error')
          }
        }
      })

      model.context.eventBus.subscribe('model:api:failed', failedHandler)

      await expect(
        ModelExecutor.callApi(model, 'failing')
      ).rejects.toThrow('API error')

      expect(failedHandler).toHaveBeenCalled()
    })
  })

  describe('executeHook', () => {
    it('should execute hook successfully', async () => {
      const model = defineModel({
        name: 'User',
        schema: {},
        hooks: {
          beforeCreate: async (data: any) => {
            return { ...data, validated: true }
          }
        }
      })

      const result = await ModelExecutor.executeHook(model, 'beforeCreate', { name: 'Test' })

      expect(result).toEqual({ name: 'Test', validated: true })
    })

    it('should return first argument if hook not found', async () => {
      const model = defineModel({
        name: 'User',
        schema: {},
        hooks: {}
      })

      const result = await ModelExecutor.executeHook(model, 'nonExistent', { name: 'Test' })

      expect(result).toEqual({ name: 'Test' })
    })

    it('should throw error if hook is not a function', async () => {
      const model = defineModel({
        name: 'User',
        schema: {},
        hooks: {
          invalid: 'not a function' as any
        }
      })

      await expect(
        ModelExecutor.executeHook(model, 'invalid', {})
      ).rejects.toThrow('Hook "invalid" is not a function')
    })
  })

  describe('hasAction/hasMethod/hasApi/hasHook', () => {
    it('should check if action exists', () => {
      const model = defineModel({
        name: 'User',
        schema: {},
        actions: {
          activate: async () => {}
        }
      })

      expect(ModelExecutor.hasAction(model, 'activate')).toBe(true)
      expect(ModelExecutor.hasAction(model, 'nonExistent')).toBe(false)
    })

    it('should check if method exists', () => {
      const model = defineModel({
        name: 'User',
        schema: {},
        methods: {
          greet: async () => 'Hello'
        }
      })

      expect(ModelExecutor.hasMethod(model, 'greet')).toBe(true)
      expect(ModelExecutor.hasMethod(model, 'nonExistent')).toBe(false)
    })

    it('should check if API exists', () => {
      const model = defineModel({
        name: 'User',
        schema: {},
        apis: {
          getList: async () => ({ data: [], total: 0 })
        }
      })

      expect(ModelExecutor.hasApi(model, 'getList')).toBe(true)
      expect(ModelExecutor.hasApi(model, 'nonExistent')).toBe(false)
    })

    it('should check if hook exists', () => {
      const model = defineModel({
        name: 'User',
        schema: {},
        hooks: {
          beforeCreate: async (data) => data
        }
      })

      expect(ModelExecutor.hasHook(model, 'beforeCreate')).toBe(true)
      expect(ModelExecutor.hasHook(model, 'nonExistent')).toBe(false)
    })
  })

  describe('Helper functions', () => {
    it('executeAction should work as helper', async () => {
      const model = defineModel({
        name: 'User',
        schema: {},
        actions: {
          test: async () => 'success'
        }
      })

      const result = await executeAction(model, 'test')
      expect(result).toBe('success')
    })

    it('executeMethod should work as helper', async () => {
      const model = defineModel({
        name: 'User',
        schema: {},
        methods: {
          test: async () => 'success'
        }
      })

      const result = await executeMethod(model, 'test')
      expect(result).toBe('success')
    })

    it('callApi should work as helper', async () => {
      const model = defineModel({
        name: 'User',
        schema: {},
        apis: {
          test: async () => 'success'
        }
      })

      const result = await callApi(model, 'test')
      expect(result).toBe('success')
    })
  })
})

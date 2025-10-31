/**
 * defineModel Store Integration Tests
 * 测试 defineModel 与 Store 的集成
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { defineModel } from '../../src/core/defineModel'
import type { IModel } from '../../src/core/defineModel'
import type { ModelStore } from '../../src/state/ModelStore'

describe('defineModel with Store', () => {
  const testSchema = {
    type: 'object',
    name: 'Test',
    fields: {
      id: { type: 'string' },
      name: { type: 'string' }
    }
  }

  // ============================================================================
  // Store 配置测试
  // ============================================================================

  describe('store configuration', () => {
    it('should not create store by default', () => {
      const model = defineModel({
        name: 'TestModel',
        schema: testSchema
      })

      expect(model.context.store).toBeUndefined()
    })

    it('should create store when store: true', () => {
      const model = defineModel({
        name: 'TestModel',
        schema: testSchema,
        store: true
      })

      expect(model.context.store).toBeDefined()
    })

    it('should create store with default config when store: true', () => {
      const model = defineModel({
        name: 'TestModel',
        schema: testSchema,
        store: true
      })

      const store = model.context.store as ModelStore

      expect(store).toBeDefined()
      expect(store.pageSize).toBe(20) // default pageSize
      expect(store.records).toEqual([])
      expect(store.total).toBe(0)
      expect(store.page).toBe(1)
      expect(store.loadingState).toBe('idle')
    })

    it('should create store with custom pageSize', () => {
      const model = defineModel({
        name: 'TestModel',
        schema: testSchema,
        store: {
          defaultPageSize: 50
        }
      })

      const store = model.context.store as ModelStore

      expect(store).toBeDefined()
      expect(store.pageSize).toBe(50)
    })

    it('should create store with autoLoad disabled', () => {
      const model = defineModel({
        name: 'TestModel',
        schema: testSchema,
        store: {
          autoLoad: false
        }
      })

      const store = model.context.store as ModelStore

      expect(store).toBeDefined()
      expect(store.records).toEqual([])
      expect(store.loadingState).toBe('idle')
    })

    it('should create store with autoLoad enabled', async () => {
      const model = defineModel({
        name: 'TestModel',
        schema: testSchema,
        store: {
          autoLoad: true
        }
      })

      const store = model.context.store as ModelStore

      // 等待 autoLoad 完成
      await new Promise(resolve => setTimeout(resolve, 10))

      expect(store).toBeDefined()
      expect(store.loadingState).toBe('success')
    })

    it('should create store with both autoLoad and custom pageSize', async () => {
      const model = defineModel({
        name: 'TestModel',
        schema: testSchema,
        store: {
          autoLoad: true,
          defaultPageSize: 100
        }
      })

      const store = model.context.store as ModelStore

      // 等待 autoLoad 完成
      await new Promise(resolve => setTimeout(resolve, 10))

      expect(store).toBeDefined()
      expect(store.pageSize).toBe(100)
      expect(store.loadingState).toBe('success')
    })
  })

  // ============================================================================
  // Store 与 Repository 集成
  // ============================================================================

  describe('store with repository', () => {
    it('should use mock repository by default', () => {
      const model = defineModel({
        name: 'TestModel',
        schema: testSchema,
        store: true
      })

      const store = model.context.store as ModelStore

      expect(store).toBeDefined()
      expect(model.context.repository).toBeDefined()
    })

    it('should use configured mock repository', () => {
      const model = defineModel({
        name: 'TestModel',
        schema: testSchema,
        repository: {
          type: 'mock'
        },
        store: true
      })

      const store = model.context.store as ModelStore

      expect(store).toBeDefined()
      expect(model.context.repository).toBeDefined()
    })

    it('should work with Store operations using mock repository', async () => {
      const model = defineModel({
        name: 'TestModel',
        schema: testSchema,
        store: true
      })

      const store = model.context.store as ModelStore

      // 创建记录
      const created = await store.create({ name: 'Test Record' })
      expect(created).toBeDefined()
      expect((created as any).name).toBe('Test Record')

      // 加载列表
      await store.loadList()
      expect(store.records.length).toBeGreaterThan(0)

      // 更新记录
      const updated = await store.update((created as any).id, {
        name: 'Updated Record'
      })
      expect((updated as any).name).toBe('Updated Record')

      // 删除记录
      const deleted = await store.delete((created as any).id)
      expect(deleted).toBe(true)
    })
  })

  // ============================================================================
  // Store 与 Actions 集成
  // ============================================================================

  describe('store with actions', () => {
    it('should allow actions to access store', async () => {
      const model = defineModel({
        name: 'TestModel',
        schema: testSchema,
        store: true,
        actions: (context) => ({
          createAndLoad: async (data: any) => {
            const store = context.store as ModelStore
            await store.create(data)
            await store.loadList()
            return store.records
          }
        })
      })

      const result = await model.actions.createAndLoad({ name: 'New Record' })

      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
    })

    it('should allow actions to manipulate store state', async () => {
      const model = defineModel({
        name: 'TestModel',
        schema: testSchema,
        store: true,
        actions: (context) => ({
          batchCreate: async (items: any[]) => {
            const store = context.store as ModelStore

            const created = []
            for (const item of items) {
              const record = await store.create(item)
              created.push(record)
            }

            return {
              created,
              total: store.total,
              count: store.records.length
            }
          }
        })
      })

      const result = await model.actions.batchCreate([
        { name: 'Item 1' },
        { name: 'Item 2' },
        { name: 'Item 3' }
      ])

      expect(result.created.length).toBe(3)
      expect(result.total).toBe(3)
      expect(result.count).toBe(3)
    })

    it('should allow actions to use store with repository', async () => {
      const model = defineModel({
        name: 'TestModel',
        schema: testSchema,
        store: true,
        actions: (context) => ({
          loadAndGetFirst: async () => {
            const store = context.store as ModelStore
            await store.loadList()

            if (store.records.length > 0) {
              store.setCurrent(store.records[0])
              return store.current
            }

            return null
          }
        })
      })

      const store = model.context.store as ModelStore

      // 先创建一些数据
      await store.create({ name: 'First' })
      await store.create({ name: 'Second' })

      // 使用 action
      const result = await model.actions.loadAndGetFirst()

      expect(result).toBeDefined()
      expect(store.current).toBeDefined()
    })
  })

  // ============================================================================
  // Store 与事件系统集成
  // ============================================================================

  describe('store with events', () => {
    it('should publish model:defined event with hasStore', () => {
      const events: any[] = []

      const model = defineModel({
        name: 'TestModel',
        schema: testSchema,
        store: true
      })

      // 订阅事件
      const unsubscribe = model.context.eventBus.subscribe(
        'model:defined',
        (event) => {
          events.push(event)
        }
      )

      // 创建另一个 model 触发事件
      defineModel({
        name: 'AnotherModel',
        schema: testSchema,
        store: true
      })

      expect(events.length).toBeGreaterThan(0)
      const lastEvent = events[events.length - 1]
      expect(lastEvent.payload.hasStore).toBe(true)

      unsubscribe()
    })

    it('should publish events without hasStore when no store', () => {
      const events: any[] = []

      const model = defineModel({
        name: 'TestModel',
        schema: testSchema
      })

      // 订阅事件
      const unsubscribe = model.context.eventBus.subscribe(
        'model:defined',
        (event) => {
          events.push(event)
        }
      )

      // 创建另一个 model 触发事件
      defineModel({
        name: 'AnotherModel',
        schema: testSchema
      })

      expect(events.length).toBeGreaterThan(0)
      const lastEvent = events[events.length - 1]
      expect(lastEvent.payload.hasStore).toBe(false)

      unsubscribe()
    })
  })

  // ============================================================================
  // 多个 Model 的 Store 隔离
  // ============================================================================

  describe('store isolation', () => {
    it('should create separate stores for different models', async () => {
      const model1 = defineModel({
        name: 'Model1',
        schema: testSchema,
        store: true
      })

      const model2 = defineModel({
        name: 'Model2',
        schema: testSchema,
        store: true
      })

      const store1 = model1.context.store as ModelStore
      const store2 = model2.context.store as ModelStore

      expect(store1).not.toBe(store2)

      // 在 store1 中创建数据
      await store1.create({ name: 'Model 1 Record' })

      // store2 不应该受到影响
      expect(store1.records.length).toBe(1)
      expect(store2.records.length).toBe(0)
    })

    it('should maintain separate state for each store', async () => {
      const model1 = defineModel({
        name: 'Model1',
        schema: testSchema,
        store: true
      })

      const model2 = defineModel({
        name: 'Model2',
        schema: testSchema,
        store: true
      })

      const store1 = model1.context.store as ModelStore
      const store2 = model2.context.store as ModelStore

      // 设置不同的分页
      store1.setPage(2)
      store1.setPageSize(50)

      store2.setPage(3)
      store2.setPageSize(100)

      expect(store1.page).toBe(2)
      expect(store1.pageSize).toBe(50)

      expect(store2.page).toBe(3)
      expect(store2.pageSize).toBe(100)
    })
  })

  // ============================================================================
  // Store 与 Views 集成
  // ============================================================================

  describe('store with views', () => {
    it('should allow views to access store', () => {
      const model = defineModel({
        name: 'TestModel',
        schema: testSchema,
        store: true,
        views: (context) => ({
          list: {
            type: 'list',
            title: 'List View',
            getStore: () => context.store
          }
        })
      })

      const listView = model.views.list as any
      const store = listView.getStore()

      expect(store).toBeDefined()
      expect(store).toBe(model.context.store)
    })
  })
})

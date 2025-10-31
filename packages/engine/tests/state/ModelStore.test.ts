/**
 * ModelStore Tests
 * 测试 MobX 响应式 Store
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { runInAction } from 'mobx'
import { ModelStore, createModelStore } from '../../src/state/ModelStore'
import { createMockRepository } from '../../src/repository/mock'
import type { IRepository } from '../../src/core/types'

describe('ModelStore', () => {
  let repository: IRepository
  let store: ModelStore

  beforeEach(() => {
    repository = createMockRepository('TestModel')
    store = createModelStore({
      modelName: 'TestModel',
      repository,
      defaultPageSize: 20
    })
  })

  // ============================================================================
  // 构造函数和初始状态
  // ============================================================================

  describe('constructor', () => {
    it('should initialize with default state', () => {
      expect(store.records).toEqual([])
      expect(store.current).toBeNull()
      expect(store.total).toBe(0)
      expect(store.page).toBe(1)
      expect(store.pageSize).toBe(20)
      expect(store.loadingState).toBe('idle')
      expect(store.error).toBeNull()
    })

    it('should accept custom defaultPageSize', () => {
      const customStore = createModelStore({
        modelName: 'Test',
        repository,
        defaultPageSize: 50
      })

      expect(customStore.pageSize).toBe(50)
    })

    it('should not auto load by default', async () => {
      const spy = vi.spyOn(repository, 'getList')

      createModelStore({
        modelName: 'Test',
        repository,
        autoLoad: false
      })

      expect(spy).not.toHaveBeenCalled()
    })

    it('should auto load when autoLoad is true', async () => {
      const spy = vi.spyOn(repository, 'getList')

      createModelStore({
        modelName: 'Test',
        repository,
        autoLoad: true
      })

      // 等待 async 操作完成
      await new Promise(resolve => setTimeout(resolve, 10))

      expect(spy).toHaveBeenCalled()
    })
  })

  // ============================================================================
  // Computed Properties
  // ============================================================================

  describe('computed properties', () => {
    it('isLoading should be true when loadingState is pending', () => {
      runInAction(() => {
        ;(store as any).loadingState = 'pending'
      })

      expect(store.isLoading).toBe(true)
    })

    it('isLoading should be false when loadingState is not pending', () => {
      runInAction(() => {
        ;(store as any).loadingState = 'success'
      })

      expect(store.isLoading).toBe(false)
    })

    it('hasError should be true when error exists', () => {
      runInAction(() => {
        ;(store as any).loadingState = 'error'
        ;(store as any).error = new Error('Test error')
      })

      expect(store.hasError).toBe(true)
    })

    it('hasError should be false when error is null', () => {
      runInAction(() => {
        ;(store as any).loadingState = 'error'
        ;(store as any).error = null
      })

      expect(store.hasError).toBe(false)
    })

    it('hasData should be true when records exist', () => {
      runInAction(() => {
        ;(store as any).records = [{ id: 1 }]
      })

      expect(store.hasData).toBe(true)
    })

    it('hasData should be false when records are empty', () => {
      expect(store.hasData).toBe(false)
    })

    it('totalPages should calculate correctly', () => {
      runInAction(() => {
        ;(store as any).total = 45
        ;(store as any).pageSize = 10
      })

      expect(store.totalPages).toBe(5)
    })

    it('totalPages should handle edge cases', () => {
      runInAction(() => {
        ;(store as any).total = 0
        ;(store as any).pageSize = 10
      })

      expect(store.totalPages).toBe(0)
    })
  })

  // ============================================================================
  // loadList
  // ============================================================================

  describe('loadList', () => {
    it('should load list successfully', async () => {
      await store.loadList()

      expect(store.loadingState).toBe('success')
      expect(store.records).toBeDefined()
      expect(store.total).toBeGreaterThanOrEqual(0)
    })

    it('should update loading state during load', async () => {
      const promise = store.loadList()

      // 在 promise resolve 之前，loadingState 应该是 pending
      expect(store.loadingState).toBe('pending')

      await promise

      expect(store.loadingState).toBe('success')
    })

    it('should accept pagination params', async () => {
      const spy = vi.spyOn(repository, 'getList')

      await store.loadList({
        pagination: { page: 2, pageSize: 10 }
      })

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          pagination: { page: 2, pageSize: 10 }
        })
      )
    })

    it('should accept filter params', async () => {
      const spy = vi.spyOn(repository, 'getList')

      await store.loadList({
        filter: { status: 'active' }
      })

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          filter: { status: 'active' }
        })
      )
    })

    it('should accept sort params', async () => {
      const spy = vi.spyOn(repository, 'getList')

      await store.loadList({
        sort: [{ field: 'name', order: 'ASC' }]
      })

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          sort: [{ field: 'name', order: 'ASC' }]
        })
      )
    })

    it('should handle errors', async () => {
      const error = new Error('Load failed')
      vi.spyOn(repository, 'getList').mockRejectedValue(error)

      await expect(store.loadList()).rejects.toThrow('Load failed')

      expect(store.loadingState).toBe('error')
      expect(store.error).toBe(error)
    })
  })

  // ============================================================================
  // loadOne
  // ============================================================================

  describe('loadOne', () => {
    it('should load one record successfully', async () => {
      // 先创建一个记录
      const created = await store.create({ name: 'Test' })
      const id = (created as any).id

      await store.loadOne(id)

      expect(store.current).toBeDefined()
      expect((store.current as any).id).toBe(id)
      expect(store.loadingState).toBe('success')
    })

    it('should update loading state during load', async () => {
      // 先创建一个记录
      const created = await store.create({ name: 'Test' })
      const id = (created as any).id

      const promise = store.loadOne(id)

      expect(store.loadingState).toBe('pending')

      await promise

      expect(store.loadingState).toBe('success')
    })

    it('should handle errors', async () => {
      const error = new Error('Not found')
      vi.spyOn(repository, 'getOne').mockRejectedValue(error)

      await expect(store.loadOne('invalid-id')).rejects.toThrow('Not found')

      expect(store.loadingState).toBe('error')
      expect(store.error).toBe(error)
    })
  })

  // ============================================================================
  // create
  // ============================================================================

  describe('create', () => {
    it('should create record successfully', async () => {
      const data = { name: 'New Record' }
      const created = await store.create(data)

      expect(created).toBeDefined()
      expect((created as any).name).toBe('New Record')
      expect(store.loadingState).toBe('success')
    })

    it('should add to records and increment total', async () => {
      const initialTotal = store.total
      const initialCount = store.records.length

      await store.create({ name: 'Test' })

      expect(store.records.length).toBe(initialCount + 1)
      expect(store.total).toBe(initialTotal + 1)
    })

    it('should update loading state during create', async () => {
      const promise = store.create({ name: 'Test' })

      expect(store.loadingState).toBe('pending')

      await promise

      expect(store.loadingState).toBe('success')
    })

    it('should handle errors', async () => {
      const error = new Error('Create failed')
      vi.spyOn(repository, 'createOne').mockRejectedValue(error)

      await expect(store.create({})).rejects.toThrow('Create failed')

      expect(store.loadingState).toBe('error')
      expect(store.error).toBe(error)
    })
  })

  // ============================================================================
  // update
  // ============================================================================

  describe('update', () => {
    it('should update record successfully', async () => {
      // 先创建一个记录
      const created = await store.create({ name: 'Original' })
      const id = (created as any).id

      const updated = await store.update(id, { name: 'Updated' })

      expect((updated as any).name).toBe('Updated')
      expect(store.loadingState).toBe('success')
    })

    it('should update record in records array', async () => {
      // 先创建一个记录
      const created = await store.create({ name: 'Original' })
      const id = (created as any).id

      await store.update(id, { name: 'Updated' })

      const found = store.records.find((r: any) => r.id === id)
      expect(found).toBeDefined()
      expect((found as any).name).toBe('Updated')
    })

    it('should update current if it matches', async () => {
      // 先创建并设置为 current
      const created = await store.create({ name: 'Original' })
      const id = (created as any).id
      store.setCurrent(created)

      await store.update(id, { name: 'Updated' })

      expect(store.current).toBeDefined()
      expect((store.current as any).name).toBe('Updated')
    })

    it('should not update current if it does not match', async () => {
      const record1 = await store.create({ name: 'Record 1' })
      const record2 = await store.create({ name: 'Record 2' })

      store.setCurrent(record1)

      await store.update((record2 as any).id, { name: 'Record 2 Updated' })

      expect((store.current as any).name).toBe('Record 1')
    })

    it('should handle errors', async () => {
      const error = new Error('Update failed')
      vi.spyOn(repository, 'updateOne').mockRejectedValue(error)

      await expect(store.update('id', {})).rejects.toThrow('Update failed')

      expect(store.loadingState).toBe('error')
      expect(store.error).toBe(error)
    })
  })

  // ============================================================================
  // delete
  // ============================================================================

  describe('delete', () => {
    it('should delete record successfully', async () => {
      // 先创建一个记录
      const created = await store.create({ name: 'To Delete' })
      const id = (created as any).id

      const result = await store.delete(id)

      expect(result).toBe(true)
      expect(store.loadingState).toBe('success')
    })

    it('should remove from records and decrement total', async () => {
      const created = await store.create({ name: 'Test' })
      const id = (created as any).id

      const beforeCount = store.records.length
      const beforeTotal = store.total

      await store.delete(id)

      expect(store.records.length).toBe(beforeCount - 1)
      expect(store.total).toBe(beforeTotal - 1)
    })

    it('should clear current if it matches', async () => {
      const created = await store.create({ name: 'Test' })
      const id = (created as any).id
      store.setCurrent(created)

      await store.delete(id)

      expect(store.current).toBeNull()
    })

    it('should not clear current if it does not match', async () => {
      const record1 = await store.create({ name: 'Record 1' })
      const record2 = await store.create({ name: 'Record 2' })

      store.setCurrent(record1)

      await store.delete((record2 as any).id)

      expect(store.current).not.toBeNull()
      expect((store.current as any).id).toBe((record1 as any).id)
    })

    it('should handle errors', async () => {
      const error = new Error('Delete failed')
      vi.spyOn(repository, 'deleteOne').mockRejectedValue(error)

      await expect(store.delete('id')).rejects.toThrow('Delete failed')

      expect(store.loadingState).toBe('error')
      expect(store.error).toBe(error)
    })
  })

  // ============================================================================
  // setCurrent
  // ============================================================================

  describe('setCurrent', () => {
    it('should set current record', () => {
      const record = { id: 1, name: 'Test' }
      store.setCurrent(record)

      expect(store.current).toEqual(record)
    })

    it('should set current to null', () => {
      store.setCurrent({ id: 1 })
      store.setCurrent(null)

      expect(store.current).toBeNull()
    })
  })

  // ============================================================================
  // setPage
  // ============================================================================

  describe('setPage', () => {
    it('should set page', () => {
      store.setPage(5)

      expect(store.page).toBe(5)
    })
  })

  // ============================================================================
  // setPageSize
  // ============================================================================

  describe('setPageSize', () => {
    it('should set page size', () => {
      store.setPageSize(50)

      expect(store.pageSize).toBe(50)
    })
  })

  // ============================================================================
  // reset
  // ============================================================================

  describe('reset', () => {
    it('should reset all state', async () => {
      // 先设置一些状态
      await store.create({ name: 'Test' })
      store.setPage(3)
      store.setPageSize(50)
      runInAction(() => {
        ;(store as any).loadingState = 'success'
      })

      // 重置
      store.reset()

      expect(store.records).toEqual([])
      expect(store.current).toBeNull()
      expect(store.total).toBe(0)
      expect(store.page).toBe(1)
      expect(store.loadingState).toBe('idle')
      expect(store.error).toBeNull()
    })
  })

  // ============================================================================
  // clearError
  // ============================================================================

  describe('clearError', () => {
    it('should clear error', () => {
      runInAction(() => {
        ;(store as any).error = new Error('Test')
        ;(store as any).loadingState = 'error'
      })

      store.clearError()

      expect(store.error).toBeNull()
      expect(store.loadingState).toBe('idle')
    })

    it('should not change loadingState if not error', () => {
      runInAction(() => {
        ;(store as any).loadingState = 'success'
      })

      store.clearError()

      expect(store.loadingState).toBe('success')
    })
  })
})

describe('createModelStore', () => {
  it('should create a ModelStore instance', () => {
    const repository = createMockRepository('Test')
    const store = createModelStore({
      modelName: 'Test',
      repository
    })

    expect(store).toBeInstanceOf(ModelStore)
  })

  it('should pass config to constructor', () => {
    const repository = createMockRepository('Test')
    const store = createModelStore({
      modelName: 'Test',
      repository,
      defaultPageSize: 100
    })

    expect(store.pageSize).toBe(100)
  })
})

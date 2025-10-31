/**
 * MockRepository 测试
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { MockRepository, createMockRepository, clearAllMockData } from '../../src/repository/mock'

describe('MockRepository', () => {
  let repository: MockRepository

  beforeEach(() => {
    repository = createMockRepository('User')
  })

  afterEach(() => {
    clearAllMockData()
  })

  describe('createOne', () => {
    it('should create a record', async () => {
      const data = { name: 'John', email: 'john@example.com' }
      const created = await repository.createOne(data)

      expect(created).toBeDefined()
      expect(created.id).toBeDefined()
      expect(created.name).toBe('John')
      expect(created.email).toBe('john@example.com')
      expect(created.createdAt).toBeDefined()
      expect(created.updatedAt).toBeDefined()
    })

    it('should use provided ID', async () => {
      const data = { id: 'custom-id', name: 'John' }
      const created = await repository.createOne(data)

      expect(created.id).toBe('custom-id')
    })

    it('should auto-generate ID', async () => {
      const created1 = await repository.createOne({ name: 'User 1' })
      const created2 = await repository.createOne({ name: 'User 2' })

      expect(created1.id).toBeDefined()
      expect(created2.id).toBeDefined()
      expect(created1.id).not.toBe(created2.id)
    })
  })

  describe('getOne', () => {
    it('should get a record by ID', async () => {
      const created = await repository.createOne({ name: 'John' })
      const retrieved = await repository.getOne(created.id)

      expect(retrieved).toEqual(created)
    })

    it('should throw error if record not found', async () => {
      await expect(repository.getOne('non-existent')).rejects.toThrow('Record with id non-existent not found')
    })
  })

  describe('getList', () => {
    it('should get all records', async () => {
      await repository.createOne({ name: 'User 1' })
      await repository.createOne({ name: 'User 2' })
      await repository.createOne({ name: 'User 3' })

      const result = await repository.getList({})

      expect(result.data).toHaveLength(3)
      expect(result.total).toBe(3)
    })

    it('should apply pagination', async () => {
      await repository.createOne({ name: 'User 1' })
      await repository.createOne({ name: 'User 2' })
      await repository.createOne({ name: 'User 3' })
      await repository.createOne({ name: 'User 4' })

      const result = await repository.getList({
        pagination: { page: 1, pageSize: 2 }
      })

      expect(result.data).toHaveLength(2)
      expect(result.total).toBe(4)
      expect(result.page).toBe(1)
      expect(result.pageSize).toBe(2)
    })

    it('should apply filter', async () => {
      await repository.createOne({ name: 'John', role: 'admin' })
      await repository.createOne({ name: 'Jane', role: 'user' })
      await repository.createOne({ name: 'Bob', role: 'admin' })

      const result = await repository.getList({
        filter: { role: 'admin' }
      })

      expect(result.data).toHaveLength(2)
      expect(result.total).toBe(2)
      expect(result.data.every(u => u.role === 'admin')).toBe(true)
    })

    it('should apply sort', async () => {
      await repository.createOne({ name: 'Charlie', age: 30 })
      await repository.createOne({ name: 'Alice', age: 25 })
      await repository.createOne({ name: 'Bob', age: 35 })

      const result = await repository.getList({
        sort: [{ field: 'name', order: 'ASC' }]
      })

      expect(result.data[0].name).toBe('Alice')
      expect(result.data[1].name).toBe('Bob')
      expect(result.data[2].name).toBe('Charlie')
    })

    it('should apply multiple sorts', async () => {
      await repository.createOne({ role: 'admin', name: 'Charlie' })
      await repository.createOne({ role: 'user', name: 'Alice' })
      await repository.createOne({ role: 'admin', name: 'Bob' })

      const result = await repository.getList({
        sort: [
          { field: 'role', order: 'ASC' },
          { field: 'name', order: 'ASC' }
        ]
      })

      expect(result.data[0].name).toBe('Bob')
      expect(result.data[1].name).toBe('Charlie')
      expect(result.data[2].name).toBe('Alice')
    })
  })

  describe('updateOne', () => {
    it('should update a record', async () => {
      const created = await repository.createOne({ name: 'John', email: 'john@example.com' })
      // 添加小延迟确保时间戳不同
      await new Promise(resolve => setTimeout(resolve, 10))
      const updated = await repository.updateOne(created.id, { email: 'john.updated@example.com' })

      expect(updated.id).toBe(created.id)
      expect(updated.email).toBe('john.updated@example.com')
      expect(updated.name).toBe('John')
      expect(updated.updatedAt).toBeDefined()
      expect(updated.updatedAt >= created.updatedAt).toBe(true)
    })

    it('should throw error if record not found', async () => {
      await expect(
        repository.updateOne('non-existent', { name: 'Updated' })
      ).rejects.toThrow('Record with id non-existent not found')
    })

    it('should preserve ID on update', async () => {
      const created = await repository.createOne({ name: 'John' })
      const updated = await repository.updateOne(created.id, { id: 'different-id', name: 'Updated' })

      expect(updated.id).toBe(created.id)
      expect(updated.name).toBe('Updated')
    })
  })

  describe('deleteOne', () => {
    it('should delete a record', async () => {
      const created = await repository.createOne({ name: 'John' })
      const result = await repository.deleteOne(created.id)

      expect(result).toBe(true)
      await expect(repository.getOne(created.id)).rejects.toThrow()
    })

    it('should return false if record not found', async () => {
      const result = await repository.deleteOne('non-existent')
      expect(result).toBe(false)
    })
  })

  describe('getMany', () => {
    it('should get multiple records', async () => {
      const user1 = await repository.createOne({ name: 'User 1' })
      const user2 = await repository.createOne({ name: 'User 2' })
      const user3 = await repository.createOne({ name: 'User 3' })

      const results = await repository.getMany([user1.id, user3.id])

      expect(results).toHaveLength(2)
      expect(results[0].id).toBe(user1.id)
      expect(results[1].id).toBe(user3.id)
    })

    it('should filter out non-existent records', async () => {
      const user1 = await repository.createOne({ name: 'User 1' })

      const results = await repository.getMany([user1.id, 'non-existent'])

      expect(results).toHaveLength(1)
      expect(results[0].id).toBe(user1.id)
    })
  })

  describe('createMany', () => {
    it('should create multiple records', async () => {
      const results = await repository.createMany([
        { name: 'User 1' },
        { name: 'User 2' },
        { name: 'User 3' }
      ])

      expect(results).toHaveLength(3)
      expect(results[0].name).toBe('User 1')
      expect(results[1].name).toBe('User 2')
      expect(results[2].name).toBe('User 3')
    })
  })

  describe('updateMany', () => {
    it('should update multiple records', async () => {
      const user1 = await repository.createOne({ name: 'User 1', role: 'user' })
      const user2 = await repository.createOne({ name: 'User 2', role: 'user' })

      const results = await repository.updateMany([user1.id, user2.id], { role: 'admin' })

      expect(results).toHaveLength(2)
      expect(results[0].role).toBe('admin')
      expect(results[1].role).toBe('admin')
    })
  })

  describe('deleteMany', () => {
    it('should delete multiple records', async () => {
      const user1 = await repository.createOne({ name: 'User 1' })
      const user2 = await repository.createOne({ name: 'User 2' })

      const result = await repository.deleteMany([user1.id, user2.id])

      expect(result).toBe(true)

      const remaining = await repository.getList({})
      expect(remaining.data).toHaveLength(0)
    })

    it('should return false if any deletion fails', async () => {
      const user1 = await repository.createOne({ name: 'User 1' })

      const result = await repository.deleteMany([user1.id, 'non-existent'])

      // 在当前实现中，non-existent 返回 false，所以整体返回 false
      expect(result).toBe(false)
    })
  })

  describe('clear', () => {
    it('should clear model data', async () => {
      await repository.createOne({ name: 'User 1' })
      await repository.createOne({ name: 'User 2' })

      repository.clear()

      const result = await repository.getList({})
      expect(result.data).toHaveLength(0)
    })
  })
})

describe('createMockRepository', () => {
  afterEach(() => {
    clearAllMockData()
  })

  it('should create repository with model name', () => {
    const repository = createMockRepository('Test')
    expect(repository).toBeInstanceOf(MockRepository)
  })
})

describe('clearAllMockData', () => {
  it('should clear all data across all models', async () => {
    const userRepo = createMockRepository('User')
    const postRepo = createMockRepository('Post')

    await userRepo.createOne({ name: 'User 1' })
    await postRepo.createOne({ title: 'Post 1' })

    clearAllMockData()

    const users = await userRepo.getList({})
    const posts = await postRepo.getList({})

    expect(users.data).toHaveLength(0)
    expect(posts.data).toHaveLength(0)
  })
})

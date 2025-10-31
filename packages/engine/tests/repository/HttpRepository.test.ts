/**
 * HttpRepository 测试
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import MockAdapter from 'axios-mock-adapter'
import { HttpClient } from '../../src/http/HttpClient'
import { createRestClient } from '../../src/http/RestClient'
import { HttpRepository, createHttpRepository } from '../../src/repository/HttpRepository'

describe('HttpRepository', () => {
  let httpClient: HttpClient
  let repository: HttpRepository
  let mockAdapter: MockAdapter

  beforeEach(() => {
    httpClient = new HttpClient({
      baseURL: 'https://api.example.com'
    })
    mockAdapter = new MockAdapter(httpClient.getAxiosInstance())

    const restClient = createRestClient({
      httpClient,
      resourcePath: '/users'
    })

    repository = new HttpRepository({ restClient })
  })

  afterEach(() => {
    mockAdapter.restore()
  })

  describe('getList', () => {
    it('should fetch a list of records', async () => {
      const responseData = {
        data: [
          { id: 1, name: 'User 1' },
          { id: 2, name: 'User 2' }
        ],
        total: 2,
        page: 1,
        pageSize: 10
      }

      mockAdapter.onGet('/users').reply(200, responseData)

      const result = await repository.getList()

      expect(result).toEqual(responseData)
    })

    it('should handle pagination', async () => {
      mockAdapter.onGet('/users').reply((config) => {
        expect(config.params.page).toBe(2)
        expect(config.params.pageSize).toBe(20)
        return [200, { data: [], total: 0 }]
      })

      await repository.getList({
        pagination: { page: 2, pageSize: 20 }
      })
    })
  })

  describe('getOne', () => {
    it('should fetch a single record', async () => {
      const userData = { id: 1, name: 'User 1' }
      mockAdapter.onGet('/users/1').reply(200, userData)

      const result = await repository.getOne(1)

      expect(result).toEqual(userData)
    })
  })

  describe('getMany', () => {
    it('should fetch multiple records', async () => {
      const usersData = [
        { id: 1, name: 'User 1' },
        { id: 2, name: 'User 2' }
      ]

      mockAdapter.onGet('/users').reply((config) => {
        expect(config.params.ids).toBe('1,2')
        return [200, usersData]
      })

      const result = await repository.getMany([1, 2])

      expect(result).toEqual(usersData)
    })
  })

  describe('createOne', () => {
    it('should create a single record', async () => {
      const newUser = { name: 'New User', email: 'new@example.com' }
      const createdUser = { id: 1, ...newUser }

      mockAdapter.onPost('/users').reply(201, createdUser)

      const result = await repository.createOne(newUser)

      expect(result).toEqual(createdUser)
    })
  })

  describe('createMany', () => {
    it('should create multiple records', async () => {
      const newUsers = [
        { name: 'User 1' },
        { name: 'User 2' }
      ]
      const createdUsers = [
        { id: 1, name: 'User 1' },
        { id: 2, name: 'User 2' }
      ]

      mockAdapter.onPost('/users/batch').reply(201, createdUsers)

      const result = await repository.createMany(newUsers)

      expect(result).toEqual(createdUsers)
    })
  })

  describe('updateOne', () => {
    it('should update a single record', async () => {
      const updateData = { name: 'Updated User' }
      const updatedUser = { id: 1, ...updateData }

      mockAdapter.onPut('/users/1').reply(200, updatedUser)

      const result = await repository.updateOne(1, updateData)

      expect(result).toEqual(updatedUser)
    })
  })

  describe('updateMany', () => {
    it('should update multiple records', async () => {
      const updateData = { status: 'active' }
      const updatedUsers = [
        { id: 1, status: 'active' },
        { id: 2, status: 'active' }
      ]

      mockAdapter.onPut('/users/batch').reply(200, updatedUsers)

      const result = await repository.updateMany([1, 2], updateData)

      expect(result).toEqual(updatedUsers)
    })
  })

  describe('deleteOne', () => {
    it('should delete a single record', async () => {
      mockAdapter.onDelete('/users/1').reply(204)

      const result = await repository.deleteOne(1)

      expect(result).toBe(true)
    })
  })

  describe('deleteMany', () => {
    it('should delete multiple records', async () => {
      mockAdapter.onDelete('/users/batch').reply(204)

      const result = await repository.deleteMany([1, 2, 3])

      expect(result).toBe(true)
    })
  })

  describe('clear', () => {
    it('should throw error when calling clear', () => {
      expect(() => repository.clear()).toThrow('HttpRepository.clear() is not supported')
    })
  })

  describe('Factory function', () => {
    it('should create HttpRepository using factory function', () => {
      const restClient = createRestClient({
        httpClient,
        resourcePath: '/posts'
      })

      const repo = createHttpRepository({ restClient })

      expect(repo).toBeInstanceOf(HttpRepository)
    })
  })

  describe('getRestClient', () => {
    it('should return rest client instance', () => {
      const client = repository.getRestClient()
      expect(client).toBeDefined()
      expect(client.getResourcePath()).toBe('/users')
    })
  })
})

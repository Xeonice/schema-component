/**
 * RestClient 测试
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import MockAdapter from 'axios-mock-adapter'
import { HttpClient } from '../../src/http/HttpClient'
import { RestClient, createRestClient } from '../../src/http/RestClient'

describe('RestClient', () => {
  let httpClient: HttpClient
  let restClient: RestClient
  let mockAdapter: MockAdapter

  beforeEach(() => {
    httpClient = new HttpClient({
      baseURL: 'https://api.example.com'
    })
    mockAdapter = new MockAdapter(httpClient.getAxiosInstance())
    restClient = new RestClient({
      httpClient,
      resourcePath: '/users'
    })
  })

  afterEach(() => {
    mockAdapter.restore()
  })

  describe('getList', () => {
    it('should fetch a list of resources', async () => {
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

      const result = await restClient.getList()

      expect(result).toEqual(responseData)
    })

    it('should handle pagination parameters', async () => {
      mockAdapter.onGet('/users').reply((config) => {
        expect(config.params).toEqual({ page: 2, pageSize: 20 })
        return [200, { data: [], total: 0 }]
      })

      await restClient.getList({
        pagination: { page: 2, pageSize: 20 }
      })
    })

    it('should handle sort parameters', async () => {
      mockAdapter.onGet('/users').reply((config) => {
        expect(config.params.sort).toBe('name:ASC,age:DESC')
        return [200, { data: [], total: 0 }]
      })

      await restClient.getList({
        sort: [
          { field: 'name', order: 'ASC' },
          { field: 'age', order: 'DESC' }
        ]
      })
    })

    it('should handle filter parameters', async () => {
      mockAdapter.onGet('/users').reply((config) => {
        expect(config.params.role).toBe('admin')
        expect(config.params.isActive).toBe(true)
        return [200, { data: [], total: 0 }]
      })

      await restClient.getList({
        filter: { role: 'admin', isActive: true }
      })
    })
  })

  describe('getOne', () => {
    it('should fetch a single resource', async () => {
      const userData = { id: 1, name: 'User 1' }
      mockAdapter.onGet('/users/1').reply(200, userData)

      const result = await restClient.getOne(1)

      expect(result).toEqual(userData)
    })

    it('should handle string IDs', async () => {
      const userData = { id: 'abc', name: 'User ABC' }
      mockAdapter.onGet('/users/abc').reply(200, userData)

      const result = await restClient.getOne('abc')

      expect(result).toEqual(userData)
    })
  })

  describe('getMany', () => {
    it('should fetch multiple resources', async () => {
      const usersData = [
        { id: 1, name: 'User 1' },
        { id: 2, name: 'User 2' }
      ]

      mockAdapter.onGet('/users').reply((config) => {
        expect(config.params.ids).toBe('1,2')
        return [200, usersData]
      })

      const result = await restClient.getMany([1, 2])

      expect(result).toEqual(usersData)
    })
  })

  describe('createOne', () => {
    it('should create a single resource', async () => {
      const newUser = { name: 'New User', email: 'new@example.com' }
      const createdUser = { id: 1, ...newUser }

      mockAdapter.onPost('/users').reply((config) => {
        expect(JSON.parse(config.data)).toEqual(newUser)
        return [201, createdUser]
      })

      const result = await restClient.createOne(newUser)

      expect(result).toEqual(createdUser)
    })
  })

  describe('createMany', () => {
    it('should create multiple resources', async () => {
      const newUsers = [
        { name: 'User 1' },
        { name: 'User 2' }
      ]
      const createdUsers = [
        { id: 1, name: 'User 1' },
        { id: 2, name: 'User 2' }
      ]

      mockAdapter.onPost('/users/batch').reply((config) => {
        expect(JSON.parse(config.data)).toEqual(newUsers)
        return [201, createdUsers]
      })

      const result = await restClient.createMany(newUsers)

      expect(result).toEqual(createdUsers)
    })
  })

  describe('updateOne', () => {
    it('should update a single resource', async () => {
      const updateData = { name: 'Updated User' }
      const updatedUser = { id: 1, ...updateData }

      mockAdapter.onPut('/users/1').reply((config) => {
        expect(JSON.parse(config.data)).toEqual(updateData)
        return [200, updatedUser]
      })

      const result = await restClient.updateOne(1, updateData)

      expect(result).toEqual(updatedUser)
    })
  })

  describe('patchOne', () => {
    it('should partially update a single resource', async () => {
      const patchData = { email: 'newemail@example.com' }
      const patchedUser = { id: 1, name: 'User', ...patchData }

      mockAdapter.onPatch('/users/1').reply((config) => {
        expect(JSON.parse(config.data)).toEqual(patchData)
        return [200, patchedUser]
      })

      const result = await restClient.patchOne(1, patchData)

      expect(result).toEqual(patchedUser)
    })
  })

  describe('updateMany', () => {
    it('should update multiple resources', async () => {
      const updateData = { status: 'active' }
      const updatedUsers = [
        { id: 1, status: 'active' },
        { id: 2, status: 'active' }
      ]

      mockAdapter.onPut('/users/batch').reply((config) => {
        const body = JSON.parse(config.data)
        expect(body.ids).toEqual([1, 2])
        expect(body.data).toEqual(updateData)
        return [200, updatedUsers]
      })

      const result = await restClient.updateMany([1, 2], updateData)

      expect(result).toEqual(updatedUsers)
    })
  })

  describe('deleteOne', () => {
    it('should delete a single resource', async () => {
      mockAdapter.onDelete('/users/1').reply(204)

      const result = await restClient.deleteOne(1)

      expect(result).toBe(true)
    })
  })

  describe('deleteMany', () => {
    it('should delete multiple resources', async () => {
      mockAdapter.onDelete('/users/batch').reply((config) => {
        const body = JSON.parse(config.data)
        expect(body.ids).toEqual([1, 2, 3])
        return [204]
      })

      const result = await restClient.deleteMany([1, 2, 3])

      expect(result).toBe(true)
    })
  })

  describe('Custom request', () => {
    it('should make a custom request', async () => {
      mockAdapter.onPost('/users/custom').reply(200, { success: true })

      const response = await restClient.request({
        url: '/users/custom',
        method: 'POST',
        data: { custom: 'data' }
      })

      expect(response.data).toEqual({ success: true })
    })
  })

  describe('Getters', () => {
    it('should get resource path', () => {
      expect(restClient.getResourcePath()).toBe('/users')
    })

    it('should get http client', () => {
      expect(restClient.getHttpClient()).toBe(httpClient)
    })
  })

  describe('Factory function', () => {
    it('should create RestClient using factory function', () => {
      const client = createRestClient({
        httpClient,
        resourcePath: '/posts'
      })

      expect(client).toBeDefined()
      expect(client.getResourcePath()).toBe('/posts')
    })
  })
})

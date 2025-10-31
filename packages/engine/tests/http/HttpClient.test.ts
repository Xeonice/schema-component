/**
 * HttpClient 测试
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import MockAdapter from 'axios-mock-adapter'
import { HttpClient, createHttpClient } from '../../src/http/HttpClient'
import type { IHttpClient } from '../../src/http/types'

describe('HttpClient', () => {
  let httpClient: HttpClient
  let mockAdapter: MockAdapter

  beforeEach(() => {
    httpClient = new HttpClient({
      baseURL: 'https://api.example.com',
      timeout: 5000
    })
    mockAdapter = new MockAdapter(httpClient.getAxiosInstance())
  })

  afterEach(() => {
    mockAdapter.restore()
  })

  describe('GET requests', () => {
    it('should make a GET request', async () => {
      const responseData = { id: 1, name: 'Test' }
      mockAdapter.onGet('/users/1').reply(200, responseData)

      const response = await httpClient.get('/users/1')

      expect(response.status).toBe(200)
      expect(response.data).toEqual(responseData)
    })

    it('should handle GET request with query params', async () => {
      const responseData = { data: [], total: 0 }
      mockAdapter.onGet('/users').reply((config) => {
        expect(config.params).toEqual({ page: 1, pageSize: 10 })
        return [200, responseData]
      })

      const response = await httpClient.get('/users', {
        params: { page: 1, pageSize: 10 }
      })

      expect(response.data).toEqual(responseData)
    })
  })

  describe('POST requests', () => {
    it('should make a POST request', async () => {
      const requestData = { name: 'New User', email: 'user@example.com' }
      const responseData = { id: 1, ...requestData }

      mockAdapter.onPost('/users').reply((config) => {
        expect(JSON.parse(config.data)).toEqual(requestData)
        return [201, responseData]
      })

      const response = await httpClient.post('/users', requestData)

      expect(response.status).toBe(201)
      expect(response.data).toEqual(responseData)
    })

    it('should handle POST request with custom headers', async () => {
      const responseData = { success: true }

      mockAdapter.onPost('/users').reply((config) => {
        expect(config.headers?.['X-Custom-Header']).toBe('custom-value')
        return [200, responseData]
      })

      const response = await httpClient.post('/users', {}, {
        headers: { 'X-Custom-Header': 'custom-value' }
      })

      expect(response.data).toEqual(responseData)
    })
  })

  describe('PUT requests', () => {
    it('should make a PUT request', async () => {
      const updateData = { name: 'Updated User' }
      const responseData = { id: 1, ...updateData }

      mockAdapter.onPut('/users/1').reply(200, responseData)

      const response = await httpClient.put('/users/1', updateData)

      expect(response.status).toBe(200)
      expect(response.data).toEqual(responseData)
    })
  })

  describe('PATCH requests', () => {
    it('should make a PATCH request', async () => {
      const patchData = { email: 'new@example.com' }
      const responseData = { id: 1, ...patchData }

      mockAdapter.onPatch('/users/1').reply(200, responseData)

      const response = await httpClient.patch('/users/1', patchData)

      expect(response.status).toBe(200)
      expect(response.data).toEqual(responseData)
    })
  })

  describe('DELETE requests', () => {
    it('should make a DELETE request', async () => {
      mockAdapter.onDelete('/users/1').reply(204)

      const response = await httpClient.delete('/users/1')

      expect(response.status).toBe(204)
    })
  })

  describe('Error handling', () => {
    it('should handle 404 errors', async () => {
      mockAdapter.onGet('/users/999').reply(404, {
        message: 'User not found'
      })

      try {
        await httpClient.get('/users/999')
        expect.fail('Should have thrown an error')
      } catch (error: any) {
        expect(error.response?.status).toBe(404)
        expect(error.response?.data.message).toBe('User not found')
      }
    })

    it('should handle 500 errors', async () => {
      mockAdapter.onPost('/users').reply(500, {
        message: 'Internal server error'
      })

      try {
        await httpClient.post('/users', {})
        expect.fail('Should have thrown an error')
      } catch (error: any) {
        expect(error.response?.status).toBe(500)
      }
    })

    it('should handle network errors', async () => {
      mockAdapter.onGet('/users').networkError()

      try {
        await httpClient.get('/users')
        expect.fail('Should have thrown an error')
      } catch (error: any) {
        expect(error.isNetworkError).toBe(true)
      }
    })

    it('should handle timeout errors', async () => {
      mockAdapter.onGet('/users').timeout()

      try {
        await httpClient.get('/users')
        expect.fail('Should have thrown an error')
      } catch (error: any) {
        expect(error.isTimeout).toBe(true)
      }
    })
  })

  describe('Interceptors', () => {
    it('should add request interceptor', async () => {
      let interceptorCalled = false

      httpClient.addRequestInterceptor((config) => {
        interceptorCalled = true
        config.headers = config.headers || {}
        config.headers['X-Test'] = 'test-value'
        return config
      })

      mockAdapter.onGet('/users').reply((config) => {
        expect(config.headers?.['X-Test']).toBe('test-value')
        return [200, {}]
      })

      await httpClient.get('/users')
      expect(interceptorCalled).toBe(true)
    })

    it('should add response interceptor', async () => {
      let interceptorCalled = false

      httpClient.addResponseInterceptor((response) => {
        interceptorCalled = true
        response.data = { modified: true, ...response.data }
        return response
      })

      mockAdapter.onGet('/users').reply(200, { original: true })

      const response = await httpClient.get('/users')
      expect(interceptorCalled).toBe(true)
      expect(response.data).toEqual({ modified: true, original: true })
    })

    it('should remove request interceptor', async () => {
      let interceptorCallCount = 0

      const id = httpClient.addRequestInterceptor((config) => {
        interceptorCallCount++
        return config
      })

      mockAdapter.onGet('/users').reply(200, {})

      await httpClient.get('/users')
      expect(interceptorCallCount).toBe(1)

      httpClient.removeRequestInterceptor(id)

      await httpClient.get('/users')
      expect(interceptorCallCount).toBe(1) // Should not increase
    })

    it('should remove response interceptor', async () => {
      let interceptorCallCount = 0

      const id = httpClient.addResponseInterceptor((response) => {
        interceptorCallCount++
        return response
      })

      mockAdapter.onGet('/users').reply(200, {})

      await httpClient.get('/users')
      expect(interceptorCallCount).toBe(1)

      httpClient.removeResponseInterceptor(id)

      await httpClient.get('/users')
      expect(interceptorCallCount).toBe(1) // Should not increase
    })
  })

  describe('Factory function', () => {
    it('should create HttpClient using factory function', () => {
      const client = createHttpClient({
        baseURL: 'https://test.com'
      })

      expect(client).toBeDefined()
      expect(client.get).toBeDefined()
      expect(client.post).toBeDefined()
    })
  })
})

/**
 * RepositoryFactory 测试
 */

import { describe, it, expect } from 'vitest'
import { RepositoryFactory, createRepository } from '../../src/repository/RepositoryFactory'
import { MockRepository } from '../../src/repository/mock'
import { HttpRepository } from '../../src/repository/HttpRepository'
import { createHttpClient } from '../../src/http/HttpClient'

describe('RepositoryFactory', () => {
  describe('create', () => {
    it('should create mock repository', () => {
      const repository = RepositoryFactory.create({
        type: 'mock',
        modelName: 'User'
      })

      expect(repository).toBeInstanceOf(MockRepository)
    })

    it('should create http repository', () => {
      const httpClient = createHttpClient({
        baseURL: 'https://api.example.com'
      })

      const repository = RepositoryFactory.create({
        type: 'http',
        modelName: 'User',
        http: {
          httpClient,
          resourcePath: '/users'
        }
      })

      expect(repository).toBeInstanceOf(HttpRepository)
    })

    it('should throw error for unknown repository type', () => {
      expect(() => {
        RepositoryFactory.create({
          type: 'unknown' as any,
          modelName: 'User'
        })
      }).toThrow('Unknown repository type')
    })

    it('should throw error when http config is missing', () => {
      expect(() => {
        RepositoryFactory.create({
          type: 'http',
          modelName: 'User'
        })
      }).toThrow('HTTP configuration is required')
    })
  })

  describe('createMock', () => {
    it('should create mock repository using factory method', () => {
      const repository = RepositoryFactory.createMock('User')

      expect(repository).toBeInstanceOf(MockRepository)
    })
  })

  describe('createHttp', () => {
    it('should create http repository using factory method', () => {
      const httpClient = createHttpClient({
        baseURL: 'https://api.example.com'
      })

      const repository = RepositoryFactory.createHttp(httpClient, '/users')

      expect(repository).toBeInstanceOf(HttpRepository)
    })
  })

  describe('Helper function', () => {
    it('should create repository using helper function', () => {
      const repository = createRepository({
        type: 'mock',
        modelName: 'User'
      })

      expect(repository).toBeInstanceOf(MockRepository)
    })
  })
})

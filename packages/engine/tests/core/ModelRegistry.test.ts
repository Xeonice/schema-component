/**
 * ModelRegistry 测试
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { defineModel } from '../../src/core/defineModel'
import { ModelRegistry, getModelRegistry, registerModel, getModel, hasModel } from '../../src/core/ModelRegistry'

describe('ModelRegistry', () => {
  let registry: ModelRegistry

  beforeEach(() => {
    registry = ModelRegistry.getInstance()
    registry.clear()
  })

  afterEach(() => {
    registry.clear()
  })

  it('should be a singleton', () => {
    const instance1 = ModelRegistry.getInstance()
    const instance2 = ModelRegistry.getInstance()
    expect(instance1).toBe(instance2)
  })

  it('should register a model', () => {
    const model = defineModel({
      name: 'User',
      schema: {}
    })

    registry.register(model)

    expect(registry.has('User')).toBe(true)
    expect(registry.get('User')).toBe(model)
  })

  it('should throw error when registering duplicate model', () => {
    const model1 = defineModel({
      name: 'User',
      schema: {}
    })

    const model2 = defineModel({
      name: 'User',
      schema: {}
    })

    registry.register(model1)

    expect(() => {
      registry.register(model2)
    }).toThrow('Model "User" is already registered')
  })

  it('should get registered model', () => {
    const model = defineModel({
      name: 'User',
      schema: {}
    })

    registry.register(model)

    const retrieved = registry.get('User')
    expect(retrieved).toBe(model)
  })

  it('should return undefined for non-existent model', () => {
    const retrieved = registry.get('NonExistent')
    expect(retrieved).toBeUndefined()
  })

  it('should check if model exists', () => {
    const model = defineModel({
      name: 'User',
      schema: {}
    })

    expect(registry.has('User')).toBe(false)

    registry.register(model)

    expect(registry.has('User')).toBe(true)
  })

  it('should unregister model', () => {
    const model = defineModel({
      name: 'User',
      schema: {}
    })

    registry.register(model)
    expect(registry.has('User')).toBe(true)

    const result = registry.unregister('User')
    expect(result).toBe(true)
    expect(registry.has('User')).toBe(false)
  })

  it('should return false when unregistering non-existent model', () => {
    const result = registry.unregister('NonExistent')
    expect(result).toBe(false)
  })

  it('should get all models', () => {
    const user = defineModel({ name: 'User', schema: {} })
    const post = defineModel({ name: 'Post', schema: {} })

    registry.register(user)
    registry.register(post)

    const all = registry.getAll()
    expect(all).toHaveLength(2)
    expect(all).toContain(user)
    expect(all).toContain(post)
  })

  it('should get all model names', () => {
    const user = defineModel({ name: 'User', schema: {} })
    const post = defineModel({ name: 'Post', schema: {} })

    registry.register(user)
    registry.register(post)

    const names = registry.getAllNames()
    expect(names).toHaveLength(2)
    expect(names).toContain('User')
    expect(names).toContain('Post')
  })

  it('should get model count', () => {
    expect(registry.count()).toBe(0)

    const user = defineModel({ name: 'User', schema: {} })
    registry.register(user)

    expect(registry.count()).toBe(1)

    const post = defineModel({ name: 'Post', schema: {} })
    registry.register(post)

    expect(registry.count()).toBe(2)
  })

  it('should clear all models', () => {
    const user = defineModel({ name: 'User', schema: {} })
    const post = defineModel({ name: 'Post', schema: {} })

    registry.register(user)
    registry.register(post)

    expect(registry.count()).toBe(2)

    registry.clear()

    expect(registry.count()).toBe(0)
    expect(registry.has('User')).toBe(false)
    expect(registry.has('Post')).toBe(false)
  })

  it('should register many models at once', () => {
    const user = defineModel({ name: 'User', schema: {} })
    const post = defineModel({ name: 'Post', schema: {} })
    const comment = defineModel({ name: 'Comment', schema: {} })

    registry.registerMany([user, post, comment])

    expect(registry.count()).toBe(3)
    expect(registry.has('User')).toBe(true)
    expect(registry.has('Post')).toBe(true)
    expect(registry.has('Comment')).toBe(true)
  })

  it('should find models by predicate', () => {
    const user = defineModel({
      name: 'User',
      schema: {},
      actions: { activate: async () => {} }
    })

    const post = defineModel({
      name: 'Post',
      schema: {}
    })

    registry.register(user)
    registry.register(post)

    const modelsWithActions = registry.find(m => Object.keys(m.actions).length > 0)

    expect(modelsWithActions).toHaveLength(1)
    expect(modelsWithActions[0]).toBe(user)
  })

  it('should find first model by predicate', () => {
    const user = defineModel({ name: 'User', schema: {} })
    const post = defineModel({ name: 'Post', schema: {} })

    registry.register(user)
    registry.register(post)

    const found = registry.findOne(m => m.name === 'Post')

    expect(found).toBe(post)
  })

  it('should return undefined if findOne does not match', () => {
    const user = defineModel({ name: 'User', schema: {} })
    registry.register(user)

    const found = registry.findOne(m => m.name === 'NonExistent')

    expect(found).toBeUndefined()
  })
})

describe('Helper functions', () => {
  beforeEach(() => {
    getModelRegistry().clear()
  })

  afterEach(() => {
    getModelRegistry().clear()
  })

  it('getModelRegistry should return singleton', () => {
    const registry1 = getModelRegistry()
    const registry2 = getModelRegistry()
    expect(registry1).toBe(registry2)
  })

  it('registerModel should register model', () => {
    const model = defineModel({ name: 'User', schema: {} })
    registerModel(model)

    expect(hasModel('User')).toBe(true)
  })

  it('getModel should retrieve model', () => {
    const model = defineModel({ name: 'User', schema: {} })
    registerModel(model)

    const retrieved = getModel('User')
    expect(retrieved).toBe(model)
  })

  it('hasModel should check existence', () => {
    expect(hasModel('User')).toBe(false)

    const model = defineModel({ name: 'User', schema: {} })
    registerModel(model)

    expect(hasModel('User')).toBe(true)
  })
})

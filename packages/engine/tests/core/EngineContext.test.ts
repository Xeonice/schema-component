/**
 * EngineContext 测试
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { createEngineContext, EngineContext } from '../../src/core/EngineContext'
import { TYPES } from '../../src/di/types'

describe('EngineContext', () => {
  let context: EngineContext

  beforeEach(() => {
    context = createEngineContext({
      debug: true,
      apiBaseUrl: 'https://api.example.com'
    })
  })

  it('should create engine context with default config', () => {
    const ctx = createEngineContext()
    expect(ctx).toBeInstanceOf(EngineContext)
    expect(ctx.config.debug).toBe(false)
    expect(ctx.config.defaultPageSize).toBe(20)
    expect(ctx.config.timeout).toBe(30000)
  })

  it('should create engine context with custom config', () => {
    expect(context.config.debug).toBe(true)
    expect(context.config.apiBaseUrl).toBe('https://api.example.com')
  })

  it('should have container', () => {
    expect(context.container).toBeDefined()
  })

  it('should have event bus', () => {
    const eventBus = context.getEventBus()
    expect(eventBus).toBeDefined()
  })

  it('should bind and get services', () => {
    class TestService {
      getName() {
        return 'test'
      }
    }

    const TEST_TYPE = Symbol.for('TestService')
    context.bind(TEST_TYPE, TestService)

    const service = context.get<TestService>(TEST_TYPE)
    expect(service).toBeInstanceOf(TestService)
    expect(service.getName()).toBe('test')
  })

  it('should bind constant value', () => {
    const TEST_TYPE = Symbol.for('TestConstant')
    context.bindConstant(TEST_TYPE, { value: 'test' })

    const constant = context.get<{ value: string }>(TEST_TYPE)
    expect(constant.value).toBe('test')
  })

  it('should tryGet return undefined for unbound service', () => {
    const UNKNOWN_TYPE = Symbol.for('UnknownService')
    const service = context.tryGet(UNKNOWN_TYPE)
    expect(service).toBeUndefined()
  })

  it('should get and set config', () => {
    context.setConfig('customKey', 'customValue')
    expect(context.getConfig('customKey')).toBe('customValue')
    expect(context.getConfig('nonExistent', 'default')).toBe('default')
  })

  it('should initialize engine', async () => {
    expect(context.isInitialized()).toBe(false)
    await context.initialize()
    expect(context.isInitialized()).toBe(true)
  })

  it('should not initialize twice', async () => {
    await context.initialize()
    expect(context.isInitialized()).toBe(true)

    // 应该不会报错，只是警告
    await context.initialize()
    expect(context.isInitialized()).toBe(true)
  })

  it('should destroy engine', async () => {
    await context.initialize()
    expect(context.isInitialized()).toBe(true)

    await context.destroy()
    expect(context.isInitialized()).toBe(false)
  })

  it('should have EventBus bound in container', () => {
    const eventBus = context.get(TYPES.EventBus)
    expect(eventBus).toBeDefined()
  })
})

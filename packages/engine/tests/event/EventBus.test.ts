/**
 * EventBus 测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { EventBus, getEventBus, createEventBus } from '../../src/event/EventBus'
import { EventType } from '../../src/event/types'
import type { IEvent } from '../../src/event/types'

describe('EventBus', () => {
  let eventBus: EventBus

  beforeEach(() => {
    eventBus = createEventBus()
  })

  it('should create event bus', () => {
    expect(eventBus).toBeInstanceOf(EventBus)
  })

  it('should get singleton instance', () => {
    const instance1 = getEventBus()
    const instance2 = getEventBus()
    expect(instance1).toBe(instance2)
  })

  it('should publish and subscribe events', () => {
    const handler = vi.fn()

    eventBus.subscribe('test:event', handler)

    const event: IEvent = {
      type: 'test:event',
      payload: { data: 'test' },
      timestamp: Date.now()
    }

    eventBus.publish(event)

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenCalledWith(event)
  })

  it('should unsubscribe events', () => {
    const handler = vi.fn()

    const unsubscribe = eventBus.subscribe('test:event', handler)

    const event: IEvent = {
      type: 'test:event',
      payload: {},
      timestamp: Date.now()
    }

    eventBus.publish(event)
    expect(handler).toHaveBeenCalledTimes(1)

    unsubscribe()

    eventBus.publish(event)
    expect(handler).toHaveBeenCalledTimes(1) // 仍然是 1 次
  })

  it('should subscribe once', () => {
    const handler = vi.fn()

    eventBus.subscribeOnce('test:event', handler)

    const event: IEvent = {
      type: 'test:event',
      payload: {},
      timestamp: Date.now()
    }

    eventBus.publish(event)
    expect(handler).toHaveBeenCalledTimes(1)

    eventBus.publish(event)
    expect(handler).toHaveBeenCalledTimes(1) // 仍然是 1 次
  })

  it('should support multiple subscribers', () => {
    const handler1 = vi.fn()
    const handler2 = vi.fn()

    eventBus.subscribe('test:event', handler1)
    eventBus.subscribe('test:event', handler2)

    const event: IEvent = {
      type: 'test:event',
      payload: {},
      timestamp: Date.now()
    }

    eventBus.publish(event)

    expect(handler1).toHaveBeenCalledTimes(1)
    expect(handler2).toHaveBeenCalledTimes(1)
  })

  it('should unsubscribe specific handler', () => {
    const handler1 = vi.fn()
    const handler2 = vi.fn()

    eventBus.subscribe('test:event', handler1)
    eventBus.subscribe('test:event', handler2)

    const event: IEvent = {
      type: 'test:event',
      payload: {},
      timestamp: Date.now()
    }

    eventBus.publish(event)
    expect(handler1).toHaveBeenCalledTimes(1)
    expect(handler2).toHaveBeenCalledTimes(1)

    eventBus.unsubscribe('test:event', handler1)

    eventBus.publish(event)
    expect(handler1).toHaveBeenCalledTimes(1) // 仍然是 1 次
    expect(handler2).toHaveBeenCalledTimes(2) // 增加到 2 次
  })

  it('should unsubscribe all handlers for event type', () => {
    const handler1 = vi.fn()
    const handler2 = vi.fn()

    eventBus.subscribe('test:event', handler1)
    eventBus.subscribe('test:event', handler2)

    eventBus.unsubscribe('test:event')

    const event: IEvent = {
      type: 'test:event',
      payload: {},
      timestamp: Date.now()
    }

    eventBus.publish(event)

    expect(handler1).not.toHaveBeenCalled()
    expect(handler2).not.toHaveBeenCalled()
  })

  it('should clear all subscriptions', () => {
    const handler1 = vi.fn()
    const handler2 = vi.fn()

    eventBus.subscribe('event1', handler1)
    eventBus.subscribe('event2', handler2)

    eventBus.clear()

    eventBus.publish({ type: 'event1', payload: {}, timestamp: Date.now() })
    eventBus.publish({ type: 'event2', payload: {}, timestamp: Date.now() })

    expect(handler1).not.toHaveBeenCalled()
    expect(handler2).not.toHaveBeenCalled()
  })

  it('should get listener count', () => {
    const handler1 = vi.fn()
    const handler2 = vi.fn()

    expect(eventBus.listenerCount('test:event')).toBe(0)

    eventBus.subscribe('test:event', handler1)
    expect(eventBus.listenerCount('test:event')).toBe(1)

    eventBus.subscribe('test:event', handler2)
    expect(eventBus.listenerCount('test:event')).toBe(2)

    eventBus.unsubscribe('test:event', handler1)
    expect(eventBus.listenerCount('test:event')).toBe(1)
  })

  it('should check if has listeners', () => {
    expect(eventBus.hasListeners('test:event')).toBe(false)

    const handler = vi.fn()
    eventBus.subscribe('test:event', handler)

    expect(eventBus.hasListeners('test:event')).toBe(true)

    eventBus.unsubscribe('test:event', handler)

    expect(eventBus.hasListeners('test:event')).toBe(false)
  })

  it('should work with EventType enum', () => {
    const handler = vi.fn()

    eventBus.subscribe(EventType.MODEL_AFTER_CREATE, handler)

    const event: IEvent = {
      type: EventType.MODEL_AFTER_CREATE,
      payload: { id: '123' },
      timestamp: Date.now()
    }

    eventBus.publish(event)

    expect(handler).toHaveBeenCalledWith(event)
  })

  it('should support async handlers', async () => {
    const handler = vi.fn(async (event: IEvent) => {
      await new Promise(resolve => setTimeout(resolve, 10))
      return event.payload
    })

    eventBus.subscribe('test:event', handler)

    const event: IEvent = {
      type: 'test:event',
      payload: { data: 'async' },
      timestamp: Date.now()
    }

    eventBus.publish(event)

    // 等待异步处理
    await new Promise(resolve => setTimeout(resolve, 20))

    expect(handler).toHaveBeenCalledWith(event)
  })
})

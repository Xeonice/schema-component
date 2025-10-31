/**
 * Event Bus implementation
 * 基于 EventEmitter3 的事件总线
 */

import EventEmitter from 'eventemitter3'
import type { IEvent, EventHandler, Unsubscribe } from './types'

/**
 * 事件总线类
 * 提供发布/订阅事件的功能
 */
export class EventBus extends EventEmitter {
  private static instance: EventBus

  /**
   * 获取单例实例
   */
  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus()
    }
    return EventBus.instance
  }

  /**
   * 发布事件
   * @param event 事件对象
   */
  publish<T = any>(event: IEvent<T>): void {
    this.emit(event.type, event)
  }

  /**
   * 订阅事件
   * @param eventType 事件类型
   * @param handler 事件处理器
   * @returns 取消订阅函数
   */
  subscribe<T = any>(eventType: string, handler: EventHandler<T>): Unsubscribe {
    this.on(eventType, handler as any)

    // 返回取消订阅函数
    return () => this.off(eventType, handler as any)
  }

  /**
   * 订阅事件（仅一次）
   * @param eventType 事件类型
   * @param handler 事件处理器
   */
  subscribeOnce<T = any>(eventType: string, handler: EventHandler<T>): void {
    this.once(eventType, handler as any)
  }

  /**
   * 取消订阅
   * @param eventType 事件类型
   * @param handler 事件处理器（可选，不传则取消该类型的所有订阅）
   */
  unsubscribe<T = any>(eventType: string, handler?: EventHandler<T>): void {
    if (handler) {
      this.off(eventType, handler as any)
    } else {
      this.removeAllListeners(eventType)
    }
  }

  /**
   * 清空所有订阅
   */
  clear(): void {
    this.removeAllListeners()
  }

  /**
   * 获取事件监听器数量
   * @param eventType 事件类型
   * @returns 监听器数量
   */
  listenerCount(eventType: string): number {
    return super.listenerCount(eventType)
  }

  /**
   * 检查是否有订阅者
   * @param eventType 事件类型
   * @returns 是否有订阅者
   */
  hasListeners(eventType: string): boolean {
    return this.listenerCount(eventType) > 0
  }
}

/**
 * 获取全局事件总线实例
 */
export function getEventBus(): EventBus {
  return EventBus.getInstance()
}

/**
 * 创建新的事件总线实例
 */
export function createEventBus(): EventBus {
  return new EventBus()
}

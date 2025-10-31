/**
 * Event system types
 */

/**
 * 事件类型枚举
 */
export enum EventType {
  // ========== Model Events ==========
  MODEL_BEFORE_CREATE = 'model:before:create',
  MODEL_AFTER_CREATE = 'model:after:create',
  MODEL_BEFORE_UPDATE = 'model:before:update',
  MODEL_AFTER_UPDATE = 'model:after:update',
  MODEL_BEFORE_DELETE = 'model:before:delete',
  MODEL_AFTER_DELETE = 'model:after:delete',
  MODEL_BEFORE_READ = 'model:before:read',
  MODEL_AFTER_READ = 'model:after:read',

  // ========== View Events ==========
  VIEW_MOUNTED = 'view:mounted',
  VIEW_UNMOUNTED = 'view:unmounted',
  VIEW_UPDATED = 'view:updated',
  VIEW_RENDERED = 'view:rendered',

  // ========== Action Events ==========
  ACTION_BEFORE_EXECUTE = 'action:before:execute',
  ACTION_EXECUTED = 'action:executed',
  ACTION_FAILED = 'action:failed',

  // ========== State Events ==========
  STATE_CHANGED = 'state:changed',
  STATE_INITIALIZED = 'state:initialized',
  STATE_RESET = 'state:reset',

  // ========== Custom ==========
  CUSTOM = 'custom'
}

/**
 * 事件接口
 */
export interface IEvent<T = any> {
  /** 事件类型 */
  type: EventType | string

  /** 事件负载数据 */
  payload: T

  /** 事件时间戳 */
  timestamp: number

  /** 事件来源 */
  source?: string

  /** 事件元数据 */
  metadata?: Record<string, any>
}

/**
 * 事件处理器类型
 */
export type EventHandler<T = any> = (event: IEvent<T>) => void | Promise<void>

/**
 * 取消订阅函数类型
 */
export type Unsubscribe = () => void

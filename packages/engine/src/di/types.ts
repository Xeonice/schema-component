/**
 * Dependency Injection type identifiers
 */

/**
 * DI 容器的类型标识符
 * 使用 Symbol.for() 确保全局唯一性
 */
export const TYPES = {
  // ========== Core ==========
  Model: Symbol.for('Model'),
  ModelRegistry: Symbol.for('ModelRegistry'),
  ModelExecutor: Symbol.for('ModelExecutor'),

  // ========== Data Access ==========
  DataAccessClient: Symbol.for('DataAccessClient'),
  HttpClient: Symbol.for('HttpClient'),
  UrlMapper: Symbol.for('UrlMapper'),

  // ========== Repository ==========
  Repository: Symbol.for('Repository'),
  Cache: Symbol.for('Cache'),
  CacheStrategy: Symbol.for('CacheStrategy'),

  // ========== State ==========
  RootStore: Symbol.for('RootStore'),
  ModelStore: Symbol.for('ModelStore'),
  ViewStore: Symbol.for('ViewStore'),

  // ========== Event ==========
  EventBus: Symbol.for('EventBus'),

  // ========== Render ==========
  RenderRegistry: Symbol.for('RenderRegistry'),
  DataRenderer: Symbol.for('DataRenderer'),
  ViewRenderer: Symbol.for('ViewRenderer'),

  // ========== Utils ==========
  Logger: Symbol.for('Logger'),
  Validator: Symbol.for('Validator'),
  Transformer: Symbol.for('Transformer')
} as const

/**
 * 获取所有类型标识符的类型
 */
export type TypeIdentifier = typeof TYPES[keyof typeof TYPES]

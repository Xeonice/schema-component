/**
 * @schema-component/engine
 *
 * A framework-agnostic data engine with DDD principles
 * 基于 DDD 原则的框架无关数据引擎
 */

// ============================================================================
// Core
// ============================================================================
export * from './core'

// ============================================================================
// DI (Dependency Injection) - 使用具名导出避免冲突
// ============================================================================
export { Container, createContainer } from './di/Container'
export { TYPES } from './di/types'
export type { TypeIdentifier } from './di/types'
export {
  injectable,
  inject,
  optional,
  named,
  Model,
  Field,
  Hook,
  Action,
  Method,
  getModelFields,
  getModelHooks,
  getModelMethods
} from './di/decorators'
// 注意：getModelName 和 getModelActions 从 core 模块导出，避免冲突

// ============================================================================
// Event
// ============================================================================
export * from './event'

// ============================================================================
// Repository
// ============================================================================
export * from './repository'

// ============================================================================
// HTTP (Data Access Layer)
// ============================================================================
export * from './http'

// ============================================================================
// State (MobX)
// ============================================================================
export * from './state'

// ============================================================================
// Render - 使用具名导出避免 ViewType 冲突
// ============================================================================
// Core Types
export type {
  RenderDescriptor,
  RenderContext,
  IModalController,
  IDrawerController,
  IMessageController,
  ModalConfig,
  DrawerConfig,
  IRenderer,
  RendererCategory,
  GroupDefinition,
  FieldDefinition,
  DataDefinition,
  FieldRenderData,
  FieldRenderContext,
  BatchRenderData,
  IGroupRenderer,
  IFieldRenderer
} from './render/types'

// Data Renderer Types
export type {
  FieldDefinition as DataFieldDefinition,
  IDataRenderer
} from './render/dataTypes'

// View Renderer Types - 重命名避免冲突
export type {
  ViewType as RenderViewType,
  ViewDefinition as RenderViewDefinition,
  ColumnDefinition,
  IViewRenderer
} from './render/viewTypes'

// Action Renderer Types
export type {
  ActionType,
  BaseActionDefinition,
  ServerActionDefinition,
  ViewActionDefinition,
  ActionDefinition,
  IActionRenderer
} from './render/actionTypes'

// ViewStack
export {
  ViewStack,
  type IViewStack,
  type ViewStackItem
} from './render/ViewStack'

// ActionQueue
export {
  ActionQueue,
  type IActionQueue,
  type ActionTask,
  type ActionStatus,
  type ActionQueueConfig
} from './render/ActionQueue'

// RendererRegistry
export {
  RendererRegistry
} from './render/RendererRegistry'

// RenderEngine
export {
  RenderEngine,
  type RenderEngineConfig
} from './render/RenderEngine'

// ============================================================================
// Version
// ============================================================================
export const VERSION = '0.1.0'

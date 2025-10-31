/**
 * Dependency Injection decorators
 */

import { injectable, inject, optional, named } from 'inversify'
import 'reflect-metadata'

// ============================================================================
// Re-export InversifyJS decorators
// ============================================================================

/**
 * 标记类可以被注入
 * @decorator
 */
export { injectable }

/**
 * 注入依赖
 * @decorator
 */
export { inject }

/**
 * 可选注入（如果不存在不会报错）
 * @decorator
 */
export { optional }

/**
 * 命名注入（用于多个同类型的绑定）
 * @decorator
 */
export { named }

// ============================================================================
// Custom decorators
// ============================================================================

/**
 * Model 装饰器
 * 用于标记 Model 类并自动注册
 *
 * @param name Model 名称
 * @returns 类装饰器
 *
 * @example
 * ```typescript
 * @Model('User')
 * class UserModel extends BaseModel {
 *   // ...
 * }
 * ```
 */
export function Model(name: string) {
  return function <T extends { new(...args: any[]): {} }>(target: T) {
    // 存储 Model 名称到元数据
    Reflect.defineMetadata('model:name', name, target)

    // 标记为可注入
    injectable()(target)

    return target
  }
}

/**
 * Field 装饰器
 * 用于标记 Model 字段
 *
 * @param options 字段选项
 * @returns 属性装饰器
 *
 * @example
 * ```typescript
 * class UserModel {
 *   @Field({ type: 'string', required: true })
 *   email: string
 * }
 * ```
 */
export function Field(options?: Record<string, any>) {
  return function (target: any, propertyKey: string) {
    // 存储字段元数据
    const fields = Reflect.getMetadata('model:fields', target.constructor) || {}
    fields[propertyKey] = {
      name: propertyKey,
      ...options
    }
    Reflect.defineMetadata('model:fields', fields, target.constructor)
  }
}

/**
 * Hook 装饰器
 * 用于标记生命周期钩子方法
 *
 * @param hookName 钩子名称
 * @returns 方法装饰器
 *
 * @example
 * ```typescript
 * class UserModel {
 *   @Hook('beforeCreate')
 *   async hashPassword(data: any) {
 *     // ...
 *   }
 * }
 * ```
 */
export function Hook(hookName: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    // 存储钩子元数据
    const hooks = Reflect.getMetadata('model:hooks', target.constructor) || {}
    hooks[hookName] = propertyKey
    Reflect.defineMetadata('model:hooks', hooks, target.constructor)

    return descriptor
  }
}

/**
 * Action 装饰器
 * 用于标记 Action 方法
 *
 * @param actionName Action 名称（可选，默认使用方法名）
 * @returns 方法装饰器
 *
 * @example
 * ```typescript
 * class UserModel {
 *   @Action()
 *   async activate(params: { id: string }) {
 *     // ...
 *   }
 * }
 * ```
 */
export function Action(actionName?: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    // 存储 Action 元数据
    const actions = Reflect.getMetadata('model:actions', target.constructor) || {}
    actions[actionName || propertyKey] = propertyKey
    Reflect.defineMetadata('model:actions', actions, target.constructor)

    return descriptor
  }
}

/**
 * Method 装饰器
 * 用于标记自定义方法
 *
 * @param methodName 方法名称（可选，默认使用方法名）
 * @returns 方法装饰器
 *
 * @example
 * ```typescript
 * class UserModel {
 *   @Method()
 *   async resetPassword(id: string) {
 *     // ...
 *   }
 * }
 * ```
 */
export function Method(methodName?: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    // 存储 Method 元数据
    const methods = Reflect.getMetadata('model:methods', target.constructor) || {}
    methods[methodName || propertyKey] = propertyKey
    Reflect.defineMetadata('model:methods', methods, target.constructor)

    return descriptor
  }
}

// ============================================================================
// Metadata helpers
// ============================================================================

/**
 * 获取 Model 名称
 */
export function getModelName(target: any): string | undefined {
  return Reflect.getMetadata('model:name', target)
}

/**
 * 获取 Model 字段
 */
export function getModelFields(target: any): Record<string, any> | undefined {
  return Reflect.getMetadata('model:fields', target)
}

/**
 * 获取 Model 钩子
 */
export function getModelHooks(target: any): Record<string, string> | undefined {
  return Reflect.getMetadata('model:hooks', target)
}

/**
 * 获取 Model Actions
 */
export function getModelActions(target: any): Record<string, string> | undefined {
  return Reflect.getMetadata('model:actions', target)
}

/**
 * 获取 Model Methods
 */
export function getModelMethods(target: any): Record<string, string> | undefined {
  return Reflect.getMetadata('model:methods', target)
}

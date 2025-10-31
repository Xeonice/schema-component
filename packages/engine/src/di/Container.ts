/**
 * Dependency Injection Container
 * 基于 InversifyJS 的封装
 */

import { Container as InversifyContainer } from 'inversify'
import 'reflect-metadata'

/**
 * DI 容器类
 * 封装 InversifyJS 容器，提供更简洁的 API
 */
export class Container {
  private container: InversifyContainer

  constructor() {
    this.container = new InversifyContainer({
      defaultScope: 'Singleton',
      skipBaseClassChecks: true
    })
  }

  /**
   * 绑定类型到实现
   * @param identifier 类型标识符
   * @returns 绑定构建器
   */
  bind<T>(identifier: symbol) {
    return this.container.bind<T>(identifier)
  }

  /**
   * 获取服务实例
   * @param identifier 类型标识符
   * @returns 服务实例
   */
  get<T>(identifier: symbol): T {
    return this.container.get<T>(identifier)
  }

  /**
   * 根据名称获取服务实例
   * @param identifier 类型标识符
   * @param named 名称
   * @returns 服务实例
   */
  getNamed<T>(identifier: symbol, named: string): T {
    return this.container.getNamed<T>(identifier, named)
  }

  /**
   * 检查是否已绑定
   * @param identifier 类型标识符
   * @returns 是否已绑定
   */
  isBound(identifier: symbol): boolean {
    return this.container.isBound(identifier)
  }

  /**
   * 解绑类型
   * @param identifier 类型标识符
   */
  unbind(identifier: symbol): void {
    this.container.unbind(identifier)
  }

  /**
   * 重新绑定类型
   * @param identifier 类型标识符
   * @returns 绑定构建器
   */
  rebind<T>(identifier: symbol) {
    return this.container.rebind<T>(identifier)
  }

  /**
   * 解析类型（尝试获取，如果不存在则返回 undefined）
   * @param identifier 类型标识符
   * @returns 服务实例或 undefined
   */
  tryGet<T>(identifier: symbol): T | undefined {
    try {
      return this.container.get<T>(identifier)
    } catch {
      return undefined
    }
  }

  /**
   * 清空容器
   */
  clear(): void {
    this.container.unbindAll()
  }

  /**
   * 创建子容器
   * @returns 新的容器实例
   */
  createChild(): Container {
    const childContainer = new Container()
    childContainer.container = this.container.createChild()
    return childContainer
  }

  /**
   * 获取原始的 InversifyContainer 实例（高级用法）
   */
  getInversifyContainer(): InversifyContainer {
    return this.container
  }
}

/**
 * 创建新的 DI 容器实例
 * @returns 容器实例
 */
export function createContainer(): Container {
  return new Container()
}

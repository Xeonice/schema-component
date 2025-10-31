/**
 * Engine Context
 * 提供引擎的全局上下文和配置
 */

import { Container } from '../di/Container'
import { TYPES } from '../di/types'
import { getEventBus, EventBus } from '../event/EventBus'

/**
 * Engine 配置接口
 */
export interface EngineConfig {
  /** API 基础 URL */
  apiBaseUrl?: string

  /** 是否启用调试模式 */
  debug?: boolean

  /** 默认分页大小 */
  defaultPageSize?: number

  /** 请求超时时间（毫秒） */
  timeout?: number

  /** 自定义配置 */
  [key: string]: any
}

/**
 * Engine 上下文类
 * 管理整个引擎的生命周期和依赖
 */
export class EngineContext {
  public readonly container: Container
  public readonly config: EngineConfig
  private eventBus: EventBus
  private initialized: boolean = false

  constructor(container: Container, config: EngineConfig = {}) {
    this.container = container
    this.config = {
      debug: false,
      defaultPageSize: 20,
      timeout: 30000,
      ...config
    }

    // 初始化事件总线
    this.eventBus = getEventBus()

    // 注册核心服务
    this.registerCoreServices()
  }

  /**
   * 注册核心服务到 DI 容器
   */
  private registerCoreServices(): void {
    // 注册 EventBus
    if (!this.container.isBound(TYPES.EventBus)) {
      this.container.bind(TYPES.EventBus).toConstantValue(this.eventBus)
    }
  }

  /**
   * 从容器中获取服务
   * @param identifier 类型标识符
   * @returns 服务实例
   */
  get<T>(identifier: symbol): T {
    return this.container.get<T>(identifier)
  }

  /**
   * 尝试从容器中获取服务（不存在不会报错）
   * @param identifier 类型标识符
   * @returns 服务实例或 undefined
   */
  tryGet<T>(identifier: symbol): T | undefined {
    return this.container.tryGet<T>(identifier)
  }

  /**
   * 绑定服务到容器
   * @param identifier 类型标识符
   * @param implementation 实现类或实例
   */
  bind<T>(identifier: symbol, implementation: any): void {
    if (this.container.isBound(identifier)) {
      this.container.rebind<T>(identifier).to(implementation)
    } else {
      this.container.bind<T>(identifier).to(implementation)
    }
  }

  /**
   * 绑定常量值到容器
   * @param identifier 类型标识符
   * @param value 常量值
   */
  bindConstant<T>(identifier: symbol, value: T): void {
    if (this.container.isBound(identifier)) {
      this.container.rebind<T>(identifier).toConstantValue(value)
    } else {
      this.container.bind<T>(identifier).toConstantValue(value)
    }
  }

  /**
   * 注册 Model
   * @param model Model 实例
   */
  registerModel(model: any): void {
    const { registerModel: register } = require('./ModelRegistry')
    register(model)
  }

  /**
   * 获取 Model
   * @param modelName Model 名称
   * @returns Model 实例
   */
  getModel(modelName: string): any {
    const { getModel: get } = require('./ModelRegistry')
    return get(modelName)
  }

  /**
   * 获取事件总线
   * @returns EventBus 实例
   */
  getEventBus(): EventBus {
    return this.eventBus
  }

  /**
   * 初始化引擎
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      console.warn('Engine already initialized')
      return
    }

    if (this.config.debug) {
      console.log('Initializing Engine with config:', this.config)
    }

    // 发布初始化事件
    this.eventBus.publish({
      type: 'engine:initializing',
      payload: { config: this.config },
      timestamp: Date.now()
    })

    // TODO: 执行初始化逻辑
    // - 初始化数据访问层
    // - 初始化状态管理
    // - 初始化渲染注册表

    this.initialized = true

    // 发布初始化完成事件
    this.eventBus.publish({
      type: 'engine:initialized',
      payload: { config: this.config },
      timestamp: Date.now()
    })

    if (this.config.debug) {
      console.log('Engine initialized successfully')
    }
  }

  /**
   * 销毁引擎
   */
  async destroy(): Promise<void> {
    if (!this.initialized) {
      return
    }

    if (this.config.debug) {
      console.log('Destroying Engine')
    }

    // 发布销毁事件
    this.eventBus.publish({
      type: 'engine:destroying',
      payload: {},
      timestamp: Date.now()
    })

    // TODO: 执行清理逻辑
    // - 清理数据访问层
    // - 清理状态管理
    // - 清理事件订阅

    // 清空容器
    this.container.clear()

    // 清空事件总线
    this.eventBus.clear()

    this.initialized = false

    if (this.config.debug) {
      console.log('Engine destroyed')
    }
  }

  /**
   * 检查引擎是否已初始化
   */
  isInitialized(): boolean {
    return this.initialized
  }

  /**
   * 获取配置值
   * @param key 配置键
   * @param defaultValue 默认值
   * @returns 配置值
   */
  getConfig<T = any>(key: string, defaultValue?: T): T {
    return this.config[key] !== undefined ? this.config[key] : defaultValue
  }

  /**
   * 设置配置值
   * @param key 配置键
   * @param value 配置值
   */
  setConfig(key: string, value: any): void {
    this.config[key] = value
  }
}

/**
 * 创建 Engine Context
 * @param config Engine 配置
 * @returns EngineContext 实例
 */
export function createEngineContext(config?: EngineConfig): EngineContext {
  const container = new Container()
  return new EngineContext(container, config)
}

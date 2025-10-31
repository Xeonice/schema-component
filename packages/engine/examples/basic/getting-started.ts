/**
 * Getting Started Example
 * 演示如何使用 @schema-component/engine 的基础功能
 */

import { createEngineContext, getEventBus, EventType } from '../../src'

// ============================================================================
// 1. 创建 Engine Context
// ============================================================================

const engine = createEngineContext({
  apiBaseUrl: 'https://api.example.com',
  debug: true,
  defaultPageSize: 20
})

console.log('Engine created with config:', engine.config)

// ============================================================================
// 2. 订阅事件
// ============================================================================

const eventBus = engine.getEventBus()

// 订阅初始化事件
eventBus.subscribe('engine:initializing', (event) => {
  console.log('Engine initializing...', event.payload)
})

eventBus.subscribe('engine:initialized', (event) => {
  console.log('Engine initialized!', event.payload)
})

// 订阅销毁事件
eventBus.subscribe('engine:destroying', (event) => {
  console.log('Engine destroying...')
})

// ============================================================================
// 3. 初始化引擎
// ============================================================================

async function main() {
  try {
    // 初始化
    await engine.initialize()
    console.log('Is initialized:', engine.isInitialized())

    // 获取配置
    const apiBaseUrl = engine.getConfig('apiBaseUrl')
    console.log('API Base URL:', apiBaseUrl)

    // 设置自定义配置
    engine.setConfig('customKey', 'customValue')
    console.log('Custom config:', engine.getConfig('customKey'))

    // ============================================================================
    // 4. 使用 DI 容器
    // ============================================================================

    // 绑定服务
    class Logger {
      log(message: string) {
        console.log(`[Logger] ${message}`)
      }
    }

    const LOGGER_TYPE = Symbol.for('Logger')
    engine.bind(LOGGER_TYPE, Logger)

    // 获取服务
    const logger = engine.get<Logger>(LOGGER_TYPE)
    logger.log('Hello from DI container!')

    // ============================================================================
    // 5. 发布自定义事件
    // ============================================================================

    eventBus.publish({
      type: EventType.CUSTOM,
      payload: { message: 'Custom event from getting started example' },
      timestamp: Date.now()
    })

    // ============================================================================
    // 6. 清理
    // ============================================================================

    setTimeout(async () => {
      await engine.destroy()
      console.log('Engine destroyed, is initialized:', engine.isInitialized())
    }, 1000)

  } catch (error) {
    console.error('Error:', error)
  }
}

// 运行示例
main()

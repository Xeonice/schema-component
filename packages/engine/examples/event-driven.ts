/**
 * Event-Driven Example
 * 展示如何使用事件系统进行解耦的业务逻辑
 */

import {
  defineModel,
  ModelRegistry,
  createModelStore,
  createMockRepository,
  EventBus,
  EventType,
  createEventBus
} from '../src'

// 创建 EventBus
const eventBus = createEventBus()

// 定义 Order Model
const OrderModel = defineModel({
  name: 'Order',
  schema: {
    fields: {
      id: { type: 'number' },
      customerId: { type: 'number' },
      productName: { type: 'string' },
      quantity: { type: 'number' },
      totalPrice: { type: 'number' },
      status: { type: 'string' } // pending, confirmed, shipped, delivered
    }
  },
  apis: {},
  actions: {
    confirmOrder: async function(orderId: number) {
      console.log(`Confirming order ${orderId}`)
      return { id: orderId, status: 'confirmed' }
    },
    shipOrder: async function(orderId: number) {
      console.log(`Shipping order ${orderId}`)
      return { id: orderId, status: 'shipped' }
    }
  },
  views: {
    list: { type: 'list', title: 'Orders' },
    detail: { type: 'detail', title: 'Order Detail' }
  },
  hooks: {
    afterCreate: async (result) => {
      // 订单创建后发布事件
      eventBus.publish({
        type: EventType.MODEL_AFTER_CREATE,
        payload: result,
        timestamp: Date.now()
      })
      return result
    },
    afterUpdate: async (result) => {
      // 订单更新后发布事件
      eventBus.publish({
        type: EventType.MODEL_AFTER_UPDATE,
        payload: result,
        timestamp: Date.now()
      })
      return result
    }
  }
})

// 注册 Model
ModelRegistry.getInstance().register(OrderModel)

// 创建 Store
const repository = createMockRepository('Order')
const orderStore = createModelStore({
  modelName: 'Order',
  repository
})

// 设置事件监听器 - 订单创建后发送通知
eventBus.subscribe(EventType.MODEL_AFTER_CREATE, async (event) => {
  const order = event.payload
  console.log(`\n[Event Handler] Order created: ${order.id}`)
  console.log('[Event Handler] Sending confirmation email...')
  // 模拟发送邮件
  await new Promise(resolve => setTimeout(resolve, 100))
  console.log('[Event Handler] Email sent successfully')
})

// 设置事件监听器 - 订单状态更新后记录日志
eventBus.subscribe(EventType.MODEL_AFTER_UPDATE, async (event) => {
  const order = event.payload
  console.log(`\n[Event Handler] Order updated: ${order.id}`)
  console.log(`[Event Handler] New status: ${order.status}`)
  console.log('[Event Handler] Logging to analytics...')
  // 模拟记录分析数据
  await new Promise(resolve => setTimeout(resolve, 50))
  console.log('[Event Handler] Analytics logged')
})

// 设置自定义事件监听器 - 订单发货通知
eventBus.subscribe('order:shipped', async (event) => {
  const { orderId, trackingNumber } = event.payload
  console.log(`\n[Event Handler] Order ${orderId} shipped!`)
  console.log(`[Event Handler] Tracking number: ${trackingNumber}`)
  console.log('[Event Handler] Sending shipping notification to customer...')
  await new Promise(resolve => setTimeout(resolve, 100))
  console.log('[Event Handler] Notification sent')
})

async function main() {
  console.log('\n=== Event-Driven Example ===\n')

  // 1. 创建订单（触发 afterCreate 事件）
  console.log('1. Creating order...')
  const order = await orderStore.create({
    customerId: 101,
    productName: 'Laptop',
    quantity: 1,
    totalPrice: 1299.99,
    status: 'pending'
  })

  await OrderModel.hooks.afterCreate?.(order)

  // 等待事件处理完成
  await new Promise(resolve => setTimeout(resolve, 200))

  // 2. 确认订单（使用 Action + 触发 afterUpdate 事件）
  console.log('\n2. Confirming order...')
  const confirmedData = await OrderModel.actions.confirmOrder((order as any).id)
  const confirmed = await orderStore.update((order as any).id, confirmedData)

  await OrderModel.hooks.afterUpdate?.(confirmed)

  // 等待事件处理完成
  await new Promise(resolve => setTimeout(resolve, 200))

  // 3. 发货订单（使用 Action + 发布自定义事件）
  console.log('\n3. Shipping order...')
  const shippedData = await OrderModel.actions.shipOrder((order as any).id)
  const shipped = await orderStore.update((order as any).id, shippedData)

  await OrderModel.hooks.afterUpdate?.(shipped)

  // 发布自定义事件
  eventBus.publish({
    type: 'order:shipped',
    payload: {
      orderId: (order as any).id,
      trackingNumber: `TRACK-${Date.now()}`
    },
    timestamp: Date.now()
  })

  // 等待事件处理完成
  await new Promise(resolve => setTimeout(resolve, 200))

  // 4. 查看最终状态
  console.log('\n4. Final order state:')
  await orderStore.loadOne((order as any).id)
  console.log(orderStore.current)

  console.log('\n=== Example Complete ===\n')
}

// Run example
if (require.main === module) {
  main().catch(console.error)
}

export { main }

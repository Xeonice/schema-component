/**
 * Container 测试
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { Container, createContainer } from '../../src/di/Container'
import { injectable, inject } from '../../src/di/decorators'

describe('Container', () => {
  let container: Container

  beforeEach(() => {
    container = createContainer()
  })

  it('should create container', () => {
    expect(container).toBeInstanceOf(Container)
  })

  it('should bind and get service', () => {
    @injectable()
    class TestService {
      getValue() {
        return 'test'
      }
    }

    const TEST_TYPE = Symbol.for('TestService')
    container.bind(TEST_TYPE).to(TestService)

    const service = container.get<TestService>(TEST_TYPE)
    expect(service).toBeInstanceOf(TestService)
    expect(service.getValue()).toBe('test')
  })

  it('should bind constant value', () => {
    const TEST_TYPE = Symbol.for('TestConstant')
    const value = { name: 'test' }

    container.bind(TEST_TYPE).toConstantValue(value)

    const result = container.get(TEST_TYPE)
    expect(result).toBe(value)
  })

  it('should support dependency injection', () => {
    @injectable()
    class ServiceA {
      getName() {
        return 'A'
      }
    }

    @injectable()
    class ServiceB {
      constructor(@inject(Symbol.for('ServiceA')) private serviceA: ServiceA) {}

      getCombinedName() {
        return 'B-' + this.serviceA.getName()
      }
    }

    container.bind(Symbol.for('ServiceA')).to(ServiceA)
    container.bind(Symbol.for('ServiceB')).to(ServiceB)

    const serviceB = container.get<ServiceB>(Symbol.for('ServiceB'))
    expect(serviceB.getCombinedName()).toBe('B-A')
  })

  it('should check if bound', () => {
    const TEST_TYPE = Symbol.for('Test')
    expect(container.isBound(TEST_TYPE)).toBe(false)

    container.bind(TEST_TYPE).toConstantValue('test')
    expect(container.isBound(TEST_TYPE)).toBe(true)
  })

  it('should unbind service', () => {
    const TEST_TYPE = Symbol.for('Test')
    container.bind(TEST_TYPE).toConstantValue('test')

    expect(container.isBound(TEST_TYPE)).toBe(true)

    container.unbind(TEST_TYPE)
    expect(container.isBound(TEST_TYPE)).toBe(false)
  })

  it('should rebind service', () => {
    const TEST_TYPE = Symbol.for('Test')
    container.bind(TEST_TYPE).toConstantValue('first')

    let value = container.get(TEST_TYPE)
    expect(value).toBe('first')

    container.rebind(TEST_TYPE).toConstantValue('second')

    value = container.get(TEST_TYPE)
    expect(value).toBe('second')
  })

  it('should tryGet return undefined for unbound service', () => {
    const TEST_TYPE = Symbol.for('Unbound')
    const result = container.tryGet(TEST_TYPE)
    expect(result).toBeUndefined()
  })

  it('should clear all bindings', () => {
    const TYPE1 = Symbol.for('Type1')
    const TYPE2 = Symbol.for('Type2')

    container.bind(TYPE1).toConstantValue('1')
    container.bind(TYPE2).toConstantValue('2')

    expect(container.isBound(TYPE1)).toBe(true)
    expect(container.isBound(TYPE2)).toBe(true)

    container.clear()

    expect(container.isBound(TYPE1)).toBe(false)
    expect(container.isBound(TYPE2)).toBe(false)
  })

  it('should create child container', () => {
    const PARENT_TYPE = Symbol.for('Parent')
    const CHILD_TYPE = Symbol.for('Child')

    container.bind(PARENT_TYPE).toConstantValue('parent')

    const child = container.createChild()
    child.bind(CHILD_TYPE).toConstantValue('child')

    // 子容器可以访问父容器的绑定
    expect(child.get(PARENT_TYPE)).toBe('parent')
    expect(child.get(CHILD_TYPE)).toBe('child')

    // 父容器无法访问子容器的绑定
    expect(() => container.get(CHILD_TYPE)).toThrow()
  })

  it('should support named bindings', () => {
    @injectable()
    class ServiceImpl {
      constructor(private name: string) {}
      getName() {
        return this.name
      }
    }

    const SERVICE_TYPE = Symbol.for('Service')

    container
      .bind(SERVICE_TYPE)
      .toConstantValue(new ServiceImpl('first'))
      .whenTargetNamed('first')

    container
      .bind(SERVICE_TYPE)
      .toConstantValue(new ServiceImpl('second'))
      .whenTargetNamed('second')

    const first = container.getNamed<ServiceImpl>(SERVICE_TYPE, 'first')
    const second = container.getNamed<ServiceImpl>(SERVICE_TYPE, 'second')

    expect(first.getName()).toBe('first')
    expect(second.getName()).toBe('second')
  })
})

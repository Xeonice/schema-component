/**
 * BaseModel 测试
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { BaseModel, createModel } from '../../src/core/BaseModel'
import type { ModelDefinition } from '../../src/core/types'

describe('BaseModel', () => {
  class TestModel extends BaseModel {
    protected getDefinition(): ModelDefinition {
      return {
        name: 'Test',
        schema: { fields: {} },
        actions: {
          testAction: async ({ value }: { value: string }) => {
            return `Action: ${value}`
          }
        },
        methods: {
          testMethod: async (value: string) => {
            return `Method: ${value}`
          }
        },
        apis: {
          getList: async () => {
            return { data: [], total: 0 }
          }
        },
        views: {
          list: {
            type: 'list',
            title: 'Test List'
          }
        }
      }
    }
  }

  let model: TestModel

  beforeEach(() => {
    model = new TestModel()
  })

  it('should create model instance', () => {
    expect(model).toBeInstanceOf(BaseModel)
    expect(model.name).toBe('Test')
  })

  it('should have schema', () => {
    expect(model.schema).toBeDefined()
    expect(model.schema.fields).toBeDefined()
  })

  it('should have views', () => {
    expect(model.views).toBeDefined()
    expect(model.views.list).toBeDefined()
    expect((model.views.list as any).title).toBe('Test List')
  })

  it('should have actions', () => {
    expect(model.actions).toBeDefined()
    expect(model.actions.testAction).toBeDefined()
    expect(typeof model.actions.testAction).toBe('function')
  })

  it('should have context', () => {
    expect(model.context).toBeDefined()
    expect(model.context.modelName).toBe('Test')
    expect(model.context.repository).toBeDefined()
    expect(model.context.eventBus).toBeDefined()
  })

  it('should execute action', async () => {
    const result = await model.executeAction('testAction', { value: 'test' })
    expect(result).toBe('Action: test')
  })

  it('should execute method', async () => {
    const result = await model.executeMethod('testMethod', 'test')
    expect(result).toBe('Method: test')
  })

  it('should call API', async () => {
    const result = await model.callApi('getList')
    expect(result).toEqual({ data: [], total: 0 })
  })

  it('should get view', () => {
    const listView = model.getView('list')
    expect(listView).toBeDefined()
    expect((listView as any).title).toBe('Test List')
  })

  it('should get view names', () => {
    const viewNames = model.getViewNames()
    expect(viewNames).toContain('list')
    expect(viewNames).toHaveLength(1)
  })

  it('should get action names', () => {
    const actionNames = model.getActionNames()
    expect(actionNames).toContain('testAction')
    expect(actionNames).toHaveLength(1)
  })

  it('should get API names', () => {
    const apiNames = model.getApiNames()
    expect(apiNames).toContain('getList')
    expect(apiNames).toHaveLength(1)
  })

  it('should get method names', () => {
    const methodNames = model.getMethodNames()
    expect(methodNames).toContain('testMethod')
    expect(methodNames).toHaveLength(1)
  })

  it('should check if has action', () => {
    expect(model.hasAction('testAction')).toBe(true)
    expect(model.hasAction('nonExistent')).toBe(false)
  })

  it('should check if has method', () => {
    expect(model.hasMethod('testMethod')).toBe(true)
    expect(model.hasMethod('nonExistent')).toBe(false)
  })

  it('should check if has API', () => {
    expect(model.hasApi('getList')).toBe(true)
    expect(model.hasApi('nonExistent')).toBe(false)
  })

  it('should check if has view', () => {
    expect(model.hasView('list')).toBe(true)
    expect(model.hasView('nonExistent')).toBe(false)
  })

  it('should get internal model', () => {
    const internalModel = model.getModel()
    expect(internalModel.name).toBe('Test')
    expect(internalModel.schema).toBeDefined()
  })

  it('should convert to JSON', () => {
    const json = model.toJSON()
    expect(json).toEqual({
      name: 'Test',
      views: ['list'],
      actions: ['testAction'],
      apis: ['getList'],
      methods: ['testMethod']
    })
  })

  it('should convert to string', () => {
    const str = model.toString()
    expect(str).toBe('[Model: Test]')
  })
})

describe('createModel', () => {
  it('should create model from definition', () => {
    const model = createModel({
      name: 'User',
      schema: {},
      actions: {
        activate: async () => 'activated'
      }
    })

    expect(model).toBeInstanceOf(BaseModel)
    expect(model.name).toBe('User')
  })

  it('should execute action on created model', async () => {
    const model = createModel({
      name: 'User',
      schema: {},
      actions: {
        test: async () => 'success'
      }
    })

    const result = await model.executeAction('test')
    expect(result).toBe('success')
  })
})

/**
 * defineModel 测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { defineModel, isModel, getModelName, getModelViews, getModelActions, getModelApis } from '../../src/core/defineModel'
import { clearAllMockData } from '../../src/repository/mock'

describe('defineModel', () => {
  beforeEach(() => {
    clearAllMockData()
  })

  it('should define a basic model', () => {
    const model = defineModel({
      name: 'User',
      schema: { fields: {} }
    })

    expect(model).toBeDefined()
    expect(model.name).toBe('User')
    expect(model.schema).toBeDefined()
  })

  it('should throw error if name is missing', () => {
    expect(() => {
      defineModel({
        name: '',
        schema: {}
      })
    }).toThrow('Model name is required')
  })

  it('should throw error if schema is missing', () => {
    expect(() => {
      defineModel({
        name: 'User',
        schema: null as any
      })
    }).toThrow('Model schema is required')
  })

  it('should resolve views from function', () => {
    const model = defineModel({
      name: 'User',
      schema: {},
      views: (context) => ({
        list: {
          type: 'list',
          title: `${context.modelName} List`
        }
      })
    })

    expect(model.views.list).toBeDefined()
    expect((model.views.list as any).title).toBe('User List')
  })

  it('should use views object directly', () => {
    const model = defineModel({
      name: 'User',
      schema: {},
      views: {
        list: {
          type: 'list',
          title: 'User List'
        }
      }
    })

    expect(model.views.list).toBeDefined()
    expect((model.views.list as any).title).toBe('User List')
  })

  it('should resolve actions from function', () => {
    const model = defineModel({
      name: 'User',
      schema: {},
      actions: (context) => ({
        activate: async ({ id }: { id: string }) => {
          return { id, isActive: true }
        }
      })
    })

    expect(model.actions.activate).toBeDefined()
    expect(typeof model.actions.activate).toBe('function')
  })

  it('should use actions object directly', () => {
    const model = defineModel({
      name: 'User',
      schema: {},
      actions: {
        activate: async ({ id }: { id: string }) => {
          return { id, isActive: true }
        }
      }
    })

    expect(model.actions.activate).toBeDefined()
    expect(typeof model.actions.activate).toBe('function')
  })

  it('should include apis', () => {
    const model = defineModel({
      name: 'User',
      schema: {},
      apis: {
        getList: async (params) => {
          return { data: [], total: 0 }
        }
      }
    })

    expect(model.apis.getList).toBeDefined()
    expect(typeof model.apis.getList).toBe('function')
  })

  it('should include hooks', () => {
    const model = defineModel({
      name: 'User',
      schema: {},
      hooks: {
        beforeCreate: async (data) => {
          return { ...data, validated: true }
        }
      }
    })

    expect(model.hooks.beforeCreate).toBeDefined()
    expect(typeof model.hooks.beforeCreate).toBe('function')
  })

  it('should include methods', () => {
    const model = defineModel({
      name: 'User',
      schema: {},
      methods: {
        resetPassword: async (id: string) => {
          return { id, passwordReset: true }
        }
      }
    })

    expect(model.methods.resetPassword).toBeDefined()
    expect(typeof model.methods.resetPassword).toBe('function')
  })

  it('should include options', () => {
    const model = defineModel({
      name: 'User',
      schema: {},
      options: {
        tableName: 'users',
        timestamps: true
      }
    })

    expect(model.options.tableName).toBe('users')
    expect(model.options.timestamps).toBe(true)
  })

  it('should have context with repository and eventBus', () => {
    const model = defineModel({
      name: 'User',
      schema: {}
    })

    expect(model.context).toBeDefined()
    expect(model.context.modelName).toBe('User')
    expect(model.context.repository).toBeDefined()
    expect(model.context.eventBus).toBeDefined()
  })

  it('should publish model:defined event', () => {
    const handler = vi.fn()

    const model = defineModel({
      name: 'User',
      schema: {}
    })

    model.context.eventBus.subscribe('model:defined', handler)

    const model2 = defineModel({
      name: 'User2',
      schema: {}
    })

    expect(handler).toHaveBeenCalled()
  })
})

describe('isModel', () => {
  it('should return true for valid model', () => {
    const model = defineModel({
      name: 'User',
      schema: {}
    })

    expect(isModel(model)).toBe(true)
  })

  it('should return false for invalid objects', () => {
    expect(isModel(null)).toBe(false)
    expect(isModel(undefined)).toBe(false)
    expect(isModel({})).toBe(false)
    expect(isModel({ name: 'User' })).toBe(false)
  })
})

describe('getModelName', () => {
  it('should return model name', () => {
    const model = defineModel({
      name: 'User',
      schema: {}
    })

    expect(getModelName(model)).toBe('User')
  })
})

describe('getModelViews', () => {
  it('should return view names', () => {
    const model = defineModel({
      name: 'User',
      schema: {},
      views: {
        list: { type: 'list' },
        form: { type: 'form' }
      }
    })

    const viewNames = getModelViews(model)
    expect(viewNames).toContain('list')
    expect(viewNames).toContain('form')
    expect(viewNames).toHaveLength(2)
  })
})

describe('getModelActions', () => {
  it('should return action names', () => {
    const model = defineModel({
      name: 'User',
      schema: {},
      actions: {
        activate: async () => {},
        deactivate: async () => {}
      }
    })

    const actionNames = getModelActions(model)
    expect(actionNames).toContain('activate')
    expect(actionNames).toContain('deactivate')
    expect(actionNames).toHaveLength(2)
  })
})

describe('getModelApis', () => {
  it('should return api names', () => {
    const model = defineModel({
      name: 'User',
      schema: {},
      apis: {
        getList: async () => ({ data: [], total: 0 }),
        getOne: async () => ({})
      }
    })

    const apiNames = getModelApis(model)
    expect(apiNames).toContain('getList')
    expect(apiNames).toContain('getOne')
    expect(apiNames).toHaveLength(2)
  })
})

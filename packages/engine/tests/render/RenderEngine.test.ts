import { describe, it, expect, beforeEach, vi } from 'vitest'
import { RenderEngine } from '../../src/render/RenderEngine'
import type { IDataRenderer } from '../../src/render/dataTypes'
import type { IViewRenderer, ViewDefinition } from '../../src/render/viewTypes'
import type { IActionRenderer, ServerActionDefinition, ViewActionDefinition } from '../../src/render/actionTypes'
import type { RenderDescriptor, RenderContext } from '../../src/render/types'

describe('RenderEngine', () => {
  let renderEngine: RenderEngine

  beforeEach(() => {
    // Reset singleton for each test
    ;(RenderEngine as any).instance = undefined
    renderEngine = RenderEngine.getInstance()
  })

  it('should be a singleton', () => {
    const instance1 = RenderEngine.getInstance()
    const instance2 = RenderEngine.getInstance()

    expect(instance1).toBe(instance2)
  })

  it('should have viewStack and actionQueue', () => {
    expect(renderEngine.viewStack).toBeDefined()
    expect(renderEngine.actionQueue).toBeDefined()
  })

  describe('DataRenderer', () => {
    it('should register and get data renderer', () => {
      const mockRenderer: IDataRenderer = {
        type: 'string',
        render: vi.fn().mockReturnValue({ type: 'span', props: {} })
      }

      renderEngine.registerDataRenderer(mockRenderer)
      const retrieved = renderEngine.getDataRenderer('string')

      expect(retrieved).toBe(mockRenderer)
    })

    it('should render data field', () => {
      const mockRenderer: IDataRenderer = {
        type: 'string',
        render: vi.fn().mockReturnValue({ type: 'span', props: { children: 'test' } })
      }

      renderEngine.registerDataRenderer(mockRenderer)

      const field = { type: 'string', name: 'title' }
      const context = renderEngine.createContext({
        modelName: 'User',
        model: {} as any
      })

      const descriptor = renderEngine.renderData('test value', field, context)

      expect(mockRenderer.render).toHaveBeenCalledWith('test value', field, context)
      expect(descriptor).toEqual({ type: 'span', props: { children: 'test' } })
    })

    it('should render data field in edit mode', () => {
      const mockRenderer: IDataRenderer = {
        type: 'string',
        render: vi.fn().mockReturnValue({ type: 'span', props: {} }),
        renderEdit: vi.fn().mockReturnValue({ type: 'input', props: {} })
      }

      renderEngine.registerDataRenderer(mockRenderer)

      const field = { type: 'string', name: 'title' }
      const context = renderEngine.createContext({
        modelName: 'User',
        model: {} as any
      })

      const descriptor = renderEngine.renderData('test value', field, context, 'edit')

      expect(mockRenderer.renderEdit).toHaveBeenCalledWith('test value', field, context)
      expect(descriptor.type).toBe('input')
    })

    it('should throw error for unknown data type', () => {
      const field = { type: 'unknown', name: 'test' }
      const context = renderEngine.createContext({
        modelName: 'User',
        model: {} as any
      })

      expect(() => {
        renderEngine.renderData('value', field, context)
      }).toThrow('No data renderer found for type "unknown"')
    })
  })

  describe('ViewRenderer', () => {
    it('should register and get view renderer', () => {
      const mockRenderer: IViewRenderer = {
        type: 'list',
        render: vi.fn().mockReturnValue({ type: 'table', props: {} })
      }

      renderEngine.registerViewRenderer(mockRenderer)
      const retrieved = renderEngine.getViewRenderer('list')

      expect(retrieved).toBe(mockRenderer)
    })

    it('should render view', () => {
      const mockRenderer: IViewRenderer = {
        type: 'list',
        render: vi.fn().mockReturnValue({ type: 'table', props: {} })
      }

      renderEngine.registerViewRenderer(mockRenderer)

      const view: ViewDefinition = { type: 'list', title: 'Users' }
      const data = [{ id: 1, name: 'John' }]
      const context = renderEngine.createContext({
        modelName: 'User',
        model: {} as any
      })

      const descriptor = renderEngine.renderView(view, data, context)

      expect(mockRenderer.render).toHaveBeenCalledWith(view, data, context)
      expect(descriptor.type).toBe('table')
    })

    it('should throw error for unknown view type', () => {
      const view: ViewDefinition = { type: 'unknown' }
      const context = renderEngine.createContext({
        modelName: 'User',
        model: {} as any
      })

      expect(() => {
        renderEngine.renderView(view, [], context)
      }).toThrow('No view renderer found for type "unknown"')
    })
  })

  describe('ActionRenderer', () => {
    it('should register and get action renderer', () => {
      const mockRenderer: IActionRenderer = {
        renderMode: 'button',
        renderServer: vi.fn(),
        renderView: vi.fn()
      }

      renderEngine.registerActionRenderer('button', mockRenderer)
      const retrieved = renderEngine.getActionRenderer('button')

      expect(retrieved).toBe(mockRenderer)
    })

    it('should render server action', () => {
      const mockRenderer: IActionRenderer = {
        renderMode: 'button',
        renderServer: vi.fn().mockReturnValue({ type: 'button', props: {} })
      }

      renderEngine.registerActionRenderer('button', mockRenderer)

      const action: ServerActionDefinition = {
        type: 'server',
        name: 'create',
        label: 'Create',
        renderAs: 'button'
      }
      const context = renderEngine.createContext({
        modelName: 'User',
        model: {} as any
      })

      const descriptor = renderEngine.renderAction(action, context)

      expect(mockRenderer.renderServer).toHaveBeenCalledWith(action, context)
      expect(descriptor.type).toBe('button')
    })

    it('should render view action', () => {
      const mockRenderer: IActionRenderer = {
        renderMode: 'button',
        renderView: vi.fn().mockReturnValue({ type: 'button', props: {} })
      }

      renderEngine.registerActionRenderer('button', mockRenderer)

      const action: ViewActionDefinition = {
        type: 'view',
        name: 'cancel',
        label: 'Cancel',
        handler: vi.fn(),
        renderAs: 'button'
      }
      const context = renderEngine.createContext({
        modelName: 'User',
        model: {} as any
      })

      const descriptor = renderEngine.renderAction(action, context)

      expect(mockRenderer.renderView).toHaveBeenCalledWith(action, context)
      expect(descriptor.type).toBe('button')
    })

    it('should use default render mode if not specified', () => {
      const mockRenderer: IActionRenderer = {
        renderMode: 'button',
        renderServer: vi.fn().mockReturnValue({ type: 'button', props: {} })
      }

      renderEngine.registerActionRenderer('button', mockRenderer)

      const action: ServerActionDefinition = {
        type: 'server',
        name: 'create',
        label: 'Create'
      }
      const context = renderEngine.createContext({
        modelName: 'User',
        model: {} as any
      })

      renderEngine.renderAction(action, context)

      expect(mockRenderer.renderServer).toHaveBeenCalled()
    })
  })

  describe('Context Creation', () => {
    it('should create render context with viewStack and actionQueue', () => {
      const model = {
        name: 'User',
        schema: {},
        apis: {},
        actions: {},
        views: {},
        hooks: {}
      } as any

      const context = renderEngine.createContext({
        modelName: 'User',
        model,
        record: { id: 1, name: 'John' }
      })

      expect(context.modelName).toBe('User')
      expect(context.model).toBe(model)
      expect(context.record).toEqual({ id: 1, name: 'John' })
      expect(context.viewStack).toBe(renderEngine.viewStack)
      expect(context.actionQueue).toBe(renderEngine.actionQueue)
    })
  })

  describe('Action Execution', () => {
    it('should execute server action via actionQueue', async () => {
      const mockActionFn = vi.fn().mockResolvedValue({ success: true })
      const model = {
        name: 'User',
        schema: {},
        apis: {},
        actions: { testAction: mockActionFn },
        views: {},
        hooks: {}
      } as any

      const action: ServerActionDefinition = {
        type: 'server',
        name: 'testAction',
        label: 'Test'
      }

      const context = renderEngine.createContext({ modelName: 'User', model })

      const taskId = await renderEngine.executeServerAction(action, { foo: 'bar' }, context)

      expect(taskId).toBeTruthy()
      expect(renderEngine.actionQueue.getTask(taskId)).toBeDefined()
    })

    it('should execute view action directly', async () => {
      const handler = vi.fn().mockResolvedValue(undefined)
      const action: ViewActionDefinition = {
        type: 'view',
        name: 'cancel',
        label: 'Cancel',
        handler
      }

      const context = renderEngine.createContext({
        modelName: 'User',
        model: {} as any
      })

      await renderEngine.executeViewAction(action, context)

      expect(handler).toHaveBeenCalledWith(context)
    })

    it('should handle view action errors', async () => {
      const error = new Error('Handler failed')
      const handler = vi.fn().mockRejectedValue(error)
      const action: ViewActionDefinition = {
        type: 'view',
        name: 'cancel',
        label: 'Cancel',
        handler
      }

      const context = renderEngine.createContext({
        modelName: 'User',
        model: {} as any
      })

      await expect(renderEngine.executeViewAction(action, context)).rejects.toThrow('Handler failed')
    })
  })
})

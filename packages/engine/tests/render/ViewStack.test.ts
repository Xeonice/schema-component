import { describe, it, expect, beforeEach } from 'vitest'
import { ViewStack } from '../../src/render/ViewStack'
import type { ViewDefinition } from '../../src/render/viewTypes'

describe('ViewStack', () => {
  let viewStack: ViewStack

  beforeEach(() => {
    viewStack = new ViewStack()
  })

  it('should initialize with empty stack', () => {
    expect(viewStack.current).toBeNull()
    expect(viewStack.history).toEqual([])
    expect(viewStack.canGoBack).toBe(false)
    expect(viewStack.canGoForward).toBe(false)
  })

  it('should push view to stack', () => {
    const view: ViewDefinition = { type: 'list', title: 'Users' }
    viewStack.push(view, { foo: 'bar' }, { page: 1 })

    expect(viewStack.current).not.toBeNull()
    expect(viewStack.current?.type).toBe('list')
    expect(viewStack.current?.definition).toEqual(view)
    expect(viewStack.current?.data).toEqual({ foo: 'bar' })
    expect(viewStack.current?.params).toEqual({ page: 1 })
    expect(viewStack.history).toHaveLength(1)
  })

  it('should support multiple pushes', () => {
    const view1: ViewDefinition = { type: 'list' }
    const view2: ViewDefinition = { type: 'form' }
    const view3: ViewDefinition = { type: 'detail' }

    viewStack.push(view1)
    viewStack.push(view2)
    viewStack.push(view3)

    expect(viewStack.history).toHaveLength(3)
    expect(viewStack.current?.type).toBe('detail')
    expect(viewStack.canGoBack).toBe(true)
    expect(viewStack.canGoForward).toBe(false)
  })

  it('should replace current view', () => {
    const view1: ViewDefinition = { type: 'list' }
    const view2: ViewDefinition = { type: 'form' }

    viewStack.push(view1)
    const firstId = viewStack.current?.id

    viewStack.replace(view2)

    expect(viewStack.history).toHaveLength(1)
    expect(viewStack.current?.type).toBe('form')
    expect(viewStack.current?.id).not.toBe(firstId)
  })

  it('should go back in history', () => {
    const view1: ViewDefinition = { type: 'list' }
    const view2: ViewDefinition = { type: 'form' }
    const view3: ViewDefinition = { type: 'detail' }

    viewStack.push(view1)
    viewStack.push(view2)
    viewStack.push(view3)

    expect(viewStack.current?.type).toBe('detail')

    const prev = viewStack.goBack()
    expect(prev?.type).toBe('form')
    expect(viewStack.current?.type).toBe('form')
    expect(viewStack.canGoForward).toBe(true)

    viewStack.goBack()
    expect(viewStack.current?.type).toBe('list')
    expect(viewStack.canGoBack).toBe(false)
  })

  it('should go forward in history', () => {
    const view1: ViewDefinition = { type: 'list' }
    const view2: ViewDefinition = { type: 'form' }

    viewStack.push(view1)
    viewStack.push(view2)
    viewStack.goBack()

    expect(viewStack.current?.type).toBe('list')

    const next = viewStack.goForward()
    expect(next?.type).toBe('form')
    expect(viewStack.current?.type).toBe('form')
    expect(viewStack.canGoForward).toBe(false)
  })

  it('should truncate forward history on new push', () => {
    const view1: ViewDefinition = { type: 'list' }
    const view2: ViewDefinition = { type: 'form' }
    const view3: ViewDefinition = { type: 'detail' }

    viewStack.push(view1)
    viewStack.push(view2)
    viewStack.push(view3)
    viewStack.goBack()
    viewStack.goBack()

    expect(viewStack.current?.type).toBe('list')

    const view4: ViewDefinition = { type: 'kanban' }
    viewStack.push(view4)

    expect(viewStack.history).toHaveLength(2)
    expect(viewStack.current?.type).toBe('kanban')
    expect(viewStack.canGoForward).toBe(false)
  })

  it('should go to specific index', () => {
    const view1: ViewDefinition = { type: 'list' }
    const view2: ViewDefinition = { type: 'form' }
    const view3: ViewDefinition = { type: 'detail' }

    viewStack.push(view1)
    viewStack.push(view2)
    viewStack.push(view3)

    viewStack.goTo(0)
    expect(viewStack.current?.type).toBe('list')

    viewStack.goTo(2)
    expect(viewStack.current?.type).toBe('detail')
  })

  it('should clear stack', () => {
    const view1: ViewDefinition = { type: 'list' }
    const view2: ViewDefinition = { type: 'form' }

    viewStack.push(view1)
    viewStack.push(view2)

    viewStack.clear()

    expect(viewStack.current).toBeNull()
    expect(viewStack.history).toEqual([])
    expect(viewStack.canGoBack).toBe(false)
    expect(viewStack.canGoForward).toBe(false)
  })

  it('should notify subscribers on change', () => {
    let notificationCount = 0
    let lastCurrent: any = null

    const unsubscribe = viewStack.subscribe(current => {
      notificationCount++
      lastCurrent = current
    })

    const view1: ViewDefinition = { type: 'list' }
    viewStack.push(view1)

    expect(notificationCount).toBe(1)
    expect(lastCurrent?.type).toBe('list')

    const view2: ViewDefinition = { type: 'form' }
    viewStack.push(view2)

    expect(notificationCount).toBe(2)
    expect(lastCurrent?.type).toBe('form')

    unsubscribe()

    viewStack.goBack()
    expect(notificationCount).toBe(2) // No change after unsubscribe
  })

  it('should return null when going back from first item', () => {
    const view1: ViewDefinition = { type: 'list' }
    viewStack.push(view1)

    const result = viewStack.goBack()
    expect(result).toBeNull()
    expect(viewStack.current?.type).toBe('list')
  })

  it('should return null when going forward from last item', () => {
    const view1: ViewDefinition = { type: 'list' }
    viewStack.push(view1)

    const result = viewStack.goForward()
    expect(result).toBeNull()
    expect(viewStack.current?.type).toBe('list')
  })

  it('should return null when going to invalid index', () => {
    const view1: ViewDefinition = { type: 'list' }
    viewStack.push(view1)

    expect(viewStack.goTo(-1)).toBeNull()
    expect(viewStack.goTo(10)).toBeNull()
    expect(viewStack.current?.type).toBe('list')
  })
})

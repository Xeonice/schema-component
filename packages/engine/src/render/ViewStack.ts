import { makeObservable, observable, computed, action } from 'mobx'
import type { ViewDefinition } from './viewTypes'

export interface ViewStackItem {
  id: string
  type: string
  definition: ViewDefinition
  data?: any
  params?: Record<string, any>
  timestamp: number
}

export interface IViewStack {
  readonly current: ViewStackItem | null
  readonly history: ViewStackItem[]
  readonly canGoBack: boolean
  readonly canGoForward: boolean

  push(view: ViewDefinition, data?: any, params?: Record<string, any>): void
  replace(view: ViewDefinition, data?: any, params?: Record<string, any>): void
  goBack(): ViewStackItem | null
  goForward(): ViewStackItem | null
  goTo(index: number): ViewStackItem | null
  clear(): void
  subscribe(listener: (current: ViewStackItem | null) => void): () => void
}

export class ViewStack implements IViewStack {
  @observable
  private stack: ViewStackItem[] = []

  @observable
  private currentIndex: number = -1

  private listeners: Set<(current: ViewStackItem | null) => void> = new Set()

  constructor() {
    makeObservable(this)
  }

  @computed
  get current(): ViewStackItem | null {
    return this.currentIndex >= 0 ? this.stack[this.currentIndex] : null
  }

  @computed
  get history(): ViewStackItem[] {
    return this.stack.slice(0, this.currentIndex + 1)
  }

  @computed
  get canGoBack(): boolean {
    return this.currentIndex > 0
  }

  @computed
  get canGoForward(): boolean {
    return this.currentIndex < this.stack.length - 1
  }

  @action
  push(view: ViewDefinition, data?: any, params?: Record<string, any>): void {
    const item: ViewStackItem = {
      id: this.generateId(),
      type: view.type,
      definition: view,
      data,
      params,
      timestamp: Date.now()
    }

    if (this.currentIndex < this.stack.length - 1) {
      this.stack = this.stack.slice(0, this.currentIndex + 1)
    }

    this.stack.push(item)
    this.currentIndex = this.stack.length - 1
    this.notifyListeners()
  }

  @action
  replace(view: ViewDefinition, data?: any, params?: Record<string, any>): void {
    const item: ViewStackItem = {
      id: this.generateId(),
      type: view.type,
      definition: view,
      data,
      params,
      timestamp: Date.now()
    }

    if (this.currentIndex >= 0) {
      this.stack[this.currentIndex] = item
    } else {
      this.stack = [item]
      this.currentIndex = 0
    }
    this.notifyListeners()
  }

  @action
  goBack(): ViewStackItem | null {
    if (this.canGoBack) {
      this.currentIndex--
      this.notifyListeners()
      return this.current
    }
    return null
  }

  @action
  goForward(): ViewStackItem | null {
    if (this.canGoForward) {
      this.currentIndex++
      this.notifyListeners()
      return this.current
    }
    return null
  }

  @action
  goTo(index: number): ViewStackItem | null {
    if (index >= 0 && index < this.stack.length) {
      this.currentIndex = index
      this.notifyListeners()
      return this.current
    }
    return null
  }

  @action
  clear(): void {
    this.stack = []
    this.currentIndex = -1
    this.notifyListeners()
  }

  subscribe(listener: (current: ViewStackItem | null) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.current))
  }

  private generateId(): string {
    return `view_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

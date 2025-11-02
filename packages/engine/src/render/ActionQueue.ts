import { makeObservable, observable, computed, action, runInAction } from 'mobx'
import type { ServerActionDefinition } from './actionTypes'
import type { RenderContext } from './types'

// 声明全局函数以避免编译错误
declare const setTimeout: (callback: () => void, ms: number) => any

export type ActionStatus = 'pending' | 'running' | 'success' | 'failed' | 'cancelled'

export interface ActionTask {
  id: string
  action: ServerActionDefinition
  params: any
  context: RenderContext
  status: ActionStatus
  error?: Error
  result?: any
  createdAt: number
  startedAt?: number
  completedAt?: number
  retryCount: number
  maxRetries: number
}

export interface ActionQueueConfig {
  concurrency?: number
  defaultMaxRetries?: number
  timeout?: number
}

export interface IActionQueue {
  readonly pending: ActionTask[]
  readonly running: ActionTask[]
  readonly completed: ActionTask[]
  readonly failed: ActionTask[]

  enqueue(
    action: ServerActionDefinition,
    params: any,
    context: RenderContext,
    options?: { maxRetries?: number }
  ): string

  cancel(taskId: string): boolean
  retry(taskId: string): boolean
  clear(): void
  getTask(taskId: string): ActionTask | undefined
  subscribe(taskId: string, listener: (task: ActionTask) => void): () => void
  subscribeQueue(listener: (queue: IActionQueue) => void): () => void
}

export class ActionQueue implements IActionQueue {
  @observable
  private tasks: Map<string, ActionTask> = new Map()

  @observable
  private runningCount: number = 0

  private config: Required<ActionQueueConfig>
  private taskListeners: Map<string, Set<(task: ActionTask) => void>> = new Map()
  private queueListeners: Set<(queue: IActionQueue) => void> = new Set()

  constructor(config: ActionQueueConfig = {}) {
    this.config = {
      concurrency: config.concurrency || 3,
      defaultMaxRetries: config.defaultMaxRetries || 0,
      timeout: config.timeout || 30000
    }

    makeObservable(this)
  }

  @computed
  get pending(): ActionTask[] {
    return Array.from(this.tasks.values()).filter(t => t.status === 'pending')
  }

  @computed
  get running(): ActionTask[] {
    return Array.from(this.tasks.values()).filter(t => t.status === 'running')
  }

  @computed
  get completed(): ActionTask[] {
    return Array.from(this.tasks.values()).filter(t => t.status === 'success')
  }

  @computed
  get failed(): ActionTask[] {
    return Array.from(this.tasks.values()).filter(t => t.status === 'failed')
  }

  @action
  enqueue(
    action: ServerActionDefinition,
    params: any,
    context: RenderContext,
    options?: { maxRetries?: number }
  ): string {
    const task: ActionTask = {
      id: this.generateTaskId(),
      action,
      params,
      context,
      status: 'pending',
      createdAt: Date.now(),
      retryCount: 0,
      maxRetries: options?.maxRetries ?? this.config.defaultMaxRetries
    }

    this.tasks.set(task.id, task)
    this.notifyQueueListeners()
    this.processQueue()

    return task.id
  }

  @action
  cancel(taskId: string): boolean {
    const task = this.tasks.get(taskId)
    if (!task || (task.status !== 'pending' && task.status !== 'running')) {
      return false
    }

    task.status = 'cancelled'
    task.completedAt = Date.now()
    this.notifyTaskListeners(taskId, task)
    this.notifyQueueListeners()
    return true
  }

  @action
  retry(taskId: string): boolean {
    const task = this.tasks.get(taskId)
    if (!task || task.status !== 'failed') return false

    task.status = 'pending'
    task.error = undefined
    task.retryCount++
    this.notifyTaskListeners(taskId, task)
    this.notifyQueueListeners()
    this.processQueue()
    return true
  }

  @action
  clear(): void {
    this.tasks.clear()
    this.runningCount = 0
    this.notifyQueueListeners()
  }

  getTask(taskId: string): ActionTask | undefined {
    return this.tasks.get(taskId)
  }

  subscribe(taskId: string, listener: (task: ActionTask) => void): () => void {
    if (!this.taskListeners.has(taskId)) {
      this.taskListeners.set(taskId, new Set())
    }
    this.taskListeners.get(taskId)!.add(listener)
    return () => this.taskListeners.get(taskId)?.delete(listener)
  }

  subscribeQueue(listener: (queue: IActionQueue) => void): () => void {
    this.queueListeners.add(listener)
    return () => this.queueListeners.delete(listener)
  }

  private async processQueue(): Promise<void> {
    if (this.runningCount >= this.config.concurrency) return

    const nextTask = this.pending[0]
    if (!nextTask) return

    await this.executeTask(nextTask)
    this.processQueue()
  }

  @action
  private async executeTask(task: ActionTask): Promise<void> {
    task.status = 'running'
    task.startedAt = Date.now()
    this.runningCount++
    this.notifyTaskListeners(task.id, task)
    this.notifyQueueListeners()

    try {
      const result = await Promise.race([
        task.context.model.actions[task.action.name](task.params),
        this.timeout(this.config.timeout)
      ])

      runInAction(() => {
        task.status = 'success'
        task.result = result
        task.completedAt = Date.now()
        this.runningCount--
      })

      task.action.onSuccess?.(result, task.context)

    } catch (error) {
      runInAction(() => {
        task.error = error as Error
        this.runningCount--

        if (task.retryCount < task.maxRetries) {
          task.status = 'pending'
          task.retryCount++
        } else {
          task.status = 'failed'
          task.completedAt = Date.now()
        }
      })

      // 检查任务是否最终失败（不再重试）
      if (task.retryCount >= task.maxRetries) {
        task.action.onError?.(error as Error, task.context)
      }
    }

    this.notifyTaskListeners(task.id, task)
    this.notifyQueueListeners()
  }

  private timeout(ms: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Action timeout')), ms)
    })
  }

  private notifyTaskListeners(taskId: string, task: ActionTask): void {
    this.taskListeners.get(taskId)?.forEach(listener => listener(task))
  }

  private notifyQueueListeners(): void {
    this.queueListeners.forEach(listener => listener(this))
  }

  private generateTaskId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

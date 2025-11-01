import type { IRenderer, RendererCategory } from './types'

/**
 * 统一的渲染器注册表
 * 管理所有类型的渲染器：view、group、field、data、action
 */
export class RendererRegistry {
  private static instance: RendererRegistry
  private renderers = new Map<string, IRenderer>()

  private constructor() {}

  static getInstance(): RendererRegistry {
    if (!RendererRegistry.instance) {
      RendererRegistry.instance = new RendererRegistry()
    }
    return RendererRegistry.instance
  }

  /**
   * 注册单个渲染器
   */
  register(renderer: IRenderer): void {
    const key = `${renderer.category}:${renderer.type}`
    this.renderers.set(key, renderer)
  }

  /**
   * 批量注册渲染器
   */
  registerMany(renderers: IRenderer[]): void {
    renderers.forEach(renderer => this.register(renderer))
  }

  /**
   * 获取渲染器
   */
  get(category: RendererCategory, type: string): IRenderer | undefined {
    const key = `${category}:${type}`
    return this.renderers.get(key)
  }

  /**
   * 获取某个分类的所有渲染器
   */
  getByCategory(category: RendererCategory): IRenderer[] {
    return Array.from(this.renderers.entries())
      .filter(([key]) => key.startsWith(`${category}:`))
      .map(([, renderer]) => renderer)
  }

  /**
   * 获取所有渲染器类型
   */
  getTypes(category: RendererCategory): string[] {
    return this.getByCategory(category).map(renderer => renderer.type)
  }

  /**
   * 检查是否存在
   */
  has(category: RendererCategory, type: string): boolean {
    const key = `${category}:${type}`
    return this.renderers.has(key)
  }

  /**
   * 取消注册
   */
  unregister(category: RendererCategory, type: string): boolean {
    const key = `${category}:${type}`
    return this.renderers.delete(key)
  }

  /**
   * 清空某个分类
   */
  clearCategory(category: RendererCategory): void {
    const keys = Array.from(this.renderers.keys())
      .filter(key => key.startsWith(`${category}:`))
    keys.forEach(key => this.renderers.delete(key))
  }

  /**
   * 清空所有
   */
  clear(): void {
    this.renderers.clear()
  }

  /**
   * 获取统计信息
   */
  getStats(): Record<RendererCategory, number> {
    const stats: Record<RendererCategory, number> = {
      view: 0,
      group: 0,
      field: 0,
      data: 0,
      action: 0
    }

    for (const [key] of this.renderers) {
      const category = key.split(':')[0] as RendererCategory
      if (stats[category] !== undefined) {
        stats[category]++
      }
    }

    return stats
  }

  /**
   * 获取所有渲染器的键列表
   */
  getAllKeys(): string[] {
    return Array.from(this.renderers.keys())
  }

  /**
   * 获取渲染器总数
   */
  size(): number {
    return this.renderers.size
  }
}
/**
 * 创建默认的组件映射
 */
export const createDefaultComponentMap = () => {
  return {
    // 基础 HTML 元素
    div: 'div',
    span: 'span',
    p: 'p',
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    h4: 'h4',
    h5: 'h5',
    h6: 'h6',

    // 表单元素
    form: 'form',
    input: 'input',
    textarea: 'textarea',
    select: 'select',
    option: 'option',
    button: 'button',
    label: 'label',

    // 列表元素
    ul: 'ul',
    ol: 'ol',
    li: 'li',

    // 表格元素
    table: 'table',
    thead: 'thead',
    tbody: 'tbody',
    tr: 'tr',
    th: 'th',
    td: 'td',

    // 链接和媒体
    a: 'a',
    img: 'img',

    // 图标
    i: 'i'
  }
}

/**
 * 创建渲染器工厂函数
 */
export const createRendererFactory = <T>(
  category: string,
  type: string,
  renderFn: T
) => {
  return {
    category,
    type,
    render: renderFn
  }
}

/**
 * 深度合并对象
 */
export const deepMerge = <T extends Record<string, any>>(target: T, source: Partial<T>): T => {
  const result = { ...target }

  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(result[key] || {}, source[key])
    } else {
      result[key] = source[key] as T[typeof key]
    }
  }

  return result
}

/**
 * 生成唯一 ID
 */
export const generateId = (prefix: string = 'render'): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 类型守卫：检查是否为有效的渲染器
 */
export const isValidRenderer = (obj: any): obj is { category: string; type: string; render: Function } => {
  return obj &&
    typeof obj === 'object' &&
    typeof obj.category === 'string' &&
    typeof obj.type === 'string' &&
    typeof obj.render === 'function'
}

/**
 * 错误处理工具
 */
export class RenderError extends Error {
  constructor(
    message: string,
    public readonly category?: string,
    public readonly type?: string,
    public readonly context?: any
  ) {
    super(message)
    this.name = 'RenderError'
  }
}

/**
 * 性能监控工具
 */
export const createPerformanceMonitor = () => {
  const timers = new Map<string, number>()

  return {
    start: (label: string) => {
      timers.set(label, performance.now())
    },

    end: (label: string): number => {
      const startTime = timers.get(label)
      if (!startTime) {
        console.warn(`No timer found for label: ${label}`)
        return 0
      }

      const duration = performance.now() - startTime
      timers.delete(label)
      return duration
    },

    measure: <T>(label: string, fn: () => T): T => {
      const startTime = performance.now()
      try {
        return fn()
      } finally {
        const duration = performance.now() - startTime
        console.debug(`${label} took ${duration.toFixed(2)}ms`)
      }
    }
  }
}
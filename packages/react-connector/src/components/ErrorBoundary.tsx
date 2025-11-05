import React, { Component, ReactNode, ErrorInfo } from 'react'

/**
 * ErrorBoundary Props
 */
export interface ErrorBoundaryProps {
  /** 子元素 */
  children: ReactNode
  /** 错误发生时的回退 UI */
  fallback?: (error: Error, errorInfo: ErrorInfo) => ReactNode
  /** 错误回调 */
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  /** 重置键，改变时会重置错误状态 */
  resetKeys?: any[]
}

/**
 * ErrorBoundary State
 */
interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

/**
 * ErrorBoundary 组件
 *
 * 捕获渲染错误，防止整个应用崩溃
 *
 * @example
 * ```tsx
 * <ErrorBoundary
 *   fallback={(error, errorInfo) => (
 *     <div>
 *       <h2>渲染错误</h2>
 *       <p>{error.message}</p>
 *     </div>
 *   )}
 *   onError={(error, errorInfo) => {
 *     console.error('Error caught by boundary:', error, errorInfo)
 *   }}
 * >
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // 更新 state 使下一次渲染能够显示降级后的 UI
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // 记录错误信息
    this.setState({
      errorInfo
    })

    // 调用错误回调
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // 在开发模式下输出错误
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary] Caught error:', error, errorInfo)
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    // 如果 resetKeys 改变，重置错误状态
    if (this.props.resetKeys && prevProps.resetKeys) {
      const hasResetKeyChanged = this.props.resetKeys.some(
        (key, index) => key !== prevProps.resetKeys![index]
      )

      if (hasResetKeyChanged && this.state.hasError) {
        this.setState({
          hasError: false,
          error: null,
          errorInfo: null
        })
      }
    }
  }

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      // 使用自定义 fallback
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.state.errorInfo!)
      }

      // 默认错误 UI
      return (
        <div
          style={{
            padding: '20px',
            margin: '20px 0',
            border: '1px solid #f5c6cb',
            borderRadius: '4px',
            backgroundColor: '#f8d7da',
            color: '#721c24'
          }}
        >
          <h3 style={{ margin: '0 0 10px 0' }}>渲染错误</h3>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>
            {this.state.error.message}
          </p>
          {import.meta.env.DEV && this.state.errorInfo && (
            <details style={{ whiteSpace: 'pre-wrap', fontSize: '12px' }}>
              <summary style={{ cursor: 'pointer', marginBottom: '10px' }}>
                查看详细信息
              </summary>
              <pre style={{ overflow: 'auto' }}>
                {this.state.error.stack}
                {'\n\n'}
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * RenderErrorBoundary - 专门用于渲染器的错误边界
 *
 * 提供更友好的错误提示
 */
export interface RenderErrorBoundaryProps {
  children: ReactNode
  componentName?: string
}

export const RenderErrorBoundary: React.FC<RenderErrorBoundaryProps> = ({
  children,
  componentName = '组件'
}) => {
  return (
    <ErrorBoundary
      fallback={(error) => (
        <div
          style={{
            padding: '16px',
            margin: '8px 0',
            border: '1px solid #ffccc7',
            borderRadius: '4px',
            backgroundColor: '#fff2f0',
            color: '#cf1322'
          }}
        >
          <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
            ⚠️ {componentName} 渲染失败
          </div>
          <div style={{ fontSize: '14px', color: '#8c8c8c' }}>
            {error.message}
          </div>
        </div>
      )}
      onError={(error, errorInfo) => {
        // 可以在这里上报错误到监控系统
        if (import.meta.env.DEV) {
          console.error(`[RenderErrorBoundary] ${componentName} error:`, error, errorInfo)
        }
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

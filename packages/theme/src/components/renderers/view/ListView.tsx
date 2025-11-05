import { useState, memo } from 'react'
import { Card, CardContent } from '../../../components/ui/card'
import type { ViewRendererProps } from '../../../types'
import { useRenderContext, useModelAction } from '@schema-component/react-connector'
import { ActionRenderer } from '../action/ActionRenderer'
import { cn } from '../../../lib/utils'

/**
 * ListView renderer
 * Renders data as a list of cards
 */
export const ListView = memo(function ListView({
  view,
  data: propData = [],
  actions = [],
  mode = 'view',
  className,
  schema,
  loading: propLoading = false,
  error: propError,
  onAction,
}: ViewRendererProps) {
  // 🔍 DEBUG: 追踪组件渲染
  console.log('[ListView] 🔄 Component RENDER', {
    timestamp: new Date().toISOString(),
    viewType: view?.type,
    dataLength: Array.isArray(propData) ? propData.length : 0,
    mode,
    loading: propLoading,
    hasError: !!propError,
    fieldsLength: view.fields?.length || 0
  })

  // 使用 RenderContext 进行渲染
  const context = useRenderContext()
  console.log('[ListView] 📦 useRenderContext called', { contextId: (context as any)?._id || 'no-id' })

  // 使用传入的数据
  const data = propData
  const loading = propLoading
  const error = propError

  // 操作执行状态
  const [executingActionKey, setExecutingActionKey] = useState<string | null>(null)
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // 使用 useModelAction 处理操作
  const { execute, state: actionState } = useModelAction({
    onSuccess: () => {
      console.log('[ListView] ✅ Action SUCCESS')
      setActionFeedback({ type: 'success', message: '操作成功' })
      setExecutingActionKey(null)
      // 3秒后清除成功消息
      setTimeout(() => setActionFeedback(null), 3000)
    },
    onError: (error) => {
      console.log('[ListView] ❌ Action ERROR', error.message)
      setActionFeedback({ type: 'error', message: error.message || '操作失败' })
      setExecutingActionKey(null)
    }
  })

  const fields = view.fields || []
  const dataArray = Array.isArray(data) ? data : (data ? [data] : [])

  // 处理操作点击
  const handleAction = async (action: any, item: any, itemIndex: number, actionIndex: number) => {
    console.log('[ListView] 🚀 handleAction CALLED', { itemIndex, actionIndex })

    if (onAction) {
      onAction(action.name)
    }

    // 设置正在执行的 action（使用 itemIndex-actionIndex 组合作为 key）
    setExecutingActionKey(`${itemIndex}-${actionIndex}`)

    // 执行操作
    await execute(action, item)
  }

  // 渲染单个字段的辅助函数
  const renderField = (fieldName: string, item: any) => {
    console.log('[ListView] 🎨 renderField CALLED', { fieldName })

    const fieldDef = schema?.fields?.[fieldName]
    if (!fieldDef) {
      console.warn(`[ListView] Field "${fieldName}" not found in schema`)
      return null
    }

    // 使用 label、description 或 fieldName 作为标签
    const label = fieldDef.options?.label || fieldDef.options?.description || fieldName

    // 使用 context.renderData 渲染字段值
    const fieldElement = context.renderData(
      {
        ...fieldDef,
        name: fieldName,
      },
      item[fieldName]
    )

    return (
      <div key={fieldName} className="flex flex-col gap-1">
        <dt className="text-sm font-medium text-muted-foreground">
          {label}
        </dt>
        <dd>
          {fieldElement}
        </dd>
      </div>
    )
  }

  // Loading 状态
  if (loading) {
    return (
      <div className={cn('flex items-center justify-center p-8', className)}>
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
          <p className="text-sm text-muted-foreground">加载中...</p>
        </div>
      </div>
    )
  }

  // Error 状态
  if (error) {
    return (
      <div className={cn('p-4 border border-red-300 bg-red-50 rounded-md', className)}>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-800">加载失败</h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* 标题 */}
      {view.title && (
        <div className="border-b border-gray-200 pb-4">
          <h2 className="text-2xl font-semibold text-gray-900">{view.title}</h2>
          {view.description && (
            <p className="mt-1 text-sm text-gray-600">{view.description}</p>
          )}
        </div>
      )}

      {/* 操作反馈消息 */}
      {actionFeedback && (
        <div
          className={cn(
            'p-4 rounded-md border',
            actionFeedback.type === 'success'
              ? 'bg-green-50 border-green-300 text-green-800'
              : 'bg-red-50 border-red-300 text-red-800'
          )}
        >
          <div className="flex items-center gap-2">
            {actionFeedback.type === 'success' ? (
              <svg
                className="h-5 w-5 text-green-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                className="h-5 w-5 text-red-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            <p className="text-sm font-medium">{actionFeedback.message}</p>
          </div>
        </div>
      )}

      {/* Render list items */}
      {dataArray.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No data available
          </CardContent>
        </Card>
      ) : (
        dataArray.map((item, itemIndex) => (
          <Card key={item.id || itemIndex}>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Render fields */}
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {fields.map((fieldName: string) => renderField(fieldName, item))}
                </dl>

                {/* Render actions */}
                {actions.length > 0 && (
                  <div className="flex gap-2 pt-2 border-t">
                    {actions.map((action, actionIndex) => {
                      const actionKey = `${itemIndex}-${actionIndex}`
                      const isExecuting = executingActionKey === actionKey && actionState.loading
                      return (
                        <ActionRenderer
                          key={actionIndex}
                          action={action}
                          onClick={() => handleAction(action, item, itemIndex, actionIndex)}
                          disabled={actionState.loading}
                          loading={isExecuting}
                          className={cn(
                            'px-3 py-1 text-xs rounded-md font-medium transition-colors',
                            'hover:bg-gray-100',
                            'disabled:opacity-50 disabled:cursor-not-allowed',
                            (action as any).buttonType === 'danger'
                              ? 'text-red-600 hover:bg-red-50'
                              : 'text-gray-700'
                          )}
                        />
                      )
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
})

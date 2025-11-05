import { useState, memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import type { ViewRendererProps } from '../../../types'
import { useRenderContext, useModelAction } from '@schema-component/react-connector'
import { ActionRenderer } from '../action/ActionRenderer'
import { cn } from '../../../lib/utils'

/**
 * DetailView renderer
 * Renders data in a detail/read-only view with support for groups and actions
 */
export const DetailView = memo(function DetailView({
  view,
  data: propData = {},
  actions = [],
  className,
  schema,
  loading: propLoading = false,
  error: propError,
  onAction,
}: ViewRendererProps) {
  // 🔍 DEBUG: 追踪组件渲染
  console.log('[DetailView] 🔄 Component RENDER', {
    timestamp: new Date().toISOString(),
    viewType: view?.type,
    dataKeys: Object.keys(propData || {}),
    loading: propLoading,
    hasError: !!propError,
    groupsLength: view.groups?.length || 0,
    fieldsLength: view.fields?.length || 0
  })

  // 使用 RenderContext 进行渲染
  const context = useRenderContext()
  console.log('[DetailView] 📦 useRenderContext called', { contextId: (context as any)?._id || 'no-id' })

  // 使用传入的数据
  const data = propData
  const loading = propLoading
  const error = propError

  // 操作执行状态
  const [executingActionIndex, setExecutingActionIndex] = useState<number | null>(null)
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // 使用 useModelAction 处理操作
  const { execute, state: actionState } = useModelAction({
    onSuccess: () => {
      console.log('[DetailView] ✅ Action SUCCESS')
      setActionFeedback({ type: 'success', message: '操作成功' })
      setExecutingActionIndex(null)
      // 3秒后清除成功消息
      setTimeout(() => setActionFeedback(null), 3000)
    },
    onError: (error) => {
      console.log('[DetailView] ❌ Action ERROR', error.message)
      setActionFeedback({ type: 'error', message: error.message || '操作失败' })
      setExecutingActionIndex(null)
    }
  })

  const fields = view.fields || []
  const groups = view.groups || []

  // 处理操作点击
  const handleAction = async (action: any, actionIndex: number) => {
    console.log('[DetailView] 🚀 handleAction CALLED', { actionIndex })

    if (onAction) {
      onAction(action.name)
    }

    // 设置正在执行的 action
    setExecutingActionIndex(actionIndex)

    // 执行操作
    await execute(action, data)
  }

  // 渲染单个字段的辅助函数
  const renderField = (fieldName: string) => {
    console.log('[DetailView] 🎨 renderField CALLED', { fieldName })

    const fieldDef = schema?.fields?.[fieldName]
    if (!fieldDef) {
      console.warn(`[DetailView] Field "${fieldName}" not found in schema`)
      return null
    }

    // 使用 label、description 或 fieldName 作为标签
    const label = fieldDef.label || fieldDef.description || fieldName

    // 使用 context.renderData 渲染字段值
    const fieldElement = context.renderData(
      {
        name: fieldName,
        type: fieldDef.type,
        ...fieldDef
      },
      data[fieldName]
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
    <div className={cn('space-y-6', className)}>
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

      {/* Render groups if available */}
      {groups.length > 0 ? (
        groups.map((group: any, index: number) => (
          <Card key={index}>
            {group.title && (
              <CardHeader>
                <CardTitle>{group.title}</CardTitle>
              </CardHeader>
            )}
            <CardContent>
              <dl className="space-y-4">
                {group.fields?.map((fieldName: string) => renderField(fieldName))}
              </dl>
            </CardContent>
          </Card>
        ))
      ) : (
        /* Render flat fields if no groups */
        <Card>
          <CardContent className="pt-6">
            <dl className="space-y-4">
              {fields.map((fieldName: string) => renderField(fieldName))}
            </dl>
          </CardContent>
        </Card>
      )}

      {/* Render actions */}
      {actions.length > 0 && (
        <div className="flex gap-2 pt-4">
          {actions.map((action, index) => {
            const isExecuting = executingActionIndex === index && actionState.loading
            return (
              <ActionRenderer
                key={index}
                action={action}
                onClick={() => handleAction(action, index)}
                disabled={actionState.loading}
                loading={isExecuting}
                className={cn(
                  'px-4 py-2 rounded-md font-medium text-sm transition-colors',
                  'bg-primary text-primary-foreground hover:bg-primary/90',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  actionState.loading && 'cursor-wait'
                )}
              />
            )
          })}
        </div>
      )}
    </div>
  )
})

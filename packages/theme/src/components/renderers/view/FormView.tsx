import { useState, useEffect, useCallback, useMemo, memo } from 'react'
import type { ViewRendererProps } from '../../../types'
import { useModelAction, useRenderContext } from '@schema-component/react-connector'
import { GroupRenderer } from '../group/GroupRenderer'
import { ActionRenderer } from '../action/ActionRenderer'
import { cn } from '../../../lib/utils'
import { validateField, validateForm } from '../../../utils/validation'

/**
 * FormView renderer
 * Renders a form with fields and actions
 */
export const FormView = memo(function FormView({
  view,
  data = {},
  onChange,
  actions = [],
  mode = 'edit',
  className,
  schema,
  loading = false,
  error,
}: ViewRendererProps) {
  // 🔍 DEBUG: 追踪组件渲染
  console.log('[FormView] 🔄 Component RENDER', {
    timestamp: new Date().toISOString(),
    viewType: view?.type,
    dataKeys: Object.keys(data || {}),
    dataIsNewObject: true, // data 是否是新对象
    mode,
    loading,
    hasError: !!error,
    groupsLength: view.groups?.length || 0,
    fieldsLength: view.fields?.length || 0
  })

  // 使用 RenderContext 进行渲染
  const context = useRenderContext()
  console.log('[FormView] 📦 useRenderContext called', { contextId: (context as any)?._id || 'no-id' })

  // 验证错误状态
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({})

  // 操作执行状态
  const [submitFeedback, setSubmitFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [executingActionIndex, setExecutingActionIndex] = useState<number | null>(null)

  // 使用 useModelAction 处理操作
  const { execute, state: actionState } = useModelAction({
    onSuccess: () => {
      console.log('[FormView] ✅ Action SUCCESS callback')
      setSubmitFeedback({ type: 'success', message: '操作成功' })
      setExecutingActionIndex(null)
      // 3秒后清除成功消息
      setTimeout(() => setSubmitFeedback(null), 3000)
    },
    onError: (error) => {
      console.log('[FormView] ❌ Action ERROR callback', error.message)
      setSubmitFeedback({ type: 'error', message: error.message || '操作失败' })
      setExecutingActionIndex(null)
    }
  })
  console.log('[FormView] 🎬 useModelAction state', actionState)

  const groups = view.groups || []
  const fields = view.fields || []

  // 在表单数据变化时进行验证
  useEffect(() => {
    console.log('[FormView] ⚡ useEffect VALIDATION triggered', {
      mode,
      dataKeys: Object.keys(data || {}),
      groupsLength: groups.length,
      fieldsLength: fields.length
    })

    if (mode === 'edit' || mode === 'create') {
      const allFields = groups.length > 0
        ? groups.flatMap((g: any) => g.fields || [])
        : fields

      const errors: Record<string, string[]> = {}
      for (const fieldName of allFields) {
        const fieldErrors = validateField(fieldName, data[fieldName], schema)
        if (fieldErrors.length > 0) {
          errors[fieldName] = fieldErrors
        }
      }
      console.log('[FormView] 📝 Validation completed', { errorCount: Object.keys(errors).length })
      setValidationErrors(errors)
    }
  }, [data, groups, fields, mode, schema])

  // 表单提交处理
  const handleSubmit = useCallback(async (action: any, actionIndex: number) => {
    console.log('[FormView] 🚀 handleSubmit CALLED', { actionIndex })
    // 验证整个表单
    const allFields = groups.length > 0
      ? groups.flatMap((g: any) => g.fields || [])
      : fields

    const validationResult = validateForm(data, schema, allFields)

    if (!validationResult.valid) {
      // 显示验证错误
      setValidationErrors(validationResult.errors)
      setSubmitFeedback({
        type: 'error',
        message: '表单验证失败，请检查输入'
      })
      return
    }

    // 设置正在执行的 action
    setExecutingActionIndex(actionIndex)

    // 执行操作
    try {
      await execute(action, data)
    } catch (error) {
      // 错误已经在 useModelAction 的 onError 中处理
    }
  }, [data, schema, groups, fields, execute])
  console.log('[FormView] 🔁 handleSubmit deps', {
    hasData: !!data,
    hasSchema: !!schema,
    groupsLength: groups.length,
    fieldsLength: fields.length,
    hasExecute: !!execute
  })

  // 字段变更处理
  const handleFieldChange = useCallback((fieldName: string, value: any) => {
    console.log('[FormView] ✏️ handleFieldChange CALLED', { fieldName, value })
    if (onChange) {
      onChange({ ...data, [fieldName]: value })
    }
  }, [data, onChange])
  console.log('[FormView] 🔁 handleFieldChange deps', { hasData: !!data, hasOnChange: !!onChange })

  // 渲染单个字段的辅助函数 - 使用 useCallback 防止重新渲染
  const renderField = useCallback((fieldName: string) => {
    console.log('[FormView] 🎨 renderField CALLED', { fieldName })

    const fieldDef = schema.fields[fieldName]
    if (!fieldDef) return null

    // 获取字段的验证错误
    const fieldErrors = validationErrors[fieldName] || []

    // 构造完整的 FieldDefinition（包含 name）
    const fieldDefinition = {
      name: fieldName,
      ...fieldDef
    }

    // 使用 context.renderField 进行渲染
    return context.renderField(
      fieldDefinition,
      {
        value: data[fieldName],
        record: data
      },
      {
        mode: mode === 'create' ? 'edit' : mode,
        required: fieldDef.options?.required ?? false,
        errors: fieldErrors
      }
    )
  }, [schema, data, validationErrors, mode, context])
  console.log('[FormView] 🔁 renderField deps', {
    hasSchema: !!schema,
    hasData: !!data,
    validationErrorsCount: Object.keys(validationErrors).length,
    mode,
    hasContext: !!context
  })

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

      {/* 提交反馈消息 */}
      {submitFeedback && (
        <div
          className={cn(
            'p-4 rounded-md border',
            submitFeedback.type === 'success'
              ? 'bg-green-50 border-green-300 text-green-800'
              : 'bg-red-50 border-red-300 text-red-800'
          )}
        >
          <div className="flex items-center gap-2">
            {submitFeedback.type === 'success' ? (
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
            <p className="text-sm font-medium">{submitFeedback.message}</p>
          </div>
        </div>
      )}

      {/* Render groups if available */}
      {groups.length > 0 ? (
        groups.map((group: any, index: number) => (
          <GroupRenderer key={index} group={group} schema={schema} data={data}>
            {group.fields?.map((fieldName: string) => (
              <div key={fieldName}>
                {renderField(fieldName)}
              </div>
            ))}
          </GroupRenderer>
        ))
      ) : (
        /* Render flat fields if no groups */
        <div className={cn(
          view.layout === 'grid' && view.layoutOptions?.columns
            ? `grid gap-4`
            : 'space-y-4'
        )} style={
          view.layout === 'grid' && view.layoutOptions?.columns
            ? { gridTemplateColumns: `repeat(${view.layoutOptions.columns}, minmax(0, 1fr))` }
            : undefined
        }>
          {fields.map((fieldName: string) => (
            <div key={fieldName}>
              {renderField(fieldName)}
            </div>
          ))}
        </div>
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
                onClick={() => handleSubmit(action, index)}
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

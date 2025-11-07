import { useState, useEffect, memo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table'
import type { ViewRendererProps } from '../../../types'
import { DataRenderer } from '../data/DataRenderer'
import { ActionRenderer } from '../action/ActionRenderer'
import { useRenderContext, useModelAction } from '@schema-component/react-connector'
import { cn } from '../../../lib/utils'

/**
 * TableView renderer
 * Renders data in a table format with pagination and actions
 */
export const TableView = memo(function TableView({
  view,
  data: propData,
  actions = [],
  mode = 'view',
  className,
  schema,
  loading: propLoading = false,
  error: propError,
  onChange,
  onAction,
}: ViewRendererProps) {
  // 🔍 DEBUG: 追踪组件渲染
  console.log('[TableView] 🔄 Component RENDER', {
    timestamp: new Date().toISOString(),
    viewType: view?.type,
    hasPropData: !!propData,
    propDataLength: Array.isArray(propData) ? propData.length : 0,
    mode,
    propLoading,
    hasPropError: !!propError,
  })

  // 使用 RenderContext
  const context = useRenderContext()
  console.log('[TableView] 📦 useRenderContext called', { contextId: (context as any)?._id || 'no-id' })

  // 使用传入的数据
  const data = propData || []
  const loading = propLoading
  const error = propError

  // 使用 useModelAction 处理行操作
  const { execute, state: actionState } = useModelAction({
    onSuccess: () => {
      console.log('[TableView] ✅ Action SUCCESS')
      // 刷新数据
      if (onChange) {
        onChange(data)
      }
    },
    onError: (error) => {
      console.log('[TableView] ❌ Action ERROR', error.message)
    }
  })

  // 分页状态
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(view.options?.pageSize || 10)

  const fields = view.fields || []
  const dataArray = Array.isArray(data) ? data : (data ? [data] : [])

  // 区分 header actions 和 row actions
  // Header actions: 从 view.options.headerActions 或 actions prop 获取（当没有 rowActions 时）
  // Row actions: 从 view.options.rowActions 获取
  const rowActions = (view.options as any)?.rowActions || []
  const headerActions = (view.options as any)?.headerActions || (rowActions.length === 0 ? actions : [])

  // 计算分页
  const totalItems = dataArray.length
  const totalPages = Math.ceil(totalItems / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedData = dataArray.slice(startIndex, endIndex)

  // 重置页码当数据变化时
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  // 处理行操作
  const handleAction = async (action: any, rowData: any) => {
    console.log('[TableView] 🚀 handleAction CALLED', { action: action.name, rowData })

    if (onAction) {
      onAction(action.name)
    }

    // 使用 useModelAction 执行操作
    await execute(action, rowData)
  }

  // Loading 状态
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
          <span>Loading...</span>
        </div>
      </div>
    )
  }

  // Error 状态
  if (error) {
    return (
      <div className="rounded-md bg-red-50 border border-red-300 p-4">
        <div className="flex items-start gap-2">
          <svg
            className="h-5 w-5 text-red-400 mt-0.5"
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

      {/* Header Actions */}
      {headerActions.length > 0 && (
        <div className="flex gap-2 justify-end">
          {headerActions.map((action: any, index: number) => (
            <ActionRenderer
              key={index}
              action={action}
              onClick={() => {
                console.log('[TableView] 🚀 Header action CALLED', { action: action.name })
                if (onAction) {
                  onAction(action.name)
                }
                // Header actions 不需要 row data
                execute(action, null)
              }}
              disabled={actionState.loading}
              loading={actionState.loading}
              className={cn(
                'px-4 py-2 rounded-md font-medium text-sm transition-colors',
                'bg-primary text-primary-foreground hover:bg-primary/90',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            />
          ))}
        </div>
      )}

      {/* 表格 */}
      <Table>
        <TableHeader>
          <TableRow>
            {fields.map((fieldName: string) => {
              const fieldDef = schema?.fields?.[fieldName]
              const label = fieldDef?.options?.label || fieldDef?.options?.description || fieldName
              return <TableHead key={fieldName}>{label}</TableHead>
            })}
            {rowActions.length > 0 && <TableHead className="w-[120px]">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={fields.length + (rowActions.length > 0 ? 1 : 0)}
                className="text-center text-muted-foreground h-32"
              >
                No data available
              </TableCell>
            </TableRow>
          ) : (
            paginatedData.map((row, rowIndex) => (
              <TableRow key={row.id || rowIndex}>
                {fields.map((fieldName: string) => {
                  const fieldDef = schema?.fields?.[fieldName]
                  if (!fieldDef) return <TableCell key={fieldName}>-</TableCell>

                  return (
                    <TableCell key={fieldName}>
                      <DataRenderer
                        field={fieldDef}
                        name={fieldName}
                        value={row[fieldName]}
                        mode={mode}
                        schema={schema}
                      />
                    </TableCell>
                  )
                })}
                {rowActions.length > 0 && (
                  <TableCell>
                    <div className="flex gap-2">
                      {rowActions.map((action: any, actionIndex: number) => (
                        <ActionRenderer
                          key={actionIndex}
                          action={action}
                          onClick={() => handleAction(action, row)}
                          disabled={actionState.loading}
                          loading={actionState.loading}
                          className={cn(
                            'px-3 py-1 text-xs rounded-md font-medium transition-colors',
                            'hover:bg-gray-100',
                            'disabled:opacity-50 disabled:cursor-not-allowed',
                            (action as any).buttonType === 'danger'
                              ? 'text-red-600 hover:bg-red-50'
                              : 'text-gray-700'
                          )}
                        />
                      ))}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-gray-600">
            Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} items
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={cn(
                      'px-3 py-1 text-sm rounded-md',
                      currentPage === page
                        ? 'bg-primary text-white'
                        : 'border hover:bg-gray-50'
                    )}
                  >
                    {page}
                  </button>
                )
              })}
              {totalPages > 5 && <span className="px-2 text-sm text-gray-500">...</span>}
            </div>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
})

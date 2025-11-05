import { useState, useEffect, useCallback } from 'react'
import { useApi } from '../context/RenderContext'

/**
 * useModelData Hook 的选项
 */
export interface UseModelDataOptions {
  /** 数据 ID (用于 getOne) */
  id?: string | number
  /** 查询参数 (用于 getList) */
  params?: any
  /** 是否自动获取数据 */
  autoFetch?: boolean
  /** 数据依赖项，当这些值变化时重新获取数据 */
  deps?: any[]
  /** 成功回调 */
  onSuccess?: (data: any) => void
  /** 错误回调 */
  onError?: (error: Error) => void
}

/**
 * useModelData Hook 的返回值
 */
export interface UseModelDataResult<T = any> {
  /** 数据 */
  data: T | null
  /** 加载状态 */
  loading: boolean
  /** 错误信息 */
  error: string | null
  /** 手动刷新数据 */
  refetch: () => Promise<void>
  /** 设置数据（用于乐观更新） */
  setData: (data: T | null) => void
}

/**
 * useModelData Hook
 *
 * 简化数据获取逻辑，统一 loading/error 状态管理
 *
 * @example
 * ```tsx
 * // 获取列表数据
 * const { data, loading, error, refetch } = useModelData({
 *   params: { page: 1, size: 10 }
 * })
 *
 * // 获取单条数据
 * const { data, loading, error } = useModelData({
 *   id: userId
 * })
 *
 * // 手动控制获取
 * const { data, refetch } = useModelData({
 *   autoFetch: false
 * })
 * ```
 */
export function useModelData<T = any>(
  options: UseModelDataOptions = {}
): UseModelDataResult<T> {
  const {
    id,
    params,
    autoFetch = true,
    deps = [],
    onSuccess,
    onError
  } = options

  const api = useApi()

  // 状态
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState<boolean>(autoFetch)
  const [error, setError] = useState<string | null>(null)

  // 获取数据的核心逻辑
  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      let result: any

      // 根据是否有 id 决定调用 getOne 还是 getList
      if (id !== undefined && id !== null) {
        result = await api.getOne(id)
      } else {
        result = await api.getList(params)
      }

      setData(result)

      // 调用成功回调
      if (onSuccess) {
        onSuccess(result)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      setError(errorMessage)

      // 调用错误回调
      if (onError && err instanceof Error) {
        onError(err)
      }

      // 在开发模式下输出错误
      if (process.env.NODE_ENV === 'development') {
        console.error('[useModelData] Error fetching data:', err)
      }
    } finally {
      setLoading(false)
    }
  }, [api, id, JSON.stringify(params), onSuccess, onError])

  // 自动获取数据
  useEffect(() => {
    if (autoFetch) {
      fetchData()
    }
  }, [fetchData, autoFetch, ...deps])

  // 返回结果
  return {
    data,
    loading,
    error,
    refetch: fetchData,
    setData
  }
}

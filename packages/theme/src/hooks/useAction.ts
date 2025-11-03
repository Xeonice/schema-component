import { useState, useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { ActionDefinition } from '@schema-component/engine'
import { getActionExecutor } from '../actions/ActionExecutor'
import type { ActionContext, ActionResult } from '../actions/ActionExecutor'

/**
 * Hook to execute an action
 */
export function useAction(action: ActionDefinition) {
  const executor = getActionExecutor()
  const queryClient = useQueryClient()
  const [isExecuting, setIsExecuting] = useState(false)

  const execute = useCallback(
    async (context: ActionContext = {}) => {
      setIsExecuting(true)
      try {
        const result = await executor.execute(action, context)

        // Refresh queries if needed
        if (result.success && result.refresh) {
          queryClient.invalidateQueries()
        }

        return result
      } finally {
        setIsExecuting(false)
      }
    },
    [action, executor, queryClient]
  )

  return {
    execute,
    isExecuting,
  }
}

/**
 * Hook to execute an action with React Query mutation
 */
export function useActionMutation(action: ActionDefinition) {
  const executor = getActionExecutor()
  const queryClient = useQueryClient()

  return useMutation<ActionResult, Error, ActionContext, unknown>({
    mutationFn: (context) => executor.execute(action, context),
    onSuccess: (result) => {
      if (result.success && result.refresh) {
        queryClient.invalidateQueries()
      }
    },
  })
}

/**
 * Hook to execute multiple actions in sequence
 */
export function useActionSequence(actions: ActionDefinition[]) {
  const executor = getActionExecutor()
  const queryClient = useQueryClient()
  const [isExecuting, setIsExecuting] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  const execute = useCallback(
    async (context: ActionContext = {}) => {
      setIsExecuting(true)
      setCurrentIndex(0)

      const results: ActionResult[] = []
      let shouldRefresh = false

      try {
        for (let i = 0; i < actions.length; i++) {
          setCurrentIndex(i)
          const result = await executor.execute(actions[i], context)
          results.push(result)

          // Stop if any action fails
          if (!result.success) {
            break
          }

          // Track if any action requires refresh
          if (result.refresh) {
            shouldRefresh = true
          }
        }

        // Refresh queries if needed
        if (shouldRefresh) {
          queryClient.invalidateQueries()
        }

        return results
      } finally {
        setIsExecuting(false)
        setCurrentIndex(0)
      }
    },
    [actions, executor, queryClient]
  )

  return {
    execute,
    isExecuting,
    currentIndex,
    total: actions.length,
  }
}

/**
 * Hook to execute batch actions on multiple records
 */
export function useBatchAction(action: ActionDefinition) {
  const executor = getActionExecutor()
  const queryClient = useQueryClient()
  const [isExecuting, setIsExecuting] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0 })

  const execute = useCallback(
    async (records: any[]) => {
      if (records.length === 0) {
        return []
      }

      setIsExecuting(true)
      setProgress({ current: 0, total: records.length })

      const results: ActionResult[] = []
      let shouldRefresh = false

      try {
        for (let i = 0; i < records.length; i++) {
          const result = await executor.execute(action, { data: records[i] })
          results.push(result)
          setProgress({ current: i + 1, total: records.length })

          if (result.refresh) {
            shouldRefresh = true
          }
        }

        // Refresh queries if needed
        if (shouldRefresh) {
          queryClient.invalidateQueries()
        }

        return results
      } finally {
        setIsExecuting(false)
        setProgress({ current: 0, total: 0 })
      }
    },
    [action, executor, queryClient]
  )

  return {
    execute,
    isExecuting,
    progress,
  }
}

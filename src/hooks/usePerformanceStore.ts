import { useMemo, useSyncExternalStore } from 'react'
import { getPerformanceGoals, subscribePerformanceStore } from '../data/performanceStore'

/**
 * Subscribe to the store snapshot (stable array ref). Filter in useMemo — never filter
 * inside getSnapshot or React can infinite-loop and blank the page on refresh.
 */
export function usePerformanceGoals(employeeId?: string) {
  const all = useSyncExternalStore(
    subscribePerformanceStore,
    getPerformanceGoals,
    getPerformanceGoals,
  )
  return useMemo(
    () => (employeeId ? all.filter((g) => g.employeeId === employeeId) : all),
    [all, employeeId],
  )
}
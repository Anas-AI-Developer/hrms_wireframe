import { useMemo, useSyncExternalStore } from 'react'
import {
  getEmployeeRequestsSnapshot,
  subscribeEmployeeRequests,
} from '../data/employeeRequestsStore'

/**
 * Subscribe to employee requests with a stable snapshot reference.
 * Scope filtering belongs in useMemo — never inside getSnapshot.
 */
export function useEmployeeRequestsSnapshot(scopedEmployeeIds: Set<string>) {
  const all = useSyncExternalStore(
    subscribeEmployeeRequests,
    getEmployeeRequestsSnapshot,
    getEmployeeRequestsSnapshot,
  )
  const scopeKey = useMemo(
    () => [...scopedEmployeeIds].sort().join(','),
    [scopedEmployeeIds],
  )
  return useMemo(() => {
    if (!scopeKey) return []
    const ids = new Set(scopeKey.split(','))
    return all.filter((r) => ids.has(r.employeeId))
  }, [all, scopeKey])
}

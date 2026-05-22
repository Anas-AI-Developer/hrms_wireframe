import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { LeaveRequest } from '../data/leaveMock'
import {
  addManualLeaveRecord,
  getLeaveRequestsSnapshot,
  subscribeLeaveStore,
  type ManualLeaveInput,
} from '../data/leaveStore'

type LeaveHubValue = {
  requests: LeaveRequest[]
  addManualLeave: (input: ManualLeaveInput) => LeaveRequest
}

const LeaveHubContext = createContext<LeaveHubValue | null>(null)

export function LeaveHubProvider({ children }: { children: ReactNode }) {
  const [requests, setRequests] = useState<LeaveRequest[]>(() => getLeaveRequestsSnapshot())

  useEffect(() => subscribeLeaveStore(() => setRequests(getLeaveRequestsSnapshot())), [])

  const addManualLeave = useCallback(
    (input: ManualLeaveInput) => addManualLeaveRecord(input),
    [],
  )

  const value = useMemo(() => ({ requests, addManualLeave }), [requests, addManualLeave])

  return <LeaveHubContext.Provider value={value}>{children}</LeaveHubContext.Provider>
}

export function useLeaveHub() {
  const ctx = useContext(LeaveHubContext)
  if (!ctx) throw new Error('useLeaveHub must be used within LeaveHubProvider')
  return ctx
}

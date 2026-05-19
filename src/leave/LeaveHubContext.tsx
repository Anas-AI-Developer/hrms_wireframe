import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  leaveRequests as seedRequests,
  type LeaveRequest,
  type LeaveRequestStatus,
} from '../data/leaveMock'

type LeaveHubValue = {
  requests: LeaveRequest[]
  approveRequest: (id: string, note?: string) => void
  rejectRequest: (id: string, note?: string) => void
  cancelRequest: (id: string) => void
}

const LeaveHubContext = createContext<LeaveHubValue | null>(null)

export function LeaveHubProvider({ children }: { children: ReactNode }) {
  const [requests, setRequests] = useState<LeaveRequest[]>(() => [...seedRequests])

  const patchStatus = useCallback((id: string, status: LeaveRequestStatus, note?: string) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status,
              approverNote: note ?? (status === 'approved' ? 'Approved (wireframe)' : 'Rejected (wireframe)'),
            }
          : r,
      ),
    )
  }, [])

  const approveRequest = useCallback(
    (id: string, note?: string) => patchStatus(id, 'approved', note),
    [patchStatus],
  )

  const rejectRequest = useCallback(
    (id: string, note?: string) => patchStatus(id, 'rejected', note),
    [patchStatus],
  )

  const cancelRequest = useCallback((id: string) => patchStatus(id, 'cancelled'), [patchStatus])

  const value = useMemo(
    () => ({ requests, approveRequest, rejectRequest, cancelRequest }),
    [requests, approveRequest, rejectRequest, cancelRequest],
  )

  return <LeaveHubContext.Provider value={value}>{children}</LeaveHubContext.Provider>
}

export function useLeaveHub() {
  const ctx = useContext(LeaveHubContext)
  if (!ctx) throw new Error('useLeaveHub must be used within LeaveHubProvider')
  return ctx
}

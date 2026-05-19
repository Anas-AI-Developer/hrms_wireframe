import type { LeaveRequestStatus } from '../../data/leaveMock'

const TONE: Record<LeaveRequestStatus, 'active' | 'inactive' | 'on_leave'> = {
  approved: 'active',
  pending: 'on_leave',
  rejected: 'inactive',
  cancelled: 'inactive',
}

const LABEL: Record<LeaveRequestStatus, string> = {
  approved: 'Approved',
  pending: 'Pending',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
}

export function LeaveStatusBadge({ status }: { status: LeaveRequestStatus }) {
  return (
    <span className={`hrms-badge hrms-badge--${TONE[status]}${status === 'rejected' ? ' hrms-badge--rejected' : ''}`}>
      {LABEL[status]}
    </span>
  )
}

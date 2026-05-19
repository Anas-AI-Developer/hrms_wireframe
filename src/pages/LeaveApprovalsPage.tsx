import { Navigate } from 'react-router-dom'

/** Legacy route — unified into Leave Management tab. */
export function LeaveApprovalsPage() {
  return <Navigate to="/leave?tab=approvals" replace />
}

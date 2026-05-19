import type { RecordStatus } from '../../types/hrms'

export function StatusBadge({ status }: { status: RecordStatus | string }) {
  const key = status === 'active' ? 'active' : status === 'inactive' ? 'inactive' : 'on_leave'
  const label =
    status === 'active' ? 'Active' : status === 'inactive' ? 'Inactive' : status === 'on_leave' ? 'On leave' : status
  return <span className={`hrms-badge hrms-badge--${key}`}>{label}</span>
}

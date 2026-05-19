import type { AttendanceStatus } from '../../data/attendanceMock'

const TONE: Record<AttendanceStatus, 'active' | 'inactive' | 'on_leave'> = {
  present: 'active',
  absent: 'inactive',
  late: 'on_leave',
  on_leave: 'on_leave',
  half_day: 'on_leave',
}

const LABEL: Record<AttendanceStatus, string> = {
  present: 'Present',
  absent: 'Absent',
  late: 'Late',
  on_leave: 'On leave',
  half_day: 'Half day',
}

export function AttendanceStatusBadge({
  status,
  secondaryJob,
}: {
  status: AttendanceStatus
  secondaryJob?: boolean
}) {
  return (
    <span className="hrms-attendance-status">
      <span className={`hrms-badge hrms-badge--${TONE[status]}`}>{LABEL[status]}</span>
      {secondaryJob ? <span className="hrms-attendance-status__tag">2nd job</span> : null}
    </span>
  )
}

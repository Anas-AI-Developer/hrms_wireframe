import { getEmployees } from './wireframeStore'
import { addDaysIso, WIREFRAME_TODAY } from '../utils/attendanceStats'

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'on_leave' | 'half_day'

export type AttendanceLog = {
  id: string
  employeeId: string
  date: string
  checkIn: string
  checkOut: string
  hoursWorked: number
  status: AttendanceStatus
  source: 'import' | 'manual'
  secondaryJob?: boolean
  note?: string
}

const WORK_DAY_HOURS = 8

const roster = getEmployees()
  .filter((e) => e.status === 'active' && e.employmentType !== 'vacant_post')
  .slice(0, 40)

function pickStatus(employeeIndex: number, dayOffset: number): AttendanceStatus {
  const h = (employeeIndex * 7 + dayOffset * 13) % 100
  if (h < 4) return 'absent'
  if (h < 9) return 'on_leave'
  if (h < 16) return 'late'
  if (h < 19) return 'half_day'
  return 'present'
}

function buildAttendanceLogs(): AttendanceLog[] {
  const logs: AttendanceLog[] = []

  for (let dayOffset = 0; dayOffset < 35; dayOffset++) {
    const date = addDaysIso(WIREFRAME_TODAY, -dayOffset)
    roster.forEach((e, idx) => {
      const status = pickStatus(idx, dayOffset)
      const onLeave = status === 'on_leave' || status === 'absent'
      const late = status === 'late'
      const secondary = idx % 17 === 0 && dayOffset === 0 && status === 'present'

      logs.push({
        id: `att-${e.id}-${date}`,
        employeeId: e.id,
        date,
        checkIn: onLeave ? '—' : late ? '09:22' : '09:00',
        checkOut: onLeave ? '—' : late ? '17:22' : '17:00',
        hoursWorked: status === 'half_day' ? 4 : onLeave ? 0 : WORK_DAY_HOURS,
        status,
        source: dayOffset % 3 === 0 ? 'import' : 'manual',
        ...(secondary ? { secondaryJob: true, note: 'Temp assignment (demo)' } : {}),
        ...(status === 'late' && dayOffset < 3 ? { note: 'Core hours grace (demo)' } : {}),
      })
    })
  }

  return logs
}

export const attendanceLogs: AttendanceLog[] = buildAttendanceLogs()

export function getAttendanceForEmployee(employeeId: string) {
  return attendanceLogs
    .filter((l) => l.employeeId === employeeId)
    .sort((a, b) => b.date.localeCompare(a.date))
}

export function countPresentThisMonth(employeeId: string) {
  return attendanceLogs.filter((l) => l.employeeId === employeeId && l.status === 'present').length
}

export const ATTENDANCE_POLICY = {
  standardHours: WORK_DAY_HOURS,
  coreStart: '09:00',
  coreEnd: '17:00',
  flexibleTiming: false,
  shiftBased: false,
}

export { WIREFRAME_TODAY }

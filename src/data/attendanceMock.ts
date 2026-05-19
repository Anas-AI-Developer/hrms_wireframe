import { employees } from './clientDataset'

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

const filled = employees.filter((e) => e.status === 'active' && e.employmentType !== 'vacant_post')

export const attendanceLogs: AttendanceLog[] = filled.slice(0, 40).flatMap((e, idx) => {
  const day = 12 + (idx % 5)
  const late = idx % 11 === 0
  const secondary = idx % 17 === 0
  return [
    {
      id: `att-${idx}-a`,
      employeeId: e.id,
      date: `2026-04-${String(day).padStart(2, '0')}`,
      checkIn: late ? '09:22' : '09:00',
      checkOut: late ? '17:22' : '17:00',
      hoursWorked: WORK_DAY_HOURS,
      status: late ? 'late' : 'present',
      source: idx % 3 === 0 ? 'import' : 'manual',
      ...(secondary ? { secondaryJob: true, note: 'Temp assignment (demo)' } : {}),
    },
  ]
})

export function getAttendanceForEmployee(employeeId: string) {
  return attendanceLogs.filter((l) => l.employeeId === employeeId)
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

import type { AttendanceLog, AttendanceStatus } from '../data/attendanceMock'

/** Demo “today” aligned with wireframe sample dates (May 2026). */
export const WIREFRAME_TODAY = '2026-05-19'

const ATTENDED: AttendanceStatus[] = ['present', 'late', 'half_day']

export function isAttended(status: AttendanceStatus): boolean {
  return ATTENDED.includes(status)
}

export function addDaysIso(iso: string, delta: number): string {
  const d = new Date(`${iso}T12:00:00`)
  d.setDate(d.getDate() + delta)
  return d.toISOString().slice(0, 10)
}

export function isDateInRange(date: string, from: string, to: string): boolean {
  return date >= from && date <= to
}

export function attendanceRatePercent(logs: AttendanceLog[]): number {
  if (logs.length === 0) return 0
  const ok = logs.filter((l) => isAttended(l.status)).length
  return Math.round((ok / logs.length) * 100)
}

export function logsInLastDays(logs: AttendanceLog[], endDate: string, days: number): AttendanceLog[] {
  const from = addDaysIso(endDate, -(days - 1))
  return logs.filter((l) => isDateInRange(l.date, from, endDate))
}

export function summarizeWorkforceToday(
  headcount: number,
  todayLogs: AttendanceLog[],
): { percent: number; attended: number; total: number } {
  const attended = todayLogs.filter((l) => isAttended(l.status)).length
  const total = headcount
  const percent = total > 0 ? Math.round((attended / total) * 100) : 0
  return { percent, attended, total }
}

export function formatTodayStatus(logs: AttendanceLog[]): string {
  const row = logs[0]
  if (!row) return 'No record'
  if (row.status === 'present') return 'Present'
  if (row.status === 'late') return 'Late'
  if (row.status === 'half_day') return 'Half day'
  if (row.status === 'on_leave') return 'On leave'
  if (row.status === 'absent') return 'Absent'
  return row.status
}

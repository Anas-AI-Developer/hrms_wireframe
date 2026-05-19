import type { LeaveRequest, LeaveRequestStatus, LeaveTypeId } from '../data/leaveMock'
import { addDaysIso, isDateInRange, WIREFRAME_TODAY } from './attendanceStats'

export { WIREFRAME_TODAY }

export function isLeaveActiveOnDate(request: LeaveRequest, date: string): boolean {
  if (request.status !== 'approved') return false
  return isDateInRange(date, request.fromDate, request.toDate)
}

export function summarizeLeaveForScope(requests: LeaveRequest[], headcount: number) {
  const pending = requests.filter((r) => r.status === 'pending')
  const last30From = addDaysIso(WIREFRAME_TODAY, -29)
  const last30 = requests.filter((r) => isDateInRange(r.submittedAt, last30From, WIREFRAME_TODAY))
  const approved30 = last30.filter((r) => r.status === 'approved').length
  const rejected30 = last30.filter((r) => r.status === 'rejected').length
  const onLeaveToday = requests.filter((r) => isLeaveActiveOnDate(r, WIREFRAME_TODAY)).length

  return {
    pendingCount: pending.length,
    approved30,
    rejected30,
    onLeaveToday,
    total30: last30.length,
    headcount,
  }
}

export function isDirectorateHrRole(role: string): boolean {
  return [
    'executive_director',
    'director_general',
    'director',
    'deputy_director',
    'assistant_director',
  ].includes(role)
}

export function filterPendingForApprover(
  requests: LeaveRequest[],
  scopedEmployeeIds: Set<string>,
  role: string,
  actorEmployeeId: string | undefined,
  roster: { id: string; managerId?: string }[],
): LeaveRequest[] {
  const pending = requests.filter((r) => r.status === 'pending' && scopedEmployeeIds.has(r.employeeId))
  if (isDirectorateHrRole(role)) return pending
  if (!actorEmployeeId) return pending
  const reportIds = new Set(roster.filter((e) => e.managerId === actorEmployeeId).map((e) => e.id))
  return pending.filter((r) => reportIds.has(r.employeeId))
}

export type LeaveStatusFilter = LeaveRequestStatus | 'all'
export type LeaveTypeFilter = LeaveTypeId | 'all'

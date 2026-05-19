import type { Employee } from '../types/hrms'
import { employees } from './clientDataset'
import { addDaysIso, WIREFRAME_TODAY } from '../utils/attendanceStats'

export type LeaveTypeId = 'casual' | 'sick' | 'annual' | 'emergency'

export type LeaveRequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'

export type LeaveRequest = {
  id: string
  employeeId: string
  leaveType: LeaveTypeId
  fromDate: string
  toDate: string
  days: number
  reason: string
  status: LeaveRequestStatus
  approverNote?: string
  submittedAt: string
}

export const LEAVE_TYPE_LABELS: Record<LeaveTypeId, string> = {
  casual: 'Casual',
  sick: 'Sick',
  annual: 'Annual',
  emergency: 'Emergency',
}

const roster = employees.filter((e) => e.status === 'active' && e.employmentType !== 'vacant_post')

function pickStatus(i: number): LeaveRequestStatus {
  if (i % 7 === 0) return 'pending'
  if (i % 11 === 0) return 'rejected'
  if (i % 13 === 0) return 'cancelled'
  return 'approved'
}

function buildLeaveRequests(): LeaveRequest[] {
  const types: LeaveTypeId[] = ['casual', 'sick', 'annual', 'emergency']
  const list: LeaveRequest[] = []

  roster.slice(0, 36).forEach((e, i) => {
    const type = types[i % types.length]!
    const status = pickStatus(i)
    const fromOffset = -(i % 20)
    const fromDate = addDaysIso(WIREFRAME_TODAY, fromOffset)
    const days = (i % 4) + 1
    const toDate = addDaysIso(fromDate, days - 1)
    const submittedAt = addDaysIso(fromDate, -2)

    list.push({
      id: `lr-${e.id}-${fromDate}`,
      employeeId: e.id,
      leaveType: type,
      fromDate,
      toDate,
      days,
      reason:
        status === 'pending'
          ? `Pending ${LEAVE_TYPE_LABELS[type]} — awaiting HR/manager (demo)`
          : `${LEAVE_TYPE_LABELS[type]} — ${e.sanctionedPost ?? 'staff'} (demo)`,
      status,
      submittedAt,
      ...(status === 'rejected' ? { approverNote: 'Insufficient balance or peak staffing (demo)' } : {}),
      ...(status === 'approved' && i % 5 === 0
        ? { approverNote: 'Approved by Assistant Director (demo)' }
        : {}),
    })
  })

  // Extra pending queue for HR wireframe
  roster.slice(0, 8).forEach((e, i) => {
    const fromDate = addDaysIso(WIREFRAME_TODAY, 3 + i)
    const toDate = addDaysIso(fromDate, 1)
    list.push({
      id: `lr-pending-${e.id}`,
      employeeId: e.id,
      leaveType: types[i % types.length]!,
      fromDate,
      toDate,
      days: 2,
      reason: 'Upcoming leave — requires directorate approval',
      status: 'pending',
      submittedAt: WIREFRAME_TODAY,
    })
  })

  return list.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))
}

export const leaveRequests: LeaveRequest[] = buildLeaveRequests()

export type LeaveBalance = {
  employeeId: string
  casual: number
  sick: number
  annual: number
  emergency: number
}

export const leaveBalances: LeaveBalance[] = roster.map((e, i) => ({
  employeeId: e.id,
  casual: 10 - (i % 3),
  sick: 8,
  annual: 20 - (i % 5),
  emergency: 5,
}))

export function getLeaveBalance(employeeId: string) {
  return leaveBalances.find((b) => b.employeeId === employeeId)
}

export function getLeaveRequestsForEmployee(employeeId: string) {
  return leaveRequests.filter((r) => r.employeeId === employeeId)
}

export function getPendingLeaveForApprover(managerId: string, roster: Employee[]) {
  const teamIds = new Set(roster.filter((e) => e.managerId === managerId).map((e) => e.id))
  return leaveRequests.filter((r) => r.status === 'pending' && teamIds.has(r.employeeId))
}

export function getScopedLeaveRequests(scopedEmployeeIds: Set<string>) {
  return leaveRequests.filter((r) => scopedEmployeeIds.has(r.employeeId))
}

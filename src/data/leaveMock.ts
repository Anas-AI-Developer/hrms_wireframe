import type { Employee } from '../types/hrms'
import { employees } from './clientDataset'

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

const filled = employees.filter((e) => e.status === 'active' && e.employmentType !== 'vacant_post')

export const leaveRequests: LeaveRequest[] = filled.slice(0, 24).map((e, i) => {
  const types: LeaveTypeId[] = ['casual', 'sick', 'annual', 'emergency']
  const type = types[i % types.length]!
  const status: LeaveRequestStatus =
    i % 5 === 0 ? 'pending' : i % 7 === 0 ? 'rejected' : 'approved'
  return {
    id: `lr-${i + 1}`,
    employeeId: e.id,
    leaveType: type,
    fromDate: `2026-0${(i % 6) + 4}-0${(i % 9) + 1}`,
    toDate: `2026-0${(i % 6) + 4}-0${(i % 9) + 2}`,
    days: (i % 3) + 1,
    reason: `Wireframe ${LEAVE_TYPE_LABELS[type]} request`,
    status,
    submittedAt: `2026-0${(i % 6) + 3}-${10 + i}`,
    ...(status === 'rejected' ? { approverNote: 'Insufficient balance (demo)' } : {}),
  }
})

export type LeaveBalance = {
  employeeId: string
  casual: number
  sick: number
  annual: number
  emergency: number
}

export const leaveBalances: LeaveBalance[] = filled.map((e, i) => ({
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

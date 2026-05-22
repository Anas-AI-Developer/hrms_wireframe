import type { Employee } from '../types/hrms'
import { getEmployees } from './wireframeStore'
import { addDaysIso, WIREFRAME_TODAY } from '../utils/attendanceStats'

export type LeaveTypeId = 'casual' | 'sick' | 'annual' | 'emergency'

export type LeaveRequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'

export type LeaveEntrySource = 'seed' | 'manual'

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
  /** When HR recorded the leave (manual entry). */
  recordedAt?: string
  recordedBy?: string
  entrySource?: LeaveEntrySource
  /** Wireframe: uploaded file name only (e.g. medical certificate). */
  attachmentFileName?: string
}

export const LEAVE_TYPE_LABELS: Record<LeaveTypeId, string> = {
  casual: 'Casual',
  sick: 'Sick',
  annual: 'Annual',
  emergency: 'Emergency',
}

const roster = getEmployees().filter((e) => e.status === 'active' && e.employmentType !== 'vacant_post')

function pickStatus(i: number): LeaveRequestStatus {
  if (i % 17 === 0) return 'cancelled'
  return 'approved'
}

export function buildLeaveSeedRequests(): LeaveRequest[] {
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
      reason: `${LEAVE_TYPE_LABELS[type]} — ${e.sanctionedPost ?? 'staff'} (recorded by HR, demo)`,
      status,
      submittedAt,
      recordedAt: submittedAt,
      recordedBy: 'HR Admin (demo)',
      entrySource: 'seed',
      ...(type === 'sick' && i % 4 === 0
        ? { attachmentFileName: 'medical-certificate.pdf' }
        : {}),
    })
  })

  return list.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))
}

/** @deprecated Use getLeaveRequestsSnapshot() from leaveStore */
export const leaveRequests: LeaveRequest[] = buildLeaveSeedRequests()

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

export function getPendingLeaveForApprover(managerId: string, roster: Employee[]) {
  const teamIds = new Set(roster.filter((e) => e.managerId === managerId).map((e) => e.id))
  return leaveRequests.filter((r) => r.status === 'pending' && teamIds.has(r.employeeId))
}

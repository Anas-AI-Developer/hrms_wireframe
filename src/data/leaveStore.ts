import {
  buildLeaveSeedRequests,
  type LeaveRequest,
  type LeaveTypeId,
} from './leaveMock'

const STORAGE_KEY = 'hrms-wireframe-leave-v2'

export type ManualLeaveInput = {
  employeeId: string
  leaveType: LeaveTypeId
  fromDate: string
  toDate: string
  reason: string
  attachmentFileName?: string
  recordedBy?: string
}

function loadRequests(): LeaveRequest[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return buildLeaveSeedRequests()
    const parsed = JSON.parse(raw) as LeaveRequest[]
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : buildLeaveSeedRequests()
  } catch {
    return buildLeaveSeedRequests()
  }
}

let requests: LeaveRequest[] = loadRequests()
const listeners = new Set<() => void>()

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(requests))
  } catch {
    /* ignore quota */
  }
  listeners.forEach((fn) => fn())
}

export function subscribeLeaveStore(fn: () => void): () => void {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}

export function getLeaveRequestsSnapshot(): LeaveRequest[] {
  return [...requests]
}

export function countLeaveDays(fromDate: string, toDate: string): number {
  const from = new Date(`${fromDate}T12:00:00`)
  const to = new Date(`${toDate}T12:00:00`)
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return 1
  return Math.max(1, Math.round((to.getTime() - from.getTime()) / 86400000) + 1)
}

export function addManualLeaveRecord(input: ManualLeaveInput): LeaveRequest {
  const days = countLeaveDays(input.fromDate, input.toDate)
  const recordedAt = new Date().toISOString().slice(0, 10)
  const entry: LeaveRequest = {
    id: `lr-manual-${Date.now()}`,
    employeeId: input.employeeId,
    leaveType: input.leaveType,
    fromDate: input.fromDate,
    toDate: input.toDate,
    days,
    reason: input.reason.trim(),
    status: 'approved',
    submittedAt: recordedAt,
    recordedAt,
    recordedBy: input.recordedBy,
    entrySource: 'manual',
    ...(input.attachmentFileName
      ? { attachmentFileName: input.attachmentFileName }
      : {}),
  }
  requests = [entry, ...requests]
  persist()
  return entry
}

export function getLeaveRequestsForEmployee(employeeId: string): LeaveRequest[] {
  return requests.filter((r) => r.employeeId === employeeId)
}

export function getScopedLeaveRequests(scopedEmployeeIds: Set<string>): LeaveRequest[] {
  return requests.filter((r) => scopedEmployeeIds.has(r.employeeId))
}

import { buildEssEmployeeRequests } from './essDemoData'
import type { EmployeeRequestTypeId } from './employeeRequestTypes'
import { defaultSubjectForRequestType } from './employeeRequestTypes'
import { getEmployees } from './mock'

export type EmployeeRequestStatus =
  | 'submitted'
  | 'approved'
  | 'rejected'
  | 'cancelled'
  /** @deprecated wireframe demo legacy */
  | 'acknowledged'
  /** @deprecated wireframe demo legacy */
  | 'closed'

export type EmployeeRequest = {
  id: string
  employeeId: string
  requestType: EmployeeRequestTypeId
  subject: string
  details: string
  fromDate: string
  toDate: string
  status: EmployeeRequestStatus
  submittedAt: string
  hrNote?: string
  decidedAt?: string
}

export type NewEmployeeRequestInput = {
  requestType: EmployeeRequestTypeId
  subject?: string
  details: string
  fromDate: string
  toDate: string
}

const STORAGE_KEY = 'hrms-wireframe-employee-requests-v2'

type RequestStore = Record<string, EmployeeRequest[]>

const listeners = new Set<() => void>()

/** Stable array for useSyncExternalStore — replaced only when store changes. */
let allRequestsSnapshot: EmployeeRequest[] = []

function rebuildAllRequestsSnapshot(): EmployeeRequest[] {
  const store = readStore()
  const all: EmployeeRequest[] = []
  for (const emp of getEmployees()) {
    const persisted = store[emp.id] ?? []
    all.push(...mergeDemoRows(emp.id, persisted))
  }
  allRequestsSnapshot = all.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))
  return allRequestsSnapshot
}

/** Cached global list (same reference until subscribe fires). */
export function getEmployeeRequestsSnapshot(): EmployeeRequest[] {
  return allRequestsSnapshot
}

function emit() {
  rebuildAllRequestsSnapshot()
  listeners.forEach((fn) => fn())
}

// Prime snapshot on module load so first getSnapshot is stable.
rebuildAllRequestsSnapshot()

export function subscribeEmployeeRequests(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function readStore(): RequestStore {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) {
      const legacy = sessionStorage.getItem('hrms-wireframe-employee-requests-v1')
      if (legacy) return migrateLegacyStore(JSON.parse(legacy) as LegacyStore)
      return {}
    }
    const parsed = JSON.parse(raw) as RequestStore
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

type LegacyRequest = {
  id: string
  employeeId: string
  subject: string
  details: string
  fromDate: string
  toDate: string
  status: string
  submittedAt: string
}

type LegacyStore = Record<string, LegacyRequest[]>

function inferTypeFromSubject(subject: string): EmployeeRequestTypeId {
  const s = subject.toLowerCase()
  if (s.includes('salary') || s.includes('certificate')) return 'salary_certificate'
  if (s.includes('id card') || s.includes('access')) return 'id_card'
  if (s.includes('shift') || s.includes('duty')) return 'general'
  return 'general'
}

function migrateLegacyStore(legacy: LegacyStore): RequestStore {
  const next: RequestStore = {}
  for (const [empId, list] of Object.entries(legacy)) {
    next[empId] = list.map((r) => ({
      id: r.id,
      employeeId: r.employeeId,
      requestType: inferTypeFromSubject(r.subject),
      subject: r.subject,
      details: r.details,
      fromDate: r.fromDate,
      toDate: r.toDate,
      status: r.status === 'acknowledged' ? 'approved' : r.status === 'closed' ? 'cancelled' : (r.status as EmployeeRequestStatus),
      submittedAt: r.submittedAt,
    }))
  }
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  return next
}

function writeStore(store: RequestStore) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  emit()
}

function normalizeRequest(row: EmployeeRequest): EmployeeRequest {
  if (row.requestType) return row
  return {
    ...row,
    requestType: inferTypeFromSubject(row.subject),
  }
}

function mergeDemoRows(employeeId: string, persisted: EmployeeRequest[]): EmployeeRequest[] {
  const demo = buildEssEmployeeRequests(employeeId)
  const seen = new Set(persisted.map((r) => r.id))
  const merged = [
    ...persisted.map(normalizeRequest),
    ...demo.filter((d) => !seen.has(d.id)),
  ]
  return merged.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))
}

export function getEmployeeRequests(employeeId: string): EmployeeRequest[] {
  if (!employeeId) return []
  const rows = readStore()[employeeId] ?? []
  return mergeDemoRows(employeeId, rows)
}

/** All requests for employees in scope (persisted + demo seed). */
export function getAllEmployeeRequests(scopedEmployeeIds: Set<string>): EmployeeRequest[] {
  if (scopedEmployeeIds.size === 0) return []
  return getEmployeeRequestsSnapshot().filter((r) => scopedEmployeeIds.has(r.employeeId))
}

export function addEmployeeRequest(
  employeeId: string,
  input: NewEmployeeRequestInput,
): EmployeeRequest {
  const subject =
    input.requestType === 'other'
      ? (input.subject?.trim() || 'Other request')
      : (input.subject?.trim() || defaultSubjectForRequestType(input.requestType))

  const entry: EmployeeRequest = {
    id: `er-${Date.now()}`,
    employeeId,
    requestType: input.requestType,
    subject,
    details: input.details.trim(),
    fromDate: input.fromDate,
    toDate: input.toDate,
    status: 'submitted',
    submittedAt: new Date().toISOString().slice(0, 10),
  }
  const store = readStore()
  const list = store[employeeId] ?? []
  store[employeeId] = [entry, ...list]
  writeStore(store)
  return entry
}

function findPersistedRequest(
  requestId: string,
): { employeeId: string; index: number; store: RequestStore } | null {
  const store = readStore()
  for (const [employeeId, list] of Object.entries(store)) {
    const index = list.findIndex((r) => r.id === requestId)
    if (index >= 0) return { employeeId, index, store }
  }
  return null
}

export function updateEmployeeRequestStatus(
  requestId: string,
  status: EmployeeRequestStatus,
  hrNote?: string,
): EmployeeRequest | undefined {
  const hit = findPersistedRequest(requestId)
  if (!hit) return undefined
  const { employeeId, index, store } = hit
  const row = store[employeeId]![index]!
  const updated: EmployeeRequest = {
    ...row,
    status,
    hrNote: hrNote?.trim() || row.hrNote,
    decidedAt: new Date().toISOString().slice(0, 10),
  }
  store[employeeId]![index] = updated
  writeStore(store)
  return updated
}

export const EMPLOYEE_REQUEST_STATUS_LABELS: Record<EmployeeRequestStatus, string> = {
  submitted: 'Pending approval',
  approved: 'Approved',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
  acknowledged: 'Approved',
  closed: 'Cancelled',
}

export function isRequestPending(status: EmployeeRequestStatus): boolean {
  return status === 'submitted'
}

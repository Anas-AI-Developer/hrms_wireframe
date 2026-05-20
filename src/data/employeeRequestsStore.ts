export type EmployeeRequestStatus = 'submitted' | 'acknowledged' | 'closed'

export type EmployeeRequest = {
  id: string
  employeeId: string
  subject: string
  details: string
  fromDate: string
  toDate: string
  status: EmployeeRequestStatus
  submittedAt: string
}

export type NewEmployeeRequestInput = {
  subject: string
  details: string
  fromDate: string
  toDate: string
}

const STORAGE_KEY = 'hrms-wireframe-employee-requests-v1'

type RequestStore = Record<string, EmployeeRequest[]>

function readStore(): RequestStore {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as RequestStore
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function writeStore(store: RequestStore) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(store))
}

export function getEmployeeRequests(employeeId: string): EmployeeRequest[] {
  if (!employeeId) return []
  const rows = readStore()[employeeId] ?? []
  return [...rows].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))
}

export function addEmployeeRequest(
  employeeId: string,
  input: NewEmployeeRequestInput,
): EmployeeRequest {
  const entry: EmployeeRequest = {
    id: `er-${Date.now()}`,
    employeeId,
    subject: input.subject.trim(),
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

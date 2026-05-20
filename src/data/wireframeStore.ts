import type {
  Department,
  Designation,
  Employee,
  EmployeeHistoryEvent,
  EmployeeStatus,
  EmploymentType,
  OrgSection,
  RecordStatus,
} from '../types/hrms'
import {
  cloneBenefitsSeed,
  getDefaultBenefitIdsForType,
  type BenefitDefinition,
  type BenefitType,
  type EmployeeBenefitEnrollment,
} from './benefitsData'
import { assignManagers } from './hierarchy'
import {
  departments as seedDepartments,
  designations as seedDesignations,
  employeeHistory as seedHistory,
  employees as seedEmployees,
  sections as seedSections,
} from './dummyDataset'

const STORAGE_KEY = 'hrms-wireframe-store-v2'

export type WireframeStoreState = {
  departments: Department[]
  designations: Designation[]
  sections: OrgSection[]
  employees: Employee[]
  employeeHistory: EmployeeHistoryEvent[]
  benefitDefinitions: BenefitDefinition[]
  employmentTypeBenefitDefaults: Record<EmploymentType, string[]>
  employeeBenefitEnrollments: EmployeeBenefitEnrollment[]
}

function cloneSeed(): WireframeStoreState {
  return {
    departments: [...seedDepartments],
    designations: [...seedDesignations],
    sections: [...seedSections],
    employees: [...seedEmployees],
    employeeHistory: [...seedHistory],
    ...cloneBenefitsSeed(),
  }
}

function mergeById<T extends { id: string }>(parsed: T[] | undefined, seed: T[]): T[] {
  const list = parsed ?? []
  const byId = new Map(list.map((row) => [row.id, row]))
  for (const row of seed) {
    if (!byId.has(row.id)) byId.set(row.id, row)
  }
  return [...byId.values()]
}

function normalizeState(parsed: Partial<WireframeStoreState>): WireframeStoreState {
  const seed = cloneSeed()
  return {
    departments: mergeById(parsed.departments, seed.departments),
    designations: mergeById(parsed.designations, seed.designations),
    sections: mergeById(parsed.sections, seed.sections),
    employees: mergeById(parsed.employees, seed.employees),
    employeeHistory: mergeById(parsed.employeeHistory, seed.employeeHistory),
    benefitDefinitions: mergeById(parsed.benefitDefinitions, seed.benefitDefinitions),
    employmentTypeBenefitDefaults:
      parsed.employmentTypeBenefitDefaults ?? seed.employmentTypeBenefitDefaults,
    employeeBenefitEnrollments: mergeById(
      parsed.employeeBenefitEnrollments,
      seed.employeeBenefitEnrollments,
    ),
  }
}

function loadState(): WireframeStoreState {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) {
      const legacy = sessionStorage.getItem('hrms-wireframe-store-v1')
      if (legacy) return normalizeState(JSON.parse(legacy) as Partial<WireframeStoreState>)
      return cloneSeed()
    }
    return normalizeState(JSON.parse(raw) as Partial<WireframeStoreState>)
  } catch {
    return cloneSeed()
  }
}

let state: WireframeStoreState = loadState()
const listeners = new Set<() => void>()

function persist() {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* quota / private mode */
  }
}

function commit(next: WireframeStoreState) {
  state = next
  persist()
  listeners.forEach((fn) => fn())
}

export function subscribeWireframeStore(fn: () => void) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function getWireframeStore(): WireframeStoreState {
  return state
}

export function resetWireframeStore() {
  commit(cloneSeed())
}

function nextId(prefix: string, existing: { id: string }[]) {
  const nums = existing
    .map((r) => r.id.match(new RegExp(`^${prefix}(\\d+)$`)))
    .filter(Boolean)
    .map((m) => Number(m![1]))
  const n = nums.length ? Math.max(...nums) + 1 : 1
  return `${prefix}${n}`
}

function reassignEmployees(employees: Employee[]) {
  return assignManagers(employees)
}

export type DepartmentInput = {
  officeId?: string
  name: string
  code: string
  headName?: string
  status: RecordStatus
}

export function addDepartment(input: DepartmentInput): Department {
  const dept: Department = {
    id: nextId('c', state.departments),
    officeId: input.officeId?.trim() || 'o-hq',
    name: input.name.trim(),
    code: input.code.trim().toUpperCase(),
    headName: input.headName?.trim() || '—',
    status: input.status,
    createdAt: new Date().toISOString(),
  }
  commit({ ...state, departments: [...state.departments, dept] })
  return dept
}

export function updateDepartment(id: string, input: DepartmentInput): Department | undefined {
  let updated: Department | undefined
  const departments = state.departments.map((d) => {
    if (d.id !== id) return d
    updated = {
      ...d,
      name: input.name.trim(),
      code: input.code.trim().toUpperCase(),
      headName: input.headName?.trim() || '—',
      status: input.status,
    }
    return updated
  })
  if (!updated) return undefined
  commit({ ...state, departments })
  return updated
}

export function deleteDepartment(id: string) {
  commit({
    ...state,
    departments: state.departments.map((d) =>
      d.id === id ? { ...d, status: 'inactive' as const } : d,
    ),
  })
}

export type DesignationInput = {
  title: string
  grade: string
  departmentId: string
  status: RecordStatus
}

export function addDesignation(input: DesignationInput): Designation {
  const row: Designation = {
    id: nextId('g', state.designations),
    title: input.title.trim(),
    grade: input.grade.trim(),
    departmentId: input.departmentId,
    status: input.status,
    createdAt: new Date().toISOString(),
  }
  commit({ ...state, designations: [...state.designations, row] })
  return row
}

export function updateDesignation(id: string, input: DesignationInput): Designation | undefined {
  let updated: Designation | undefined
  const designations = state.designations.map((g) => {
    if (g.id !== id) return g
    updated = {
      ...g,
      title: input.title.trim(),
      grade: input.grade.trim(),
      departmentId: input.departmentId,
      status: input.status,
    }
    return updated
  })
  if (!updated) return undefined
  commit({ ...state, designations })
  return updated
}

export function deleteDesignation(id: string) {
  commit({
    ...state,
    designations: state.designations.map((g) =>
      g.id === id ? { ...g, status: 'inactive' as const } : g,
    ),
  })
}

export type EmployeeInput = {
  employeeNo: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  departmentId: string
  designationId: string
  managerId?: string
  employmentType: EmploymentType
  status: EmployeeStatus
  joinDate: string
  endDate?: string
  sanctionedPost?: string
  workingAs?: string
  benefitIds?: string[]
}

function replaceEmployeeBenefits(
  enrollments: EmployeeBenefitEnrollment[],
  defaults: Record<EmploymentType, string[]>,
  employeeId: string,
  benefitIds: string[],
  employmentType: EmploymentType,
  enrolledSince: string,
): EmployeeBenefitEnrollment[] {
  const defaultIds = new Set(getDefaultBenefitIdsForType(employmentType, defaults))
  const rest = enrollments.filter((e) => e.employeeId !== employeeId)
  const added: EmployeeBenefitEnrollment[] = []
  for (const benefitId of [...new Set(benefitIds)]) {
    added.push({
      id: nextId('eb', [...rest, ...added]),
      employeeId,
      benefitId,
      source: defaultIds.has(benefitId) ? 'default' : 'additional',
      enrolledSince,
      status: 'active',
    })
  }
  return [...rest, ...added]
}

export function addEmployee(input: EmployeeInput): Employee {
  const maxSerial =
    state.employees.reduce((max, e) => Math.max(max, e.masterSerial ?? 0), 0) + 1
  const dept = state.departments.find((d) => d.id === input.departmentId)
  const desig = state.designations.find((g) => g.id === input.designationId)
  const post = input.sanctionedPost?.trim() || desig?.title || 'Staff'

  const draft: Employee = {
    id: `m-${maxSerial}`,
    employeeNo: input.employeeNo.trim(),
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    email: input.email.trim(),
    phone: input.phone?.trim() || '—',
    departmentId: input.departmentId,
    designationId: input.designationId,
    managerId: input.managerId || undefined,
    employmentType: input.employmentType,
    status: input.status,
    joinDate: input.joinDate || '—',
    endDate: input.endDate?.trim() || '—',
    location: dept?.name ?? '—',
    masterSerial: maxSerial,
    section: 'General',
    sanctionedPost: post,
    workingAs: input.workingAs?.trim() || post,
    actualPost: post,
    bps: desig?.grade.replace(/[^\d]/g, '') || '—',
    modeOfAppointment: 'Regular',
    parentDepartment: 'NAVTTC',
  }

  const benefitIds =
    input.benefitIds ??
    getDefaultBenefitIdsForType(input.employmentType, state.employmentTypeBenefitDefaults)
  const enrolledSince =
    input.joinDate && input.joinDate !== '—' ? input.joinDate : new Date().toISOString().slice(0, 10)
  const employees = reassignEmployees([...state.employees, draft])
  const created = employees.find((e) => e.id === draft.id)!
  commit({
    ...state,
    employees,
    employeeBenefitEnrollments: replaceEmployeeBenefits(
      state.employeeBenefitEnrollments,
      state.employmentTypeBenefitDefaults,
      created.id,
      benefitIds,
      input.employmentType,
      enrolledSince,
    ),
  })
  return created
}

export function updateEmployee(id: string, input: EmployeeInput): Employee | undefined {
  const dept = state.departments.find((d) => d.id === input.departmentId)
  const desig = state.designations.find((g) => g.id === input.designationId)
  const post = input.sanctionedPost?.trim() || desig?.title

  let targetId = id
  const mapped = state.employees.map((e) => {
    if (e.id !== id) return e
    return {
      ...e,
      employeeNo: input.employeeNo.trim(),
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      email: input.email.trim(),
      phone: input.phone?.trim() || e.phone,
      departmentId: input.departmentId,
      designationId: input.designationId,
      managerId: input.managerId || undefined,
      employmentType: input.employmentType,
      status: input.status,
      joinDate: input.joinDate || e.joinDate,
      endDate: input.endDate !== undefined ? input.endDate.trim() || '—' : e.endDate,
      location: dept?.name ?? e.location,
      sanctionedPost: post ?? e.sanctionedPost,
      workingAs: input.workingAs?.trim() || post || e.workingAs,
      actualPost: post ?? e.actualPost,
    }
  })

  const employees = reassignEmployees(mapped)
  const updated = employees.find((e) => e.id === targetId)
  if (!updated) return undefined
  const benefitIds =
    input.benefitIds ??
    getDefaultBenefitIdsForType(input.employmentType, state.employmentTypeBenefitDefaults)
  const enrolledSince =
    input.joinDate && input.joinDate !== '—' ? input.joinDate : updated.joinDate !== '—' ? updated.joinDate : new Date().toISOString().slice(0, 10)
  commit({
    ...state,
    employees,
    employeeBenefitEnrollments: replaceEmployeeBenefits(
      state.employeeBenefitEnrollments,
      state.employmentTypeBenefitDefaults,
      updated.id,
      benefitIds,
      input.employmentType,
      enrolledSince,
    ),
  })
  return updated
}

export function getDepartment(id: string) {
  return state.departments.find((d) => d.id === id)
}

export function getDesignation(id: string) {
  return state.designations.find((d) => d.id === id)
}

export function getEmployee(id: string) {
  return state.employees.find((e) => e.id === id)
}

export function getSection(id: string) {
  return state.sections.find((s) => s.id === id)
}

export function getEmployeeHistory(employeeId: string) {
  return state.employeeHistory.filter((h) => h.employeeId === employeeId)
}

export function getDirectReports(managerId: string) {
  return state.employees.filter((e) => e.managerId === managerId)
}

/** Live arrays for list pages (read on each render via hook). */
export function getDepartments() {
  return state.departments
}

export function getDesignations() {
  return state.designations
}

export function getEmployees() {
  return state.employees
}

export function getSections() {
  return state.sections
}

export function getEmployeeHistoryAll() {
  return state.employeeHistory
}

export type BenefitDefinitionInput = {
  name: string
  type: BenefitType
  description?: string
  employerContribution: string
  status: 'active' | 'inactive'
}

export function getBenefitDefinitions() {
  return state.benefitDefinitions
}

export function getEmploymentTypeBenefitDefaults() {
  return state.employmentTypeBenefitDefaults
}

export function getEmployeeBenefitEnrollments(employeeId?: string) {
  if (!employeeId) return state.employeeBenefitEnrollments
  return state.employeeBenefitEnrollments.filter((e) => e.employeeId === employeeId)
}

export function getEmployeeBenefitIds(employeeId: string): string[] {
  return getEmployeeBenefitEnrollments(employeeId).map((e) => e.benefitId)
}

export function addBenefitDefinition(input: BenefitDefinitionInput): BenefitDefinition {
  const row: BenefitDefinition = {
    id: nextId('ben', state.benefitDefinitions),
    name: input.name.trim(),
    type: input.type,
    description: input.description?.trim() || '—',
    employerContribution: input.employerContribution.trim(),
    status: input.status,
  }
  commit({ ...state, benefitDefinitions: [...state.benefitDefinitions, row] })
  return row
}

export function setEmploymentTypeBenefitDefaults(
  employmentType: EmploymentType,
  benefitIds: string[],
) {
  commit({
    ...state,
    employmentTypeBenefitDefaults: {
      ...state.employmentTypeBenefitDefaults,
      [employmentType]: [...new Set(benefitIds)],
    },
  })
}

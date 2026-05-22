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
  formatOrgPlacementPath,
  getOrgNode,
  legacyDepartmentIdForPlacement,
} from './navttcHqOrganogram'
import { inferOrgPlacementFromEmployee } from './navttcOrgMapping'
import {
  inferOfficeIdFromEmployee,
  locationLabelForOfficeId,
  NAVTTC_HEAD_OFFICE_ID,
} from './navttcOfficeMapping'
import {
  designationsMatchingRoleLevel,
  getRoleLevelById,
  inferRoleLevelId,
  parseBpsFromGrade,
} from './navttcRoleLevels'
import {
  expectedEndDateFromMonths,
  resolveEmployeeDurationMonths,
} from '../utils/serviceDuration'
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

function applyOrgPlacementMigration(employees: Employee[]): Employee[] {
  return employees.map((e) => {
    if (e.orgWingId && e.orgSectionId) return e
    const inferred = inferOrgPlacementFromEmployee(e)
    if (!inferred) return e
    return {
      ...e,
      orgHeadId: inferred.orgHeadId,
      orgWingId: inferred.orgWingId,
      orgSectionId: inferred.orgSectionId,
      orgSubSection1Id: inferred.orgSubSection1Id,
      orgSubSection2Id: inferred.orgSubSection2Id,
    }
  })
}

function applyOfficePlacementMigration(
  employees: Employee[],
  departments: Department[],
): Employee[] {
  return employees.map((e) => {
    const officeId = inferOfficeIdFromEmployee(e, departments)
    const location = locationLabelForOfficeId(officeId)
    if (e.officeId === officeId && e.location === location) return e
    return { ...e, officeId, location }
  })
}

function applyRoleLevelMigration(
  employees: Employee[],
  designations: Designation[],
): Employee[] {
  return employees.map((e) => {
    if (e.roleLevelId) return e
    const des = designations.find((d) => d.id === e.designationId)
    const inferred = inferRoleLevelId(e, des?.title)
    if (!inferred) return e
    const role = getRoleLevelById(inferred)
    return {
      ...e,
      roleLevelId: inferred,
      bps: role ? String(role.bps) : e.bps,
    }
  })
}

function applyServiceDurationMigration(employees: Employee[]): Employee[] {
  return employees.map((e) => {
    const months = resolveEmployeeDurationMonths(e)
    if (months == null) return e
    const endDate =
      e.joinDate && e.joinDate !== '—'
        ? (expectedEndDateFromMonths(e.joinDate, months) ?? e.endDate)
        : e.endDate
    if (e.serviceDurationMonths === months && e.endDate === endDate) return e
    return {
      ...e,
      serviceDurationMonths: months,
      serviceDurationYears: Math.floor(months / 12) || undefined,
      endDate: endDate ?? e.endDate,
    }
  })
}

function normalizeState(parsed: Partial<WireframeStoreState>): WireframeStoreState {
  const seed = cloneSeed()
  const departments = mergeById(parsed.departments, seed.departments)
  const mergedEmployees = mergeById(parsed.employees, seed.employees)
  const employees = applyServiceDurationMigration(
    applyOfficePlacementMigration(
      applyRoleLevelMigration(
        applyOrgPlacementMigration(mergedEmployees),
        mergeById(parsed.designations, seed.designations),
      ),
      departments,
    ),
  )
  return {
    departments,
    designations: mergeById(parsed.designations, seed.designations),
    sections: mergeById(parsed.sections, seed.sections),
    employees,
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
  cnic?: string
  dateOfBirth?: string
  departmentId: string
  officeId?: string
  orgHeadId?: string
  orgWingId?: string
  orgSectionId?: string
  orgSubSection1Id?: string
  orgSubSection2Id?: string
  designationId: string
  roleLevelId?: string
  managerId?: string
  employmentType: EmploymentType
  status: EmployeeStatus
  joinDate: string
  serviceDurationMonths?: number
  serviceDurationYears?: number
  sanctionedPost?: string
  workingAs?: string
  benefitIds?: string[]
  qualification?: string
  specialization?: string
  modeOfAppointment?: string
  domicile?: string
  address?: string
  city?: string
  gender?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
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

function orgFieldsFromInput(input: EmployeeInput) {
  const placement = {
    orgHeadId: input.orgHeadId,
    orgWingId: input.orgWingId,
    orgSectionId: input.orgSectionId,
    orgSubSection1Id: input.orgSubSection1Id,
    orgSubSection2Id: input.orgSubSection2Id,
  }
  const wing = input.orgWingId ? getOrgNode(input.orgWingId) : undefined
  const sectionNode = input.orgSectionId ? getOrgNode(input.orgSectionId) : undefined
  const orgPath =
    input.orgWingId && input.orgSectionId ? formatOrgPlacementPath(placement) : ''
  const departmentId =
    input.orgWingId && input.orgSectionId
      ? legacyDepartmentIdForPlacement({
          orgHeadId: input.orgHeadId!,
          orgWingId: input.orgWingId,
          orgSectionId: input.orgSectionId,
        })
      : input.departmentId
  return {
    departmentId,
    orgPath,
    wingName: wing?.name,
    sectionLabel: sectionNode?.name ?? orgPath,
    placement,
  }
}

function resolveDesignationIdForInput(input: EmployeeInput): string {
  const role = getRoleLevelById(input.roleLevelId)
  if (input.designationId?.trim()) {
    const picked = state.designations.find((d) => d.id === input.designationId.trim())
    if (picked && role && parseBpsFromGrade(picked.grade) === role.bps) {
      return picked.id
    }
    if (picked && !role) return picked.id
  }
  if (!role) return input.designationId?.trim() ?? ''
  const matched = designationsMatchingRoleLevel(role.id, state.designations, {
    departmentId: input.departmentId || undefined,
    officeId: input.officeId,
    departments: state.departments,
  })
  const titleMatch = matched.find(
    (d) => d.title.toLowerCase() === role.title.toLowerCase(),
  )
  return titleMatch?.id ?? matched[0]?.id ?? ''
}

function resolveDurationForInput(input: EmployeeInput): {
  months: number | null
  endDate: string
} {
  let months: number | null = input.serviceDurationMonths ?? null
  if (months == null && input.serviceDurationYears != null) {
    months = input.serviceDurationYears * 12
  }
  const endDate =
    months != null && input.joinDate && input.joinDate !== '—'
      ? (expectedEndDateFromMonths(input.joinDate, months) ?? '—')
      : '—'
  return { months, endDate }
}

export function addEmployee(input: EmployeeInput): Employee {
  const maxSerial =
    state.employees.reduce((max, e) => Math.max(max, e.masterSerial ?? 0), 0) + 1
  const dept = state.departments.find((d) => d.id === input.departmentId)
  const designationId = resolveDesignationIdForInput(input)
  const desig = state.designations.find((g) => g.id === designationId)
  const roleLevel = getRoleLevelById(input.roleLevelId)
  const post = input.sanctionedPost?.trim() || roleLevel?.title || desig?.title || 'Staff'
  const org = orgFieldsFromInput(input)
  const duration = resolveDurationForInput(input)

  const draft: Employee = {
    id: `m-${maxSerial}`,
    employeeNo: input.employeeNo.trim(),
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    email: input.email.trim(),
    phone: input.phone?.trim() || '—',
    cnic: input.cnic?.trim() || undefined,
    dateOfBirth: input.dateOfBirth?.trim() || undefined,
    departmentId: org.departmentId,
    orgHeadId: input.orgHeadId,
    orgWingId: input.orgWingId,
    orgSectionId: input.orgSectionId,
    orgSubSection1Id: input.orgSubSection1Id,
    orgSubSection2Id: input.orgSubSection2Id,
    designationId,
    roleLevelId: input.roleLevelId,
    managerId: input.managerId || undefined,
    employmentType: input.employmentType,
    status: input.status,
    joinDate: input.joinDate || '—',
    serviceDurationMonths: duration.months ?? undefined,
    serviceDurationYears:
      duration.months != null ? Math.floor(duration.months / 12) || undefined : undefined,
    endDate: duration.endDate,
    officeId: input.officeId ?? NAVTTC_HEAD_OFFICE_ID,
    location:
      [input.city?.trim(), input.officeId ? locationLabelForOfficeId(input.officeId) : '']
        .filter(Boolean)
        .join(' · ') ||
      (input.officeId
        ? locationLabelForOfficeId(input.officeId)
        : input.orgWingId
          ? locationLabelForOfficeId(NAVTTC_HEAD_OFFICE_ID)
          : '—'),
    masterSerial: maxSerial,
    section: org.sectionLabel,
    sanctionedPost: post,
    workingAs: input.workingAs?.trim() || post,
    actualPost: post,
    bps: roleLevel ? String(roleLevel.bps) : desig?.grade.replace(/[^\d]/g, '') || '—',
    modeOfAppointment: input.modeOfAppointment?.trim() || 'Regular',
    qualification: input.qualification?.trim() || undefined,
    specialization: input.specialization?.trim() || undefined,
    domicile: input.domicile?.trim() || undefined,
    address: input.address?.trim() || undefined,
    city: input.city?.trim() || undefined,
    gender: input.gender?.trim() || undefined,
    emergencyContactName: input.emergencyContactName?.trim() || undefined,
    emergencyContactPhone: input.emergencyContactPhone?.trim() || undefined,
    parentDepartment: org.wingName ?? dept?.name ?? 'NAVTTC',
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
  const designationId = resolveDesignationIdForInput(input)
  const desig = state.designations.find((g) => g.id === designationId)
  const roleLevel = getRoleLevelById(input.roleLevelId)
  const post = input.sanctionedPost?.trim() || roleLevel?.title || desig?.title
  const org = orgFieldsFromInput(input)
  const duration = resolveDurationForInput(input)
  const centre = state.departments.find((d) => d.id === org.departmentId)

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
      cnic: input.cnic?.trim() || e.cnic,
      dateOfBirth: input.dateOfBirth?.trim() || e.dateOfBirth,
      departmentId: org.departmentId,
      orgHeadId: input.orgHeadId ?? e.orgHeadId,
      orgWingId: input.orgWingId ?? e.orgWingId,
      orgSectionId: input.orgSectionId ?? e.orgSectionId,
      orgSubSection1Id: input.orgSubSection1Id ?? e.orgSubSection1Id,
      orgSubSection2Id: input.orgSubSection2Id ?? e.orgSubSection2Id,
      designationId,
      roleLevelId: input.roleLevelId ?? e.roleLevelId,
      managerId:
        input.managerId !== undefined ? input.managerId || undefined : e.managerId,
      employmentType: input.employmentType,
      status: input.status,
      joinDate: input.joinDate || e.joinDate,
      serviceDurationMonths: duration.months ?? e.serviceDurationMonths,
      serviceDurationYears:
        duration.months != null
          ? Math.floor(duration.months / 12) || undefined
          : e.serviceDurationYears,
      endDate: duration.endDate !== '—' ? duration.endDate : e.endDate,
      officeId: input.officeId ?? e.officeId,
      section: input.orgWingId ? org.sectionLabel || e.section : (centre?.name ?? e.section),
      parentDepartment: input.orgWingId
        ? (org.wingName ?? e.parentDepartment)
        : input.officeId
          ? locationLabelForOfficeId(input.officeId)
          : e.parentDepartment,
      sanctionedPost: post ?? e.sanctionedPost,
      workingAs: input.workingAs?.trim() || post || e.workingAs,
      actualPost: post ?? e.actualPost,
      bps: roleLevel
        ? String(roleLevel.bps)
        : desig?.grade.replace(/[^\d]/g, '') || e.bps,
      modeOfAppointment: input.modeOfAppointment?.trim() || e.modeOfAppointment,
      qualification: input.qualification?.trim() || e.qualification,
      specialization: input.specialization?.trim() || e.specialization,
      domicile: input.domicile?.trim() || e.domicile,
      address: input.address?.trim() || e.address,
      city: input.city?.trim() || e.city,
      gender: input.gender?.trim() || e.gender,
      emergencyContactName: input.emergencyContactName?.trim() || e.emergencyContactName,
      emergencyContactPhone: input.emergencyContactPhone?.trim() || e.emergencyContactPhone,
      location:
        [input.city?.trim(), input.officeId ? locationLabelForOfficeId(input.officeId) : '']
          .filter(Boolean)
          .join(' · ') ||
        (input.officeId
          ? locationLabelForOfficeId(input.officeId)
          : input.orgWingId
            ? locationLabelForOfficeId(NAVTTC_HEAD_OFFICE_ID)
            : e.location),
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

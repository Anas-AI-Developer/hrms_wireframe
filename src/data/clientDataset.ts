import type { Department, Designation, Employee, EmployeeHistoryEvent, OrgSection } from '../types/hrms'
import { assignManagers, mapEmploymentType } from './hierarchy'
import clientRows from './clientMasterList.json'

type Raw = (typeof clientRows)[number]

function str(v: unknown): string {
  if (v == null) return ''
  if (typeof v === 'string') return v.trim()
  return String(v).trim()
}

function excelSerialToIso(n: number): string {
  if (!Number.isFinite(n) || n < 20000 || n > 80000) return ''
  const epoch = Date.UTC(1899, 11, 30)
  const d = new Date(epoch + Math.round(n) * 86400000)
  if (Number.isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)
}

function parsePersonName(raw: string): { firstName: string; lastName: string } {
  const t = raw.trim()
  if (!t || /^vacant$/i.test(t)) return { firstName: 'Vacant', lastName: 'Position' }
  const stripped = t.replace(/^(Mr\.|Ms\.|Mrs\.|Dr\.)\s+/i, '')
  const parts = stripped.split(/\s+/).filter(Boolean)
  if (parts.length === 1) return { firstName: parts[0]!, lastName: '' }
  return { firstName: parts.slice(0, -1).join(' '), lastName: parts[parts.length - 1]! }
}

function centreCode(name: string, idx: number): string {
  const slug = name
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 10)
    .toUpperCase()
  return slug || `C${idx}`
}

function mapStatus(raw: string, vacant: boolean): Employee['status'] {
  const s = raw.toLowerCase()
  if (vacant || s === 'vacant') return 'inactive'
  if (s.includes('leave')) return 'on_leave'
  if (s === 'filled' || s === 'active') return 'active'
  return vacant ? 'inactive' : 'active'
}

const rawList = clientRows as Raw[]

const centreNames = [...new Set(rawList.map((r) => str(r.centre)).filter(Boolean))].sort()

export const departments: Department[] = centreNames.map((name, i) => ({
  id: `c${i + 1}`,
  name,
  code: centreCode(name, i),
  headName: '—',
  status: 'active' as const,
  createdAt: new Date(Date.UTC(2026, 4, 1 + (i % 20), 9 + (i % 8), (i * 7) % 60)).toISOString(),
}))

const deptIdByCentre = new Map(departments.map((d) => [d.name, d.id]))

const sectionKeyToId = new Map<string, string>()
export const sections: OrgSection[] = []

for (const r of rawList) {
  const centre = str(r.centre)
  const sectionName = str(r.section_field) || 'General'
  const deptId = deptIdByCentre.get(centre)
  if (!deptId) continue
  const key = `${deptId}|${sectionName}`
  if (sectionKeyToId.has(key)) continue
  const id = `sec${sectionKeyToId.size + 1}`
  sectionKeyToId.set(key, id)
  sections.push({ id, name: sectionName, departmentId: deptId })
}

const desigKeyToId = new Map<string, string>()
export const designations: Designation[] = []

for (const r of rawList) {
  const centre = str(r.centre)
  const title = str(r.sanctioned_post_designation) || str(r.working_as) || 'Post'
  const bps = r.bps
  const grade = typeof bps === 'number' && bps > 0 ? `BPS ${bps}` : 'BPS —'
  const deptId = deptIdByCentre.get(centre)
  if (!deptId) continue
  const key = `${centre}|${title}|${bps}`
  if (desigKeyToId.has(key)) continue
  const id = `g${desigKeyToId.size + 1}`
  desigKeyToId.set(key, id)
  designations.push({
    id,
    title,
    grade,
    departmentId: deptId,
    status: 'active',
    createdAt: new Date(Date.UTC(2026, 3, 1 + (desigKeyToId.size % 25), 10, 0)).toISOString(),
  })
}

const employeesDraft: Employee[] = rawList.map((r) => {
  const serial = typeof r.s === 'number' ? r.s : Number(r.s)
  const centre = str(r.centre)
  const deptId = deptIdByCentre.get(centre) ?? departments[0]!.id
  const sectionName = str(r.section_field) || 'General'
  const sectionId = sectionKeyToId.get(`${deptId}|${sectionName}`)
  const title = str(r.sanctioned_post_designation) || str(r.working_as) || 'Post'
  const bps = r.bps
  const key = `${centre}|${title}|${bps}`
  const designationId = desigKeyToId.get(key) ?? designations[0]!.id
  const nameRaw = str(r.name) || 'Vacant'
  const { firstName, lastName } = parsePersonName(nameRaw)
  const vacant = str(r.status).toLowerCase() === 'vacant' || nameRaw.toLowerCase() === 'vacant'
  const joinNum = r.date_of_joining_appointment
  const joinDate = typeof joinNum === 'number' ? excelSerialToIso(joinNum) || '—' : '—'
  const mode = str(r.mode_of_appointment)
  const emailLocal = vacant ? `vacant.s${serial}` : `emp.s${serial}`

  return {
    id: `m-${serial}`,
    employeeNo: `EMP-${String(serial).padStart(4, '0')}`,
    firstName: vacant ? 'Vacant' : firstName,
    lastName: vacant ? sectionName || 'Post' : lastName,
    email: `${emailLocal}@navttc.wireframe`,
    phone: '—',
    departmentId: deptId,
    sectionId,
    designationId,
    employmentType: mapEmploymentType(mode),
    status: mapStatus(str(r.status), vacant),
    joinDate,
    location: centre,
    masterSerial: serial,
    section: sectionName,
    sanctionedPost: str(r.sanctioned_post_designation),
    workingAs: str(r.working_as),
    actualPost: str(r.actual_post_designation),
    bps: typeof bps === 'number' ? bps : str(r.bps),
    qualification: str(r.qualification),
    specialization: str(r.specialization),
    modeOfAppointment: mode,
    parentDepartment: str(r.parent_department),
    tenureInNavttc: str(r.tenure_in_navttc),
    domicile: str(r.domicile),
  }
})

export const employees: Employee[] = assignManagers(employeesDraft)

// Department heads from highest leadership post per centre
for (const d of departments) {
  const inCentre = employees.filter(
    (e) => e.departmentId === d.id && e.status === 'active' && !/^vacant$/i.test(e.firstName),
  )
  const ed = inCentre.find((e) => /executive\s*director/i.test(e.sanctionedPost ?? ''))
  const dg = inCentre.find((e) => /director\s*general/i.test(e.sanctionedPost ?? ''))
  const head = ed ?? dg ?? inCentre[0]
  if (head) d.headName = `${head.firstName} ${head.lastName}`.trim()
}

/** Sample history rows for wireframe (full audit log in backend later). */
export const employeeHistory: EmployeeHistoryEvent[] = employees
  .filter((e) => e.masterSerial != null && e.masterSerial <= 8 && e.status === 'active')
  .flatMap((e, i) => [
    {
      id: `hist-${e.id}-1`,
      employeeId: e.id,
      date: '2025-06-01',
      field: 'designation' as const,
      fromLabel: 'Acting post',
      toLabel: e.sanctionedPost ?? '—',
      note: 'Promotion / posting per MasterList',
    },
    ...(i % 2 === 0
      ? [
          {
            id: `hist-${e.id}-2`,
            employeeId: e.id,
            date: '2024-01-15',
            field: 'department' as const,
            fromLabel: 'Previous centre',
            toLabel: e.location,
          },
        ]
      : []),
  ])

export function getDepartment(id: string) {
  return departments.find((d) => d.id === id)
}

export function getDesignation(id: string) {
  return designations.find((d) => d.id === id)
}

export function getEmployee(id: string) {
  return employees.find((e) => e.id === id)
}

export function getSection(id: string) {
  return sections.find((s) => s.id === id)
}

export function getEmployeeHistory(employeeId: string) {
  return employeeHistory.filter((h) => h.employeeId === employeeId)
}

export function getDirectReports(managerId: string) {
  return employees.filter((e) => e.managerId === managerId)
}

export { workbookSheetNames } from './workbookSheets'

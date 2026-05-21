import type { Department, Employee } from '../types/hrms'
import {
  getOfficeById,
  navttcOffices,
  resolveDepartmentOfficeId,
} from './navttcOffices'

export const NAVTTC_HEAD_OFFICE_ID = 'o-hq'

export type OfficeCategory = 'head_office' | 'regional_office'

/** Form-only: empty until user selects a role or office type. */
export type OfficeCategorySelection = OfficeCategory | ''

export const OFFICE_CATEGORY_LABELS: Record<OfficeCategory, string> = {
  head_office: 'Head Office',
  regional_office: 'Regional Office',
}

export type OfficeMappingRow = {
  officeId: string
  code: string
  name: string
  category: OfficeCategory
  city: string
}

const OFFICE_CITIES: Record<string, string> = {
  'o-hq': 'Islamabad',
  'o-ict': 'Islamabad (ICT)',
  'o-lhr': 'Lahore',
  'o-khi': 'Karachi',
  'o-pew': 'Peshawar',
  'o-quetta': 'Quetta',
  'o-coe': 'Islamabad',
}

export const OFFICE_MAPPING_ROWS: OfficeMappingRow[] = navttcOffices.map((o) => ({
  officeId: o.id,
  code: o.code,
  name: o.name,
  category: o.id === NAVTTC_HEAD_OFFICE_ID ? 'head_office' : 'regional_office',
  city: OFFICE_CITIES[o.id] ?? '—',
}))

export const HEAD_OFFICE_MAPPING = OFFICE_MAPPING_ROWS.find(
  (r) => r.officeId === NAVTTC_HEAD_OFFICE_ID,
)! 

export const REGIONAL_OFFICE_MAPPING_ROWS = OFFICE_MAPPING_ROWS.filter(
  (r) => r.category === 'regional_office',
)

export type EmployeeOfficePlacement = {
  category: OfficeCategorySelection
  officeId: string
}

export function officeCategoryFromOfficeId(officeId: string): OfficeCategory {
  return officeId === NAVTTC_HEAD_OFFICE_ID ? 'head_office' : 'regional_office'
}

export function inferOfficeIdFromEmployee(
  emp: Pick<Employee, 'officeId' | 'departmentId' | 'location'>,
  departments: Department[],
): string {
  if (emp.officeId) return emp.officeId
  const dept = departments.find((d) => d.id === emp.departmentId)
  if (dept) return resolveDepartmentOfficeId(dept)
  const loc = (emp.location ?? '').toLowerCase()
  if (/lahore/i.test(loc)) return 'o-lhr'
  if (/karachi/i.test(loc)) return 'o-khi'
  if (/peshawar/i.test(loc)) return 'o-pew'
  if (/quetta/i.test(loc)) return 'o-quetta'
  if (/centre of excellence|coe/i.test(loc)) return 'o-coe'
  if (/regional|field operations/i.test(loc)) return 'o-lhr'
  return NAVTTC_HEAD_OFFICE_ID
}

export function officePlacementFromEmployee(
  emp: Pick<Employee, 'officeId' | 'departmentId' | 'location'>,
  departments: Department[],
): EmployeeOfficePlacement {
  const officeId = inferOfficeIdFromEmployee(emp, departments)
  return {
    category: officeCategoryFromOfficeId(officeId),
    officeId,
  }
}

export function formatOfficePlacement(placement: EmployeeOfficePlacement): string {
  if (!placement.category || !placement.officeId) return ''
  const office = getOfficeById(placement.officeId)
  if (!office) return ''
  return `${OFFICE_CATEGORY_LABELS[placement.category]} · ${office.name} (${office.code})`
}

export function validateOfficePlacement(placement: EmployeeOfficePlacement): string | null {
  if (!placement.category) return 'Select office type, or choose a role first for headquarters posts.'
  if (!placement.officeId) return 'Select an office location.'
  if (placement.category === 'head_office' && placement.officeId !== NAVTTC_HEAD_OFFICE_ID) {
    return 'Head office must be NAVTTC HQs.'
  }
  if (
    placement.category === 'regional_office' &&
    placement.officeId === NAVTTC_HEAD_OFFICE_ID
  ) {
    return 'Select a regional office.'
  }
  if (!getOfficeById(placement.officeId)) return 'Invalid office selection.'
  return null
}

export function locationLabelForOfficeId(officeId: string): string {
  return getOfficeById(officeId)?.name ?? '—'
}

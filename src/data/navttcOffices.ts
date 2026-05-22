import type { Department, NavttcOffice } from '../types/hrms'

export const navttcOffices: NavttcOffice[] = [
  { id: 'o-hq', name: 'NAVTTC HQs', code: 'HQ', status: 'active' },
  { id: 'o-ict', name: 'Regional Office — Islamabad (ICT)', code: 'RO-ICT', status: 'active' },
  { id: 'o-lhr', name: 'Regional Office — Lahore', code: 'RO-LHR', status: 'active' },
  { id: 'o-khi', name: 'Regional Office — Karachi', code: 'RO-KHI', status: 'active' },
  { id: 'o-pew', name: 'Regional Office — Peshawar', code: 'RO-PEW', status: 'active' },
  { id: 'o-quetta', name: 'Regional Office — Quetta', code: 'RO-QTA', status: 'active' },
  { id: 'o-coe', name: 'NAVTTC Centre of Excellence', code: 'COE', status: 'active' },
]

const HQ_OFFICE = 'o-hq'
const LHR_OFFICE = 'o-lhr'

/** Resolve office for legacy departments saved without officeId. */
export function resolveDepartmentOfficeId(department: Department): string {
  if (department.officeId) return department.officeId
  if (department.code === 'RC-LHR' || /regional/i.test(department.name)) {
    return LHR_OFFICE
  }
  return HQ_OFFICE
}

export function getActiveOffices(): NavttcOffice[] {
  return navttcOffices.filter((o) => o.status === 'active')
}

export function getDepartmentsForOffice(
  officeId: string,
  departments: Department[],
): Department[] {
  if (!officeId) return []
  return departments.filter(
    (d) => d.status === 'active' && resolveDepartmentOfficeId(d) === officeId,
  )
}

/** Wireframe default when regional hire has no centre/unit mapping. */
export function defaultDepartmentIdForOffice(
  officeId: string | undefined,
  departments: Department[],
): string {
  if (officeId) {
    const inOffice = getDepartmentsForOffice(officeId, departments)
    if (inOffice[0]?.id) return inOffice[0].id
  }
  const fallback = departments.find((d) => d.status === 'active')
  return fallback?.id ?? 'c1'
}

export function getOfficeById(officeId: string): NavttcOffice | undefined {
  return navttcOffices.find((o) => o.id === officeId)
}

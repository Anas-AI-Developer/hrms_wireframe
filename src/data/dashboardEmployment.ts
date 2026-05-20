import type { Employee, EmploymentType } from '../types/hrms'
import { employmentTypeLabel } from './employmentStats'

/** URL query value for employees list job-type filter. */
export type DashboardJobFilter = 'permanent' | 'deputation' | 'contract' | 'project'

export const DASHBOARD_JOB_FILTER_PARAM = 'jobType'

export const DASHBOARD_JOB_FILTERS: {
  id: DashboardJobFilter
  label: string
  description: string
  types: EmploymentType[]
  icon: string
  tone: 'primary' | 'success' | 'warning' | 'info'
}[] = [
  {
    id: 'permanent',
    label: 'Permanent',
    description: 'Regular NAVTTC appointments',
    types: ['regular'],
    icon: 'ri-shield-user-line',
    tone: 'primary',
  },
  {
    id: 'deputation',
    label: 'Deputation',
    description: 'Posted on deputation to NAVTTC',
    types: ['deputation'],
    icon: 'ri-user-shared-line',
    tone: 'info',
  },
  {
    id: 'contract',
    label: 'Contract',
    description: 'Contingent / contract staff',
    types: ['contingent'],
    icon: 'ri-file-text-line',
    tone: 'warning',
  },
  {
    id: 'project',
    label: 'Project',
    description: 'Project & DPL assignments',
    types: ['short_term_project', 'dpl'],
    icon: 'ri-briefcase-line',
    tone: 'success',
  },
]

const FILLED_TYPES: EmploymentType[] = [
  'regular',
  'deputation',
  'contingent',
  'dpl',
  'short_term_project',
]

export function isFilledEmployee(e: Employee): boolean {
  return FILLED_TYPES.includes(e.employmentType)
}

/** NAVTTC regular staff (excludes deputation and contract/project hires). */
export function isNavttcEmployee(e: Employee): boolean {
  return e.employmentType === 'regular'
}

export function isDeputationEmployee(e: Employee): boolean {
  return e.employmentType === 'deputation'
}

export function matchesJobTypeFilter(e: Employee, filter: DashboardJobFilter): boolean {
  const def = DASHBOARD_JOB_FILTERS.find((f) => f.id === filter)
  if (!def) return true
  return def.types.includes(e.employmentType)
}

export function countJobType(employees: Employee[], filter: DashboardJobFilter): number {
  return employees.filter((e) => isFilledEmployee(e) && matchesJobTypeFilter(e, filter)).length
}

export function jobFilterLabel(filter: DashboardJobFilter): string {
  return DASHBOARD_JOB_FILTERS.find((f) => f.id === filter)?.label ?? filter
}

export function employmentLabelForEmployee(e: Employee): string {
  return employmentTypeLabel(e.employmentType)
}

export type EmployeeDataBreakdown = {
  total: number
  navttc: number
  deputation: number
  contract: number
  project: number
}

/** Headcount buckets shown on the dashboard employee data card (sums to total filled). */
export function getEmployeeDataBreakdown(employees: Employee[]): EmployeeDataBreakdown {
  const filled = employees.filter(isFilledEmployee)
  return {
    total: filled.length,
    navttc: filled.filter(isNavttcEmployee).length,
    deputation: countJobType(filled, 'deputation'),
    contract: countJobType(filled, 'contract'),
    project: countJobType(filled, 'project'),
  }
}

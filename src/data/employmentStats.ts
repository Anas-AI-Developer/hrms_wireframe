import type { EmploymentType } from '../types/hrms'
import { getEmployees } from './wireframeStore'
import {
  CLIENT_EMPLOYMENT_TYPE_COUNTS,
  CLIENT_SANCTIONED_STRENGTH_TOTAL,
  EMPLOYMENT_TYPE_LABELS,
} from './employmentTypes'

export function countByEmploymentType(): Record<EmploymentType, number> {
  const counts = {} as Record<EmploymentType, number>
  for (const e of getEmployees()) {
    counts[e.employmentType] = (counts[e.employmentType] ?? 0) + 1
  }
  return counts
}

export function employmentTypeSummaryRows() {
  const actual = countByEmploymentType()
  return CLIENT_EMPLOYMENT_TYPE_COUNTS.map((row) => ({
    ...row,
    wireframeCount: actual[row.type] ?? 0,
  }))
}

export function employmentTypeLabel(type: EmploymentType): string {
  return EMPLOYMENT_TYPE_LABELS[type] ?? type
}

export function clientSanctionedTotal(): number {
  return CLIENT_SANCTIONED_STRENGTH_TOTAL
}

export function masterListRowTotal(): number {
  return getEmployees().length
}

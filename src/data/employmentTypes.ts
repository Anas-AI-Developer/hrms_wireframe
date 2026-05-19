import type { EmploymentType } from '../types/hrms'

/**
 * Client-reported sanctioned strength (all employment types).
 * MasterList tab: map from column **Mode of Appointment** (`mode_of_appointment` in JSON).
 * That column does not list Contingent/DPL/short-term — see Project - DPL sheet for those hires.
 */
export const CLIENT_SANCTIONED_STRENGTH_TOTAL = 340

/** Client-reported sanctioned post counts (reference; MasterList may differ on vacant rows). */
export const CLIENT_EMPLOYMENT_TYPE_COUNTS: { type: EmploymentType; label: string; count: number }[] = [
  { type: 'regular', label: 'Regular', count: 176 },
  { type: 'deputation', label: 'Deputation', count: 149 },
  { type: 'contingent', label: 'Contingent', count: 9 },
  { type: 'dpl', label: 'DPL', count: 5 },
  { type: 'short_term_project', label: 'Short term / project', count: 1 },
]

export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  regular: 'Regular',
  deputation: 'Deputation',
  contingent: 'Contingent',
  dpl: 'DPL',
  short_term_project: 'Short term / project',
  vacant_post: 'Vacant post',
  unknown: 'Unknown',
}

export const EMPLOYMENT_TYPES_FILTERABLE: EmploymentType[] = [
  'regular',
  'deputation',
  'contingent',
  'dpl',
  'short_term_project',
  'vacant_post',
]

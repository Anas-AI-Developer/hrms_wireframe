import type { EmploymentType } from '../types/hrms'

export type BenefitType = 'allowance' | 'medical' | 'insurance' | 'leave' | 'other'

export type BenefitDefinition = {
  id: string
  name: string
  type: BenefitType
  description: string
  employerContribution: string
  status: 'active' | 'inactive'
}

export type BenefitEnrollmentSource = 'default' | 'additional'

export type EmployeeBenefitEnrollment = {
  id: string
  employeeId: string
  benefitId: string
  source: BenefitEnrollmentSource
  enrolledSince: string
  status: 'active' | 'pending'
}

export const BENEFIT_TYPE_LABELS: Record<BenefitType, string> = {
  allowance: 'Allowance',
  medical: 'Medical',
  insurance: 'Insurance',
  leave: 'Leave',
  other: 'Other',
}

export const EMPLOYMENT_TYPES_FOR_BENEFITS: EmploymentType[] = [
  'regular',
  'deputation',
  'contingent',
  'dpl',
  'short_term_project',
]

export const seedBenefitDefinitions: BenefitDefinition[] = [
  {
    id: 'ben-1',
    name: 'Medical reimbursement',
    type: 'medical',
    description: 'OPD and hospital claims per NAVTTC policy limits.',
    employerContribution: 'As per policy',
    status: 'active',
  },
  {
    id: 'ben-2',
    name: 'Conveyance allowance',
    type: 'allowance',
    description: 'Monthly transport allowance with payroll.',
    employerContribution: 'Fixed monthly',
    status: 'active',
  },
  {
    id: 'ben-3',
    name: 'Group life insurance',
    type: 'insurance',
    description: 'Life cover for employee and dependents.',
    employerContribution: '100% premium',
    status: 'active',
  },
  {
    id: 'ben-4',
    name: 'GP fund contribution',
    type: 'other',
    description: 'General provident fund — employee + employer share.',
    employerContribution: 'Statutory %',
    status: 'active',
  },
  {
    id: 'ben-5',
    name: 'Earned leave encashment',
    type: 'leave',
    description: 'Unused annual leave paid on separation or cycle.',
    employerContribution: 'Per rules',
    status: 'active',
  },
  {
    id: 'ben-6',
    name: 'Housing rent ceiling',
    type: 'allowance',
    description: 'Rent ceiling for BPS-based house rent allowance.',
    employerContribution: 'BPS-linked',
    status: 'active',
  },
  {
    id: 'ben-7',
    name: 'Project hazard allowance',
    type: 'allowance',
    description: 'Field / project duty top-up for short-term staff.',
    employerContribution: 'Fixed % of basic',
    status: 'active',
  },
  {
    id: 'ben-8',
    name: 'Deputation TA/DA',
    type: 'allowance',
    description: 'Travel and daily allowance while on deputation.',
    employerContribution: 'As per TA rules',
    status: 'active',
  },
]

export const seedEmploymentTypeBenefitDefaults: Record<EmploymentType, string[]> = {
  regular: ['ben-1', 'ben-2', 'ben-3', 'ben-4', 'ben-5', 'ben-6'],
  deputation: ['ben-1', 'ben-2', 'ben-8'],
  contingent: ['ben-2', 'ben-7'],
  dpl: ['ben-1', 'ben-2', 'ben-7'],
  short_term_project: ['ben-2', 'ben-7'],
  vacant_post: [],
  unknown: [],
}

export const seedEmployeeBenefitEnrollments: EmployeeBenefitEnrollment[] = [
  {
    id: 'eb-1',
    employeeId: 'm-8',
    benefitId: 'ben-1',
    source: 'default',
    enrolledSince: '2024-07-01',
    status: 'active',
  },
  {
    id: 'eb-2',
    employeeId: 'm-8',
    benefitId: 'ben-2',
    source: 'default',
    enrolledSince: '2024-07-01',
    status: 'active',
  },
  {
    id: 'eb-21',
    employeeId: 'm-21',
    benefitId: 'ben-1',
    source: 'default',
    enrolledSince: '2024-01-08',
    status: 'active',
  },
  {
    id: 'eb-22',
    employeeId: 'm-21',
    benefitId: 'ben-2',
    source: 'default',
    enrolledSince: '2024-01-08',
    status: 'active',
  },
  {
    id: 'eb-32',
    employeeId: 'm-32',
    benefitId: 'ben-1',
    source: 'default',
    enrolledSince: '2015-09-01',
    status: 'active',
  },
  {
    id: 'eb-33',
    employeeId: 'm-32',
    benefitId: 'ben-2',
    source: 'default',
    enrolledSince: '2015-09-01',
    status: 'active',
  },
  {
    id: 'eb-34',
    employeeId: 'm-32',
    benefitId: 'ben-3',
    source: 'additional',
    enrolledSince: '2024-01-01',
    status: 'active',
  },
]

export function cloneBenefitsSeed() {
  return {
    benefitDefinitions: [...seedBenefitDefinitions],
    employmentTypeBenefitDefaults: { ...seedEmploymentTypeBenefitDefaults },
    employeeBenefitEnrollments: [...seedEmployeeBenefitEnrollments],
  }
}

export function getDefaultBenefitIdsForType(
  employmentType: EmploymentType,
  defaults: Record<EmploymentType, string[]>,
): string[] {
  return [...(defaults[employmentType] ?? [])]
}

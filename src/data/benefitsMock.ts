export type BenefitPlan = {
  id: string
  name: string
  type: 'allowance' | 'medical' | 'insurance' | 'other'
  employerContribution: string
  status: 'active' | 'inactive'
}

export type EmployeeBenefit = {
  id: string
  employeeId: string
  planName: string
  enrolledSince: string
  status: 'active' | 'pending'
}

export const benefitPlans: BenefitPlan[] = [
  { id: 'bp-1', name: 'Medical reimbursement', type: 'medical', employerContribution: 'As per policy', status: 'active' },
  { id: 'bp-2', name: 'Conveyance allowance', type: 'allowance', employerContribution: 'Fixed monthly', status: 'active' },
  { id: 'bp-3', name: 'Group life insurance', type: 'insurance', employerContribution: '100% premium', status: 'active' },
]

export const employeeBenefits: EmployeeBenefit[] = [
  { id: 'eb-1', employeeId: 'm-8', planName: 'Medical reimbursement', enrolledSince: '2024-07-01', status: 'active' },
  { id: 'eb-2', employeeId: 'm-8', planName: 'Conveyance allowance', enrolledSince: '2024-07-01', status: 'active' },
]

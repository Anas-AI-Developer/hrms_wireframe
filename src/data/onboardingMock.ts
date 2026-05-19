export type OnboardingStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'

export type OnboardingCase = {
  id: string
  candidateName: string
  jobTitle: string
  department: string
  status: OnboardingStatus
  expectedJoinDate: string
  employeeId?: string
  tasksCompleted: number
  tasksTotal: number
}

export const ONBOARDING_TASKS = [
  'Verify documents (CNIC, degrees)',
  'Medical fitness',
  'Security clearance (if applicable)',
  'Issue appointment letter',
  'Create HRMS employee record',
  'Assign manager & department',
  'IT / email / access',
  'Orientation briefing',
]

export const onboardingCases: OnboardingCase[] = [
  {
    id: 'onb-1',
    candidateName: 'Hina Rafiq',
    jobTitle: 'Data Entry Operator',
    department: 'RO Lahore',
    status: 'in_progress',
    expectedJoinDate: '2026-06-01',
    tasksCompleted: 5,
    tasksTotal: ONBOARDING_TASKS.length,
  },
  {
    id: 'onb-2',
    candidateName: 'Sanaullah Khan',
    jobTitle: 'Assistant Director (Planning)',
    department: 'NAVTTC HQs',
    status: 'pending',
    expectedJoinDate: '2026-06-15',
    tasksCompleted: 1,
    tasksTotal: ONBOARDING_TASKS.length,
  },
  {
    id: 'onb-3',
    candidateName: 'Demo hire (completed)',
    jobTitle: 'Driver',
    department: 'RO Karachi',
    status: 'completed',
    expectedJoinDate: '2026-03-01',
    employeeId: 'm-103',
    tasksCompleted: ONBOARDING_TASKS.length,
    tasksTotal: ONBOARDING_TASKS.length,
  },
]

export function getOnboardingCase(id: string) {
  return onboardingCases.find((o) => o.id === id)
}

export type AppraisalCycle = {
  id: string
  title: string
  startDate: string
  endDate: string
  status: 'draft' | 'open' | 'closed'
}

export type PerformanceGoal = {
  id: string
  employeeId: string
  employeeName: string
  goalTitle: string
  target: string
  selfRating?: string
  managerRating?: string
}

export const appraisalCycles: AppraisalCycle[] = [
  { id: 'ap-2026', title: 'FY 2025–26 Annual', startDate: '2026-01-01', endDate: '2026-06-30', status: 'open' },
  { id: 'ap-2025', title: 'FY 2024–25 Annual', startDate: '2025-01-01', endDate: '2025-06-30', status: 'closed' },
]

export const performanceGoals: PerformanceGoal[] = [
  {
    id: 'pg-1',
    employeeId: 'm-1',
    employeeName: 'Muhammad Aamir Jan',
    goalTitle: 'Organisation-wide HRMS rollout',
    target: 'Phase 1 live by Q2',
    selfRating: '4/5',
    managerRating: '5/5',
  },
  {
    id: 'pg-2',
    employeeId: 'm-8',
    employeeName: 'Demo DEO',
    goalTitle: 'Data quality in regional centre',
    target: '98% roster accuracy',
    selfRating: undefined,
    managerRating: undefined,
  },
  {
    id: 'pg-3',
    employeeId: 'm-12',
    employeeName: 'Staff sample',
    goalTitle: 'Attendance sheet compliance',
    target: 'Monthly import on time',
    selfRating: '3/5',
    managerRating: undefined,
  },
]

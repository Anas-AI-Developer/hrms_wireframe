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
  managerComment?: string
  cycleId?: string
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
    goalTitle: 'Organization-wide HRMS rollout',
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
  {
    id: 'pg-m21-1',
    employeeId: 'm-21',
    employeeName: 'Amar Yasir',
    goalTitle: 'Office correspondence & file management',
    target: 'Same-day dispatch of routine letters',
    selfRating: '4/5',
    managerRating: '4/5',
    managerComment: 'Reliable DMO desk coverage and timely filing.',
    cycleId: 'ap-2026',
  },
  {
    id: 'pg-m21-2',
    employeeId: 'm-21',
    employeeName: 'Amar Yasir',
    goalTitle: 'Meeting support & minute-taking',
    target: 'Accurate minutes within 48 hours',
    selfRating: undefined,
    managerRating: undefined,
    cycleId: 'ap-2026',
  },
  {
    id: 'pg-m21-3',
    employeeId: 'm-21',
    employeeName: 'Amar Yasir',
    goalTitle: 'Inventory of office supplies',
    target: 'Monthly stock report to supervisor',
    selfRating: '3/5',
    managerRating: undefined,
    cycleId: 'ap-2026',
  },
]

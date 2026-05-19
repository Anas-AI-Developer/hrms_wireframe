/** Module catalogue distilled from `HRMS_Developer_Sprint_Guide.docx` (wireframe UI only). */
export type SprintModule = {
  id: string
  title: string
  summary: string
  wireframeStatus: 'live_stub' | 'planned'
}

export type SprintBlock = {
  id: string
  title: string
  weight: string
  goal: string
  modules: SprintModule[]
}

export const sprintCatalog: SprintBlock[] = [
  {
    id: 's1',
    title: 'Sprint 1 — Core foundation',
    weight: '30%',
    goal:
      'Organisation structure, RBAC, and core employee records before any operational module.',
    modules: [
      {
        id: 's1-org',
        title: 'Organisation setup',
        summary: 'Departments, designations (per department), reporting hierarchy via manager_id.',
        wireframeStatus: 'live_stub',
      },
      {
        id: 's1-rbac',
        title: 'Role & permission (RBAC)',
        summary: 'Permission slugs, role-permission matrix, middleware-style route checks.',
        wireframeStatus: 'planned',
      },
      {
        id: 's1-emp',
        title: 'Employee management (core)',
        summary: 'Employee CRUD, profile groups, documents, emergency contacts.',
        wireframeStatus: 'live_stub',
      },
    ],
  },
  {
    id: 's2',
    title: 'Sprint 2 — Operations',
    weight: '30%',
    goal: 'Attendance, leave, recruitment pipeline, and onboarding hand-off into employee records.',
    modules: [
      {
        id: 's2-att',
        title: 'Attendance',
        summary: 'Marking, calendars, policies, query APIs for HR/managers.',
        wireframeStatus: 'planned',
      },
      {
        id: 's2-leave',
        title: 'Leave',
        summary: 'Policies, balances, requests, approvals (ties to hierarchy).',
        wireframeStatus: 'planned',
      },
      {
        id: 's2-rec',
        title: 'Recruitment',
        summary: 'Job postings, candidates, interviews; feeds onboarding.',
        wireframeStatus: 'planned',
      },
      {
        id: 's2-onb',
        title: 'Onboarding',
        summary: 'Pre-join tasks → creation of employee record.',
        wireframeStatus: 'planned',
      },
    ],
  },
  {
    id: 's3',
    title: 'Sprint 3 — Business logic',
    weight: '30%',
    goal: 'Payroll, performance, training, benefits, compliance, and employee self-service (ESS).',
    modules: [
      { id: 's3-pay', title: 'Payroll', summary: 'Runs, payslips, adjustments.', wireframeStatus: 'planned' },
      {
        id: 's3-perf',
        title: 'Performance',
        summary: 'Cycles, goals, appraisals.',
        wireframeStatus: 'planned',
      },
      {
        id: 's3-train',
        title: 'Training',
        summary: 'Catalogue, nominations, completions.',
        wireframeStatus: 'planned',
      },
      {
        id: 's3-ben',
        title: 'Benefits',
        summary: 'Enrollment and allowances.',
        wireframeStatus: 'planned',
      },
      {
        id: 's3-comp',
        title: 'Compliance',
        summary: 'Statutory registers and checks.',
        wireframeStatus: 'planned',
      },
      {
        id: 's3-ess',
        title: 'ESS',
        summary: 'Employee portal: profile, payslip, leave self-service.',
        wireframeStatus: 'planned',
      },
    ],
  },
  {
    id: 's4',
    title: 'Sprint 4 — Polish & reporting',
    weight: '10%',
    goal: 'Cross-module dashboards and reports, QA, bug fixes — no new major modules.',
    modules: [
      {
        id: 's4-r-att',
        title: 'Attendance reports',
        summary: 'Sprint 4 scope — attendance analytics.',
        wireframeStatus: 'planned',
      },
      {
        id: 's4-r-pay',
        title: 'Payroll reports',
        summary: 'Registers and payroll analytics.',
        wireframeStatus: 'planned',
      },
      {
        id: 's4-r-emp',
        title: 'Employee analytics',
        summary: 'Demographics, tenure, headcount trends.',
        wireframeStatus: 'planned',
      },
      {
        id: 's4-dash',
        title: 'Executive dashboard',
        summary: 'Summary widgets across HRMS.',
        wireframeStatus: 'planned',
      },
    ],
  },
]

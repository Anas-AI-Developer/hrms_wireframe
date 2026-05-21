import type { Permission } from './types'

export type PermissionGroup = {
  id: string
  label: string
  permissions: Permission[]
}

const LABELS: Partial<Record<Permission, string>> = {
  'page:dashboard': 'Dashboard',
  'page:dashboard:executive': 'Executive dashboard',
  'page:employees': 'Employees (view)',
  'page:employees:write': 'Employees (create / edit)',
  'page:departments': 'Departments (view)',
  'page:departments:write': 'Departments (create / edit)',
  'page:designations': 'Designations (view)',
  'page:designations:write': 'Designations (create / edit)',
  'page:admin_settings': 'Admin settings',
  'page:rbac': 'Roles & permissions',
  'page:roadmap': 'Roadmap',
  'page:modules': 'Modules catalog',
  'page:organogram': 'Organogram',
  'page:master_data': 'Master data',
  'page:attendance': 'Attendance',
  'page:attendance:import': 'Attendance import',
  'page:leave': 'Leave management',
  'page:leave:approvals': 'Leave approvals queue',
  'page:recruitment': 'Recruitment hub',
  'page:onboarding': 'Onboarding',
  'page:payroll': 'Payroll runs',
  'page:payslip': 'Payslip',
  'page:reports': 'Reports hub',
  'page:reports:attendance': 'Attendance reports',
  'page:reports:payroll': 'Payroll reports',
  'page:reports:employees': 'Employee analytics',
  'page:proposal': 'System proposal',
  'page:performance': 'Performance (view)',
  'page:performance:manage': 'Performance management',
  'page:training': 'Training (view)',
  'page:training:manage': 'Training management',
  'page:benefits': 'Benefits (view)',
  'page:benefits:manage': 'Benefits setup',
  'page:ess_requests': 'ESS requests (self)',
  'page:ess_requests:manage': 'Request management (HR)',
  'page:compliance': 'Compliance (view)',
  'page:compliance:manage': 'Compliance management',
  'employee.view_all': 'View all employees',
  'employee.view_team': 'View team / reports',
  'employee.view_self': 'View own record only',
  'leave.approve': 'Approve leave',
  'leave.request': 'Submit leave requests',
  'payroll.run': 'Run payroll',
  'payroll.view': 'View payroll',
  'performance.appraise': 'Manager appraisal / rating',
  'performance.self_review': 'Self-assessment',
  'training.enroll': 'Enroll in training',
  'benefits.view_self': 'View own benefits',
}

const GROUP_ORDER: { id: string; label: string; match: (p: Permission) => boolean }[] = [
  { id: 'org', label: 'Organization & master data', match: (p) => /^(page:(employees|departments|designations|organogram|master_data)|employee\.)/.test(p) },
  { id: 'hr', label: 'HR operations', match: (p) => /^(page:(attendance|leave|recruitment|onboarding|ess_requests)|leave\.)/.test(p) },
  { id: 'people', label: 'Performance, training & benefits', match: (p) => /^(page:(performance|training|benefits)|performance\.|training\.|benefits\.)/.test(p) },
  { id: 'finance', label: 'Payroll & compliance', match: (p) => /^(page:(payroll|payslip|compliance|reports)|payroll\.)/.test(p) },
  { id: 'admin', label: 'Administration', match: (p) => /^page:(admin_settings|rbac|dashboard|roadmap|modules|proposal)/.test(p) },
]

function humanizePermission(id: Permission): string {
  return (
    LABELS[id] ??
    id
      .replace(/^page:/, '')
      .replace(/:/g, ' · ')
      .replace(/\./g, ' ')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())
  )
}

export function permissionLabel(id: Permission): string {
  return humanizePermission(id)
}

/** Unique permissions in display order, grouped for the matrix UI. */
export function buildPermissionGroups(all: readonly Permission[]): PermissionGroup[] {
  const unique = [...new Set(all)]
  const assigned = new Set<Permission>()
  const groups: PermissionGroup[] = []

  for (const def of GROUP_ORDER) {
    const perms = unique.filter((p) => def.match(p) && !assigned.has(p))
    perms.forEach((p) => assigned.add(p))
    if (perms.length) groups.push({ id: def.id, label: def.label, permissions: perms })
  }

  const rest = unique.filter((p) => !assigned.has(p))
  if (rest.length) {
    groups.push({ id: 'other', label: 'Other', permissions: rest })
  }

  return groups
}

export const ROLE_HEADER_SHORT: Record<string, string> = {
  executive_director: 'Exec. Dir.',
  director_general: 'Dir. General',
  director: 'Director',
  deputy_director: 'Dep. Dir.',
  assistant_director: 'Asst. Dir.',
  assistant_accounts_officer_accounts: 'AAO (Acct)',
  assistant_accounts_officer_finance: 'AAO (Fin)',
  employee: 'Employee',
}

import type { Permission, RoleId } from './types'

const PAGE_READ: Permission[] = [
  'page:dashboard',
  'page:employees',
  'page:departments',
  'page:designations',
  'page:roadmap',
  'page:modules',
  'page:organogram',
  'page:master_data',
]

const HR_MODULES: Permission[] = [
  'page:attendance',
  'page:leave',
  'page:recruitment',
  'page:onboarding',
]

const HR_MANAGEMENT: Permission[] = [
  ...PAGE_READ,
  ...HR_MODULES,
  'page:employees:write',
  'page:departments:write',
  'page:designations:write',
  'employee.view_all',
  'page:attendance',
  'page:attendance:import',
  'page:leave',
  'page:leave:approvals',
  'leave.approve',
  'page:recruitment',
  'page:onboarding',
  'page:reports',
  'page:proposal',
  'page:performance',
  'page:performance:manage',
  'performance.appraise',
  'performance.self_review',
  'page:training',
  'page:training:manage',
  'training.enroll',
  'page:benefits',
  'page:benefits:manage',
  'benefits.view_self',
  'page:compliance',
  'page:compliance:manage',
  'page:reports:attendance',
  'page:reports:employees',
]

const EMPLOYEE_ESS: Permission[] = [
  'page:dashboard',
  'page:employees',
  'employee.view_self',
  'page:attendance',
  'page:leave',
  'leave.request',
  'page:payslip',
  'page:performance',
  'performance.self_review',
  'page:training',
  'training.enroll',
  'page:benefits',
  'benefits.view_self',
]

const ACCOUNTS_FINANCE: Permission[] = [
  ...PAGE_READ,
  'employee.view_all',
  'page:attendance',
  'page:leave',
  'payroll.view',
  'payroll.run',
  'page:payroll',
  'page:reports',
  'page:proposal',
  'page:benefits',
  'page:compliance',
  'page:reports:attendance',
  'page:reports:payroll',
  'page:reports:employees',
]

export const ALL_PERMISSIONS: Permission[] = [
  'page:dashboard',
  'page:employees',
  'page:employees:write',
  'page:departments',
  'page:departments:write',
  'page:designations',
  'page:designations:write',
  'page:admin_settings',
  'page:rbac',
  'page:roadmap',
  'page:modules',
  'page:organogram',
  'page:master_data',
  'page:attendance',
  'page:leave',
  'page:recruitment',
  'page:onboarding',
  'employee.view_all',
  'employee.view_team',
  'employee.view_self',
  'page:attendance',
  'page:attendance:import',
  'page:leave',
  'page:leave:approvals',
  'leave.approve',
  'leave.request',
  'payroll.run',
  'payroll.view',
  'page:payroll',
  'page:payslip',
  'page:recruitment',
  'page:onboarding',
  'page:reports',
  'page:proposal',
  'page:performance',
  'page:performance:manage',
  'performance.appraise',
  'performance.self_review',
  'page:training',
  'page:training:manage',
  'training.enroll',
  'page:benefits',
  'page:benefits:manage',
  'benefits.view_self',
  'page:compliance',
  'page:compliance:manage',
  'page:reports:attendance',
  'page:reports:payroll',
  'page:reports:employees',
  'page:dashboard:executive',
]

/** Role → allowed permissions (client-confirmed matrix). */
export const ROLE_PERMISSIONS: Record<RoleId, readonly Permission[] | readonly ['*']> = {
  executive_director: ['*'],
  director_general: ['*'],
  director: HR_MANAGEMENT,
  deputy_director: HR_MANAGEMENT,
  assistant_director: HR_MANAGEMENT,
  assistant_accounts_officer_accounts: ACCOUNTS_FINANCE,
  assistant_accounts_officer_finance: ACCOUNTS_FINANCE,
  employee: EMPLOYEE_ESS,
}

export function permissionsForRole(role: RoleId): Set<Permission> {
  const raw = ROLE_PERMISSIONS[role]
  if (!raw) return new Set()
  if (raw[0] === '*') return new Set(ALL_PERMISSIONS)
  return new Set(raw as Permission[])
}

export function roleHasPermission(role: RoleId, permission: Permission): boolean {
  return permissionsForRole(role).has(permission)
}

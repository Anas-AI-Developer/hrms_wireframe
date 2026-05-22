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
  'page:reports:attendance',
  'page:reports:employees',
]

const EMPLOYEE_ESS: Permission[] = [
  'page:dashboard',
  'page:employees',
  'employee.view_self',
  'page:attendance',
  'page:leave',
  'page:performance',
  'performance.self_review',
  'page:training',
  'training.enroll',
]

const ACCOUNTS_READONLY: Permission[] = [
  ...PAGE_READ,
  'employee.view_all',
  'page:attendance',
  'page:leave',
  'page:reports',
  'page:reports:attendance',
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
  'page:attendance:import',
  'page:recruitment',
  'page:reports',
  'page:proposal',
  'page:performance',
  'page:performance:manage',
  'performance.appraise',
  'performance.self_review',
  'page:training',
  'page:training:manage',
  'training.enroll',
  'page:reports:attendance',
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
  assistant_accounts_officer_accounts: ACCOUNTS_READONLY,
  assistant_accounts_officer_finance: ACCOUNTS_READONLY,
  employee: EMPLOYEE_ESS,
}

export function permissionsForRole(role: RoleId): Set<Permission> {
  const raw = ROLE_PERMISSIONS[role]
  if (!raw) return new Set()
  if (raw[0] === '*') return new Set(ALL_PERMISSIONS)
  return new Set(raw as readonly Permission[])
}

export function roleHasPermission(role: RoleId, permission: Permission): boolean {
  return permissionsForRole(role).has(permission)
}

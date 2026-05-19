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

const HR_MANAGEMENT: Permission[] = [
  ...PAGE_READ,
  'page:employees:write',
  'page:departments:write',
  'page:designations:write',
  'employee.view_all',
  'leave.approve',
]

const ACCOUNTS_FINANCE: Permission[] = [
  ...PAGE_READ,
  'employee.view_all',
  'payroll.view',
  'payroll.run',
]

const EMPLOYEE_ESS: Permission[] = ['page:dashboard', 'employee.view_self']

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
  'employee.view_all',
  'employee.view_team',
  'employee.view_self',
  'leave.approve',
  'payroll.run',
  'payroll.view',
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
  if (raw[0] === '*') return new Set(ALL_PERMISSIONS)
  return new Set(raw as Permission[])
}

export function roleHasPermission(role: RoleId, permission: Permission): boolean {
  return permissionsForRole(role).has(permission)
}

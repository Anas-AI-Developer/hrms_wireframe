import type { RoleId } from './types'

/** Client-facing role titles (NAVTTC organogram / master data). */
export const ROLE_LABELS: Record<RoleId, string> = {
  executive_director: 'Executive Director',
  director_general: 'Director General',
  director: 'Director',
  deputy_director: 'Deputy Director',
  assistant_director: 'Assistant Director',
  assistant_accounts_officer_accounts: 'Assistant Accounts Officer (Accounts)',
  assistant_accounts_officer_finance: 'Assistant Accounts Officer (Finance)',
  employee: 'Employee',
}

export function userRoleLabel(role: RoleId, designation?: string): string {
  if (role === 'employee' && designation) return `${ROLE_LABELS.employee} · ${designation}`
  return ROLE_LABELS[role]
}

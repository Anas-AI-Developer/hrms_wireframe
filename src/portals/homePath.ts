import { portalIdForRole } from './portalConfig'
import type { RoleId } from '../auth/types'

/** Post-login landing route per role. */
export function homePathForRole(role: RoleId): string {
  if (portalIdForRole(role) === 'employee') return '/ess'
  return '/dashboard'
}

/** Payslip route — ESS vs HR/director payroll view. */
export function payslipPathForRole(role: RoleId): string {
  if (portalIdForRole(role) === 'employee') return '/ess/payslip'
  return '/payslip'
}
